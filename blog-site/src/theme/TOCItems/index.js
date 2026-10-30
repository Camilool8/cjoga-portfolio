import React, {useEffect, useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import {useThemeConfig} from '@docusaurus/theme-common';
import {useFilteredAndTreeifiedTOC} from '@docusaurus/theme-common/internal';

// Ejected from theme-classic for three things:
// - Straight quotes. The toc is extracted before remark-smartypants runs,
//   so its entries keep the straight quotes the headings above them have
//   lost. They are curled here; the values are HTML, so a quote may
//   arrive as an entity. Heading ids are untouched, so #anchors still work.
// - The cert guides' sheet. Each domain is an h3 with an id starting
//   "sheet-" (DomainSheet). Those stay out of the list, so "On this page"
//   stays a list of sections, and out of the highlight, which would
//   otherwise light nothing while the reader is in the sheet.
// - Naming the domain. While the reader is inside a sheet, the desktop
//   list says which domain under the section's own entry (a note, not a
//   row; see custom.css, "Table of contents"). The phone band does the
//   same from currentDomain() below (DocItem/TOC/Mobile), and its open
//   list, read from inside the sheet, also lists the sheet's domains
//   under the section's entry (the `domains` prop; never on desktop).

export const isSheetId = (id) => String(id).startsWith('sheet-');

const QUOTE = "(?:'|&#x27;|&#39;|&apos;)";
const DQUOTE = '(?:"|&quot;|&#x22;|&#34;)';
const curlText = (text) =>
  text
    // it's, won't, isn't; and a closing one after a letter (the docs')
    .replace(new RegExp(`([A-Za-z0-9])${QUOTE}`, 'g'), '$1’')
    .replace(new RegExp(`(^|[\\s(])${QUOTE}`, 'g'), '$1‘')
    .replace(new RegExp(`(^|[\\s(])${DQUOTE}`, 'g'), '$1“')
    .replace(new RegExp(DQUOTE, 'g'), '”');

// Text only: never inside a tag, and never inside <code>, which is
// quoted as typed.
function curl(html) {
  let inCode = 0;
  return String(html)
    .split(/(<[^>]*>)/)
    .map((part) => {
      if (part.startsWith('<')) {
        if (/^<code\b/i.test(part)) inCode += 1;
        else if (/^<\/code>/i.test(part)) inCode = Math.max(0, inCode - 1);
        return part;
      }
      return inCode ? part : curlText(part);
    })
    .join('');
}

function prepare(items) {
  return items
    .filter((item) => !isSheetId(item.id))
    .map((item) => ({
      ...item,
      value: curl(item.value),
      ...(item.children ? {children: prepare(item.children)} : {}),
    }));
}

// The domain's short name: the one the sheet gives it (data-short, as
// its index lists it), else its title without the "#" link, up to the
// dash that starts its detail ("SELinux — contexts, booleans, …" is
// "SELinux"). A long one is cut with an ellipsis where it runs out of
// room.
export function domainName(heading) {
  const short = heading.dataset.short?.trim();
  if (short) return short;
  const copy = heading.cloneNode(true);
  copy.querySelectorAll('.hash-link').forEach((link) => link.remove());
  const text = copy.textContent.replace(/​/g, '').trim();
  return text.split(/\s+[—–]\s+/)[0];
}

const isInTopHalf = (rect) =>
  rect.top > 0 && rect.bottom < window.innerHeight / 2;

// The theme's rule for "the one being read": the first heading at or
// below the offset if it sits in the top half of the screen, else the
// one before it; the last one past the end; null above the first.
export function pickActive(elements, offset) {
  const next = elements.findIndex(
    (el) => el.getBoundingClientRect().top >= offset,
  );
  if (next < 0) return elements[elements.length - 1] ?? null;
  if (isInTopHalf(elements[next].getBoundingClientRect())) {
    return elements[next];
  }
  return elements[next - 1] ?? null;
}

// The phone band's rule: the last heading that has reached `line` (the
// band's bottom edge plus a little), so the band changes over only once
// the previous section's text has gone under it, not while it still
// fills the top half. At the foot of the page, where the last short
// sections can never reach the line, the last heading in the top half
// of the screen counts. Null above the first.
export function pickReading(elements, line) {
  let found = null;
  for (const el of elements) {
    if (el.getBoundingClientRect().top > line) break;
    found = el;
  }
  const {scrollHeight} = document.documentElement;
  if (window.scrollY + window.innerHeight >= scrollHeight - 2) {
    const shown = elements.filter(
      (el) => el.getBoundingClientRect().top < window.innerHeight / 2,
    );
    const last = shown[shown.length - 1];
    if (last && (!found || elements.indexOf(last) > elements.indexOf(found))) {
      found = last;
    }
  }
  return found;
}

// The sheet's domain headings between a section's heading and the next.
export function sheetDomains(section, nextSection) {
  if (!section) return [];
  return Array.from(document.querySelectorAll('h3[id^="sheet-"]')).filter(
    (el) =>
      section.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING &&
      !(
        nextSection &&
        nextSection.compareDocumentPosition(el) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ),
  );
}

// The domain being read, if the section in view holds a sheet and the
// reader is inside it: the sheet's domains between this section's
// heading and the next one's, picked by the same rule as the section
// (`pick`: the theme's on desktop, the band's on phones). Null above the
// first domain and once the sheet has scrolled past the offset.
export function currentDomain(section, nextSection, offset, pick = pickActive) {
  if (!section) return null;
  const domains = sheetDomains(section, nextSection);
  const found = pick(domains, offset);
  if (!found) return null;
  const sheet = found.closest('.domain-sheet') ?? found.parentElement?.parentElement;
  if (sheet && sheet.getBoundingClientRect().bottom < offset) return null;
  return {id: found.id, text: domainName(found)};
}

// The bar's visible bottom edge. With navbar.hideOnScroll the theme
// assumes no bar at all, but here the bar only slides away below 997px
// (custom.css keeps it in place on desktop), so it is measured.
function navbarBottom() {
  const bar = document.querySelector('.navbar');
  return bar ? Math.max(0, bar.getBoundingClientRect().bottom) : 0;
}

// The theme's useTOCHighlight, minus the sheet's headings, plus the
// domain note and aria-current on the entry being read. Links are found
// by class across the document, as the theme does.
function useHighlight(config, setNote) {
  useEffect(() => {
    if (!config) return undefined;
    const {linkClassName, linkActiveClassName, minHeadingLevel, maxHeadingLevel} =
      config;
    const selector = [];
    for (let level = minHeadingLevel; level <= maxHeadingLevel; level += 1) {
      selector.push(`h${level}.anchor`);
    }
    let frame = 0;
    let lastNote = '';
    const update = () => {
      frame = 0;
      const offset = navbarBottom();
      const anchors = Array.from(
        document.querySelectorAll(selector.join()),
      ).filter((el) => !isSheetId(el.id));
      const active = pickActive(anchors, offset);
      const links = Array.from(document.getElementsByClassName(linkClassName));
      links.forEach((link) => {
        // A domain row in the phone list is the phone's own to mark.
        if (isSheetId(decodeURIComponent(link.hash.slice(1)))) return;
        const here =
          Boolean(active) &&
          decodeURIComponent(link.hash.slice(1)) === active.id;
        link.classList.toggle(linkActiveClassName, here);
        if (here) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      const at = active ? anchors.indexOf(active) : -1;
      const domain =
        at < 0 ? null : currentDomain(active, anchors[at + 1], offset);
      const key = domain ? `${active.id}\n${domain.text}` : '';
      if (key !== lastNote) {
        lastNote = key;
        setNote(domain ? {id: active.id, text: domain.text} : null);
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    document.addEventListener('scroll', schedule, {passive: true});
    window.addEventListener('resize', schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [config, setNote]);
}

// The phone list's domains, nested under the section that holds them.
function Domains({domains, linkClassName}) {
  return (
    <ul className="toc-domains">
      {domains.items.map((domain) => (
        <li key={domain.id}>
          <Link to={`#${domain.id}`} className={linkClassName ?? undefined}>
            {domain.text}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Tree({toc, className, linkClassName, note, domains, isChild}) {
  if (!toc.length) return null;
  return (
    <ul className={isChild ? undefined : className}>
      {toc.map((heading) => {
        const noted = note?.id === heading.id;
        return (
          <li key={heading.id} data-toc-note={noted ? '' : undefined}>
            <Link
              to={`#${heading.id}`}
              className={linkClassName ?? undefined}
              // Developer provided the HTML, so assume it's safe.
              dangerouslySetInnerHTML={{__html: heading.value}}
            />
            {/* Seen, not spoken: it changes as the reader scrolls, and
                each domain is a heading of its own. */}
            {noted && (
              <span className="toc-note" aria-hidden="true">
                {note.text}
              </span>
            )}
            {domains?.forId === heading.id && domains.items.length > 0 && (
              <Domains domains={domains} linkClassName={linkClassName} />
            )}
            <Tree
              isChild
              toc={heading.children}
              className={className}
              linkClassName={linkClassName}
              note={note}
              domains={domains}
            />
          </li>
        );
      })}
    </ul>
  );
}

export default function TOCItems({
  toc,
  className = 'table-of-contents table-of-contents__left-border',
  linkClassName = 'table-of-contents__link',
  linkActiveClassName = undefined,
  minHeadingLevel: minHeadingLevelOption,
  maxHeadingLevel: maxHeadingLevelOption,
  domains = null,
}) {
  const themeConfig = useThemeConfig();
  const minHeadingLevel =
    minHeadingLevelOption ?? themeConfig.tableOfContents.minHeadingLevel;
  const maxHeadingLevel =
    maxHeadingLevelOption ?? themeConfig.tableOfContents.maxHeadingLevel;
  const prepared = useMemo(() => prepare(toc), [toc]);
  const tree = useFilteredAndTreeifiedTOC({
    toc: prepared,
    minHeadingLevel,
    maxHeadingLevel,
  });
  const config = useMemo(
    () =>
      linkClassName && linkActiveClassName
        ? {linkClassName, linkActiveClassName, minHeadingLevel, maxHeadingLevel}
        : undefined,
    [linkClassName, linkActiveClassName, minHeadingLevel, maxHeadingLevel],
  );
  const [note, setNote] = useState(null);
  useHighlight(config, setNote);
  return (
    <Tree
      toc={tree}
      className={className}
      linkClassName={linkClassName}
      note={config ? note : null}
      domains={domains}
    />
  );
}
