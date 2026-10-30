import React, {useCallback, useEffect, useId, useRef, useState} from 'react';
import clsx from 'clsx';
import {
  Collapsible,
  ThemeClassNames,
  useCollapsible,
} from '@docusaurus/theme-common';
import {useLocation} from '@docusaurus/router';
import {FiList} from 'react-icons/fi';
import TOCItems, {
  currentDomain,
  domainName,
  isSheetId,
  pickReading,
  sheetDomains,
} from '@theme/TOCItems';
import Mobile from '@theme-original/DocItem/TOC/Mobile';

// The DocItem Layout renders this between the breadcrumbs and the title.
// The DocItem/Content swizzle places it after the page's intro instead
// (placement="intro"), so the Layout's copy renders nothing.
//
// Content also hands over the page's toc (read off the MDX module, as it
// can't call useDoc here), so the phone list can be our own disclosure
// rather than the theme's TOCCollapsible:
// - It is a button with aria-expanded (the APG disclosure pattern); the
//   theme's had no state.
// - The toggle says where the reader is: "On this page · <section>",
//   following the top-level section in view, cut with an ellipsis (in a
//   cert guide's sheet, "On this page · Key commands · SELinux"). Once
//   the reader passes it, the row holds under the bar as a thin band, so
//   that line stays in sight while reading (custom.css, "Table of
//   contents"); on a phone the band drops the visible "On this page" and
//   gives the section the line. The section is part of the button's
//   name, so the name always contains what is seen (WCAG 2.5.3); a name
//   change isn't announced while scrolling, and a screen reader hears
//   the section once, politely, when the list is opened, where the open
//   list marks it with aria-current.
// - Read from inside a cert guide's sheet, the open list also names the
//   sheet's domains (their short names) under "Key commands by domain",
//   the one being read marked, so a reader deep in the sheet can jump to
//   another domain from the band. Elsewhere the list is the sections.
// - Opened in place near the foot of the screen, the page scrolls just
//   enough to bring the list into view, never past the toggle. Opened
//   from the band, the list hangs under it over the text (so nothing in
//   the flow moves) and closes on a pick, on Esc, or when the band lets
//   go.
// - A drawn list glyph leads the row at every width, so the band reads
//   as the page's contents, not as a heading that folds; it is
//   decoration (aria-hidden), the name stays "On this page · …".
// - Arriving from elsewhere (a cold load, a search hit, a shared link)
//   on a fact or a domain of the sheet, the band also names the page,
//   whose title is off-screen: "RHCSA · Pass mark", "RHCSA · Key
//   commands · SELinux". The name is the title's first word (or the
//   page's short_title, when one is handed over). The facts sit above
//   the row, so for a fact the band is pinned under the bar at once, in
//   the room the landing already leaves for it, and a placeholder keeps
//   its place in the flow (a fresh node each way, so nothing shifts). It
//   lets go where the row would stick by itself, or once the reader is
//   back above the facts; in the sheet the page's name goes when the
//   reader leaves the sheet.

// DOMParser builds an inert document: nothing in it loads or runs.
function plain(html) {
  return (
    new DOMParser().parseFromString(String(html), 'text/html').body
      .textContent ?? ''
  ).trim();
}

// The heading as the page sets it (typographer's quotes are applied to
// the rendered text, not to the toc entry), without its "#" link.
function headingText(item) {
  const heading = document.getElementById(item.id);
  if (heading) {
    const copy = heading.cloneNode(true);
    copy.querySelectorAll('.hash-link').forEach((link) => link.remove());
    const text = copy.textContent.replace(/​/g, '').trim();
    if (text) return text;
  }
  return plain(item.value);
}

// With a domain named after it, the section's own "by domain" says it
// twice: "Key commands · SELinux", not "Key commands by domain · SELinux".
function bandSection(text) {
  return text.replace(/\s+by domain$/i, '');
}

// The deepest entry is the one marked: the domain when one is being
// read, else the section.
function markCurrent(list, current) {
  const id = current?.domainId ?? current?.id;
  list.querySelectorAll('a[href^="#"]').forEach((link) => {
    const here = Boolean(id) && link.getAttribute('href') === `#${id}`;
    link.classList.toggle('table-of-contents__link--active', here);
    if (here) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

// How much of the screen the bar covers right now. Below 997px it slides
// away on a scroll down (navbar.hideOnScroll), so this is its visible
// bottom edge, not its height: 0 while it is away.
function navbarBottom() {
  const bar = document.querySelector('.navbar');
  return bar ? Math.max(0, bar.getBoundingClientRect().bottom) : 0;
}

// The band's own top, without the slide that follows the bar (custom.css
// moves the stuck band up by the bar's height while the bar is away).
function untransformedTop(el, style) {
  const shift =
    style.transform && style.transform !== 'none'
      ? new DOMMatrixReadOnly(style.transform).m42
      : 0;
  return el.getBoundingClientRect().top - shift;
}

// Runs `callback` once a frame at most, on scroll and resize, and on
// any of `events` sent to the document.
function useScrollFrame(callback, deps, events = []) {
  useEffect(() => {
    let frame = 0;
    const run = () => {
      frame = 0;
      callback();
    };
    const schedule = () => {
      if (!frame) {
        frame = requestAnimationFrame(run);
      }
    };
    schedule();
    window.addEventListener('scroll', schedule, {passive: true});
    window.addEventListener('resize', schedule);
    events.forEach((type) => document.addEventListener(type, schedule));
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      events.forEach((type) => document.removeEventListener(type, schedule));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// A jump lands a heading 0.75rem under the band (custom.css); the line
// sits a little lower, so a heading just landed on counts as reached.
const READ_SLACK = 24;

// The top-level section being read: the last heading that has reached
// the band's bottom edge (pickReading, in TOCItems), so the band names
// a section once its text is under the band, not while the one before
// still fills the top half of the screen. The desktop list keeps the
// theme's rule. Inside a cert guide's sheet it also names the domain
// being read (currentDomain, by the same rule).
function useCurrentSection(toc, toggleRef) {
  const [current, setCurrent] = useState(null);
  const lastKey = useRef();
  useScrollFrame(() => {
    const sections = toc.filter((item) => !isSheetId(item.id));
    const top = Math.min(...sections.map((item) => item.level));
    const anchors = sections
      .filter((item) => item.level === top)
      .map((item) => ({item, el: document.getElementById(item.id)}))
      .filter(({el}) => el);
    const line =
      navbarBottom() +
      (toggleRef.current?.getBoundingClientRect().height ?? 0) +
      READ_SLACK;
    const reached = pickReading(
      anchors.map(({el}) => el),
      line,
    );
    const found = anchors.find(({el}) => el === reached);
    const at = found ? anchors.indexOf(found) : -1;
    const domain =
      at < 0
        ? null
        : currentDomain(found.el, anchors[at + 1]?.el, line, pickReading);
    const id = found?.item.id;
    const key = `${id}\n${domain?.id ?? ''}`;
    if (key !== lastKey.current) {
      lastKey.current = key;
      setCurrent(
        found
          ? {
              id,
              text: headingText(found.item),
              domain: domain?.text,
              domainId: domain?.id,
              domains: domain
                ? sheetDomains(found.el, anchors[at + 1]?.el).map((el) => ({
                    id: el.id,
                    text: domainName(el),
                  }))
                : null,
            }
          : null,
      );
    }
  }, [toc]);
  return current;
}

// The page's short name: front matter's short_title when handed over,
// else the title's first word ("RHCSA (EX200) guide" is "RHCSA").
function pageName(short) {
  if (short) return String(short).trim();
  const h1 = document.querySelector('article h1');
  if (!h1) return null;
  const copy = h1.cloneNode(true);
  copy.querySelectorAll('.hash-link').forEach((link) => link.remove());
  const first = copy.textContent.replace(/​/g, '').trim().split(/\s+/)[0];
  return first ? first.replace(/[^\p{L}\p{N})]+$/u, '') || null : null;
}

// A fact row's label as seen ("Pass mark"). A shared row stacks its
// labels, and an alias (#fact-pass-mark on a row that starts with
// Duration) names its own line; hidden marks are left out.
function factLabel(el) {
  const row = el.dataset.aliasOf
    ? document.getElementById(el.dataset.aliasOf)
    : el;
  const term = row?.querySelector('dt');
  if (!term) return null;
  const ids = [
    row.id,
    ...Array.from(term.querySelectorAll('[data-alias-of]'), (a) => a.id),
  ];
  const lines = Array.from(term.children).filter(
    (child) => !child.hasAttribute('aria-hidden') && child.textContent.trim(),
  );
  const at = ids.indexOf(el.id);
  if (lines.length > 1 && lines[at]) {
    return lines[at].textContent.replace(/[,\s]+$/, '').trim();
  }
  const copy = term.cloneNode(true);
  copy.querySelectorAll('[aria-hidden]').forEach((n) => n.remove());
  return copy.textContent.trim() || null;
}

// What an arrival from elsewhere landed on, if the band should name the
// page for it: a fact row, or a domain of the sheet.
function arrivalOf(target, short) {
  const el =
    (target.dataset.aliasOf &&
      document.getElementById(target.dataset.aliasOf)) ||
    target;
  const page = pageName(short);
  if (!page) return null;
  if (el.id.startsWith('fact-')) {
    const label = factLabel(target);
    return label ? {kind: 'fact', id: target.id, page, label} : null;
  }
  if (el.matches('.domain-heading') && el.closest('.domain-sheet')) {
    return {kind: 'sheet', id: el.id, page};
  }
  return null;
}

function PhoneTOC({
  toc,
  minHeadingLevel,
  maxHeadingLevel,
  arrival = null,
  onArrivalEnd = () => {},
}) {
  const {collapsed, setCollapsed} = useCollapsible({initialState: true});
  // "flow": opened in place; "band": opened from the stuck band.
  const [mode, setMode] = useState('flow');
  const [stuck, setStuck] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const listId = useId();
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);
  const current = useCurrentSection(toc, buttonRef);
  const openInFlow = !collapsed && mode === 'flow';
  // Pinned under the bar for a fact arrival: where the row was, and its
  // size, for the placeholder and the fixed box.
  const [pin, setPin] = useState(null);
  const pinRef = useRef(null);
  pinRef.current = pin;
  const holdRef = useRef(null);
  const pinnedOnce = useRef(false);
  const refocus = useRef(false);
  const seenInSheet = useRef(false);

  useEffect(() => {
    pinnedOnce.current = false;
    seenInSheet.current = false;
  }, [arrival]);

  const unpin = useCallback(() => {
    const root = rootRef.current;
    refocus.current = Boolean(root?.contains(document.activeElement));
    setPin(null);
    onArrivalEnd();
  }, [onArrivalEnd]);

  // The row is a fresh node each way (keyed on the pin), so focus on it
  // goes over to the new one.
  useEffect(() => {
    if (refocus.current) {
      refocus.current = false;
      buttonRef.current?.focus({preventScroll: true});
    }
  }, [pin]);

  // A fact arrival: once the jump has landed (the row where its margin
  // puts it, the room for the band above it), the band is pinned there.
  // Pinned, it lets go where its own place reaches the bar (from there
  // it sticks by itself, at the same spot), once the reader is back above
  // the facts, or on a change of width.
  useScrollFrame(() => {
    if (arrival?.kind !== 'fact') return;
    const root = rootRef.current;
    const target = document.getElementById(arrival.id);
    if (!root || !target) return;
    const style = getComputedStyle(root);
    const edge = parseFloat(style.top) || 0;
    const pinned = pinRef.current;
    if (!pinned) {
      if (pinnedOnce.current || style.position !== 'sticky') return;
      const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      if (Math.abs(target.getBoundingClientRect().top - margin) > 4) return;
      if (untransformedTop(root, style) <= edge + 0.5) return;
      const rect = root.getBoundingClientRect();
      pinnedOnce.current = true;
      setPin({
        left: rect.left,
        width: rect.width,
        height: root.offsetHeight,
        marginTop: style.marginTop,
      });
      return;
    }
    const hold = holdRef.current;
    if (!hold) return;
    const place = hold.getBoundingClientRect();
    const facts = target.closest('dl') ?? target;
    if (
      place.top <= edge + 0.5 ||
      facts.getBoundingClientRect().top > root.getBoundingClientRect().bottom ||
      Math.abs(place.width - pinned.width) > 1
    ) {
      unpin();
    }
    // The landing's end is sent as an event: a cold load may land without
    // a scroll after this mounts.
  }, [arrival, unpin], [ARRIVE_EVENT]);

  // In the sheet, the page's name goes once the reader leaves the sheet.
  useEffect(() => {
    if (arrival?.kind !== 'sheet' || !current) return;
    if (current.domainId) {
      seenInSheet.current = true;
    } else if (seenInSheet.current) {
      onArrivalEnd();
    }
  }, [arrival, current, onArrivalEnd]);

  // Stuck: the row has reached its sticky edge under the bar. (Open in
  // place, it scrolls away with its list instead; see CSS.) Measured
  // against its own `top`, without the slide, so a bar that is away
  // doesn't read as "not stuck yet". Pinned, it is stuck by definition.
  useScrollFrame(() => {
    const root = rootRef.current;
    if (!root) return;
    if (pinRef.current) {
      setStuck(true);
      return;
    }
    const style = getComputedStyle(root);
    const sticky = style.position === 'sticky';
    const edge = parseFloat(style.top) || 0;
    setStuck(sticky && untransformedTop(root, style) <= edge + 0.5);
    // Again when the pin comes or goes: the row is a new node.
  }, [pin]);

  // The band's list belongs to the band: when the row lets go (the
  // reader scrolled back above it), it closes rather than drop into the
  // flow and push the page.
  useEffect(() => {
    if (!stuck && !collapsed && mode === 'band') {
      setCollapsed(true);
    }
  }, [stuck, collapsed, mode, setCollapsed]);

  const close = useCallback(
    (refocus) => {
      setCollapsed(true);
      setAnnouncement('');
      if (refocus) buttonRef.current?.focus();
    },
    [setCollapsed],
  );

  const onToggle = () => {
    if (collapsed) {
      setMode(stuck ? 'band' : 'flow');
      setAnnouncement(
        current
          ? `Current section: ${current.text}${
              current.domain ? `, ${current.domain}` : ''
            }`
          : '',
      );
      setCollapsed(false);
    } else {
      close(false);
    }
  };

  // From the band: a pick closes the list (the page then scrolls to the
  // section), and Esc closes it back onto the toggle.
  const onListClick = (event) => {
    if (mode === 'band' && event.target.closest('a[href^="#"]')) {
      close(false);
    }
  };
  const onKeyDown = (event) => {
    if (event.key === 'Escape' && !collapsed && mode === 'band') {
      event.stopPropagation();
      close(true);
    }
  };

  // The open list marks the section the toggle names: when the list
  // mounts (a render after it is first opened, inside Collapsible) and
  // whenever the section changes.
  const currentRef = useRef(current);
  currentRef.current = current;
  const setList = useCallback((node) => {
    listRef.current = node;
    if (node) markCurrent(node, currentRef.current);
  }, []);
  useEffect(() => {
    if (listRef.current) markCurrent(listRef.current, current);
  }, [current]);

  // On touch a heading's "#" shows only on what the band names: the
  // section being read and, in a sheet, its domain (data-reading;
  // custom.css, heading anchors). Elsewhere it rests hidden, still there.
  const sectionId = current?.id;
  const domainId = current?.domainId;
  useEffect(() => {
    const marked = [sectionId, domainId]
      .map((id) => id && document.getElementById(id))
      .filter(Boolean);
    marked.forEach((el) => el.setAttribute('data-reading', ''));
    return () => marked.forEach((el) => el.removeAttribute('data-reading'));
  }, [sectionId, domainId]);

  // Once a list opened in place has unfolded: if it runs past the foot
  // of the screen, scroll it up into view, but never so far that the
  // toggle goes under the bar. Opened from the band, the list scrolls
  // inside itself to bring the marked entry into view (a sheet's
  // domains can run past the screen).
  const onTransitionEnd = useCallback(
    (isCollapsed) => {
      const button = buttonRef.current;
      const list = listRef.current;
      if (isCollapsed || !button || !list) return;
      if (mode === 'band') {
        const panel = list.parentElement;
        const marked = list.querySelector('[aria-current]');
        if (!panel || !marked) return;
        const p = panel.getBoundingClientRect();
        const m = marked.getBoundingClientRect();
        if (m.top < p.top || m.bottom > p.bottom) {
          panel.scrollTop += m.top - p.top - (p.height - m.height) / 2;
        }
        return;
      }
      const margin = 16;
      const overflow =
        list.getBoundingClientRect().bottom - (window.innerHeight - margin);
      const room = button.getBoundingClientRect().top - navbarBottom() - margin;
      const delta = Math.min(overflow, room);
      if (delta > 1) {
        const reduce = window.matchMedia(
          '(prefers-reduced-motion: reduce)',
        ).matches;
        window.scrollBy({top: delta, behavior: reduce ? 'instant' : 'smooth'});
      }
    },
    [mode],
  );

  // What the band names: the section (and, in the sheet, the domain)
  // being read; on an arrival from elsewhere, the page first, and for a
  // pinned fact the fact itself.
  let named = current
    ? {
        section: current.domain ? bandSection(current.text) : current.text,
        domain: current.domain,
      }
    : null;
  let page = null;
  if (pin && arrival?.kind === 'fact') {
    page = arrival.page;
    named = {section: arrival.label};
  } else if (arrival?.kind === 'sheet' && current?.domain) {
    page = arrival.page;
  }

  return (
    <>
      {/* The row's place in the flow while it is pinned. */}
      {pin && (
        <div
          ref={holdRef}
          className="toc-mobile__hold"
          aria-hidden="true"
          style={{height: pin.height, marginTop: pin.marginTop}}
        />
      )}
      <div
        key={pin ? 'pinned' : 'flow'}
        ref={rootRef}
        className={clsx(
          ThemeClassNames.docs.docTocMobile,
          'toc-mobile',
          !collapsed && 'toc-mobile--open',
          openInFlow && 'toc-mobile--in-flow',
          // Kept while it folds, so the closing list never enters the flow.
          mode === 'band' && 'toc-mobile--from-band',
          (stuck || pin) && 'toc-mobile--stuck',
          pin && 'toc-mobile--pinned',
        )}
        style={pin ? {left: pin.left, width: pin.width} : undefined}
        onKeyDown={onKeyDown}>
        <button
          ref={buttonRef}
          type="button"
          className="clean-btn toc-mobile__toggle"
          aria-expanded={!collapsed}
          aria-controls={collapsed ? undefined : listId}
          onClick={onToggle}>
          <FiList className="toc-mobile__glyph" aria-hidden="true" />
          <span className="toc-mobile__label">On this page</span>
          {/* Keyed on what is named and whether the row is stuck: on a
              phone each switch also folds the visible label away
              (custom.css), and a fresh node there is a change of
              content, where the same node moving left would be a
              layout shift. */}
          {named && (
            <span
              key={`${named.domain ? 'in-sheet' : 'section'}${
                page ? '-page' : ''
              }${stuck || pin ? '-band' : ''}`}
              className="toc-mobile__current">
              {/* What is named is part of the button's name (WCAG 2.5.3:
                  when the band shows only the section, the name still
                  contains what is seen); the dots are decoration. */}
              <span className="toc-mobile__sep" aria-hidden="true">·</span>
              {page && (
                <>
                  <span className="toc-mobile__page">{page}</span>
                  <span className="toc-mobile__sep" aria-hidden="true">·</span>
                </>
              )}
              <span className="toc-mobile__section">{named.section}</span>
              {named.domain && (
                <>
                  <span className="toc-mobile__sep" aria-hidden="true">·</span>
                  <span className="toc-mobile__domain">{named.domain}</span>
                </>
              )}
            </span>
          )}
        </button>
        <span className="toc-mobile__status" aria-live="polite">
          {announcement}
        </span>
        <Collapsible
          lazy
          className="toc-mobile__panel"
          collapsed={collapsed}
          onCollapseTransitionEnd={onTransitionEnd}>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- delegated from the links */}
          <div id={listId} ref={setList} onClick={onListClick}>
            <TOCItems
              toc={toc}
              minHeadingLevel={minHeadingLevel}
              maxHeadingLevel={maxHeadingLevel}
              domains={
                current?.domains
                  ? {forId: current.id, items: current.domains}
                  : null
              }
            />
          </div>
        </Collapsible>
      </div>
    </>
  );
}

// Arriving on a #hash (a shared link, a search hit, the sheet's index,
// a pick from the list): the jump lands where its scroll-margin says,
// and focus moves to what it landed on, the same way however the reader
// came. It lives here because this renders once per doc page with
// headings, and it owns the band the landing has to clear.
//
// - One rule for how the page gets there: at once. The page has no
//   smooth scroll of its own (custom.css), so a cold load, a search hit
//   from another page and the router's scrollIntoView all jump. Only a
//   short hop within the page, a link to a place at most a screen and a
//   half away, scrolls smoothly (html[data-smooth-hop], set on the click
//   and cleared when the hop ends): long enough to see which way it
//   went, never more than a second of watching the page slide. Reduced
//   motion never scrolls smoothly.
// - A cold load scrolls to the fragment before the page settles: the
//   smooth scroll's end is fixed when it starts, and the sheet's code
//   then re-wraps above the target (DomainSheet's keepWords, and the
//   code blocks the theme remounts once the browser takes over), so it
//   landed a line or two short, under the band. Once the fonts are in,
//   two frames have passed and the scroll has been still for a moment,
//   the landing is checked and, if it is off, made again.
// - Then focus goes to the target (tabindex -1 only now: a heading that
//   is focusable from the start takes the browser's own fragment focus,
//   which cuts the smooth scroll short), so the next Tab continues from
//   it. The ring shows only when the reader came by keyboard; any other
//   arrival focuses quietly (html[data-quiet-focus] for that focus). An
//   alias (an old anchor, a fact's second label: data-alias-of) hands
//   focus to what it stands for. The target then gets a
//   "handbook:arrive" event, which the sheet and the exam facts turn
//   into their arrival tint, seen once the page is still. (Not on Back
//   or Forward: that is a return, not an arrival.)
// - The reader comes first: a touch, a wheel or a key before it settles
//   cancels the check and the focus.
// - The landing clears the band, and the bar only while the bar shows.
//   A jump down hides the bar (navbar.hideOnScroll), so a tap on a link
//   to a place further down clears the band alone (html[data-jump] until
//   the check, custom.css); the check then reads the margin for the bar
//   as it is, so the previous domain no longer shows under the band.
// - Arriving from elsewhere (a cold load, a search hit from another
//   page, a shared link), the bar stays: the theme hides it on any jump
//   (navbar.hideOnScroll reads the jump as a scroll down), which left
//   nothing on screen naming the site or the page. html[data-bar-hold]
//   keeps it (custom.css) until the reader scrolls; their own scroll then
//   hides or shows it as before. A jump within the page still hides it.
// - Back and Forward go back to where the reader was on that entry, not
//   to the fragment's heading (the theme scrolls a #hash into view on
//   every location change, so Back from a domain put the reader on the
//   index's label rather than where they had read to). Positions are
//   kept per history entry through the Navigation API; without it, Back
//   lands on the heading as before.
const IDLE_MS = 160;
const SETTLE_MAX_MS = 3000;
const CANCEL = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
const FAR_SCREENS = 1.5;
const HOP_MAX_MS = 1200;
export const ARRIVE_EVENT = 'handbook:arrive';
let lastInput = null;
// The page the reader is on, and the history entry they entered it by:
// an arrival on that entry came from elsewhere.
let shownPath = null;
let enteredKey = null;
const positions = new Map();
let restore = null;
let hopTimer = 0;

function endHop() {
  clearTimeout(hopTimer);
  window.removeEventListener('scrollend', endHop);
  document.documentElement.removeAttribute('data-smooth-hop');
}

if (typeof window !== 'undefined') {
  const note = (kind) => () => {
    lastInput = kind;
  };
  window.addEventListener('keydown', note('key'), true);
  window.addEventListener('pointerdown', note('pointer'), true);

  // Before the browser starts the jump, so its end is set for the bar
  // that will be away, and its pace for the distance.
  document.addEventListener(
    'click',
    (event) => {
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const link = event.target.closest?.('a[href*="#"]');
      if (!link || link.pathname !== window.location.pathname) return;
      const target = link.hash
        ? document.getElementById(decodeURIComponent(link.hash.slice(1)))
        : null;
      if (!target) return;
      const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      const distance = target.getBoundingClientRect().top - margin;
      const html = document.documentElement;
      if (distance > 2) {
        html.setAttribute('data-jump', 'down');
      }
      endHop();
      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      if (!reduce && Math.abs(distance) <= window.innerHeight * FAR_SCREENS) {
        html.setAttribute('data-smooth-hop', '');
        window.addEventListener('scrollend', endHop);
        hopTimer = setTimeout(endHop, HOP_MAX_MS);
      }
    },
    true,
  );

  const nav = window.navigation;
  nav?.addEventListener('navigate', (event) => {
    if (nav.currentEntry) positions.set(nav.currentEntry.key, window.scrollY);
    restore = null;
    if (event.navigationType === 'traverse' && event.destination.sameDocument) {
      const y = positions.get(event.destination.key);
      if (y != null) restore = {url: event.destination.url, y};
    }
  });
}

// Where a Back or Forward to this URL should land, once.
function takeRestore() {
  const found = restore?.url === window.location.href ? restore.y : null;
  restore = null;
  return found;
}

// Until the landing check, an arrival that jumped holds the target where
// the jump put it. The page above it still changes height as it settles
// (code blocks remount, the sheet regroups its words), and each change
// would otherwise move what the reader is looking at, under the bar or
// the band, for the check to put back a moment later. Each drift is
// undone before the frame paints (a ResizeObserver on the page, and on
// each scroll), against the margin the jump used, so the bar sliding
// away midway doesn't start a chase; the check settles the rest. Not
// during a short hop's glide, and a reader's touch, wheel or key ends it.
const HOLD_MAX = 8;

function holdPlace(target) {
  const html = document.documentElement;
  const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  let fixes = 0;
  const fix = () => {
    if (fixes >= HOLD_MAX || html.hasAttribute('data-smooth-hop')) return;
    const delta = target.getBoundingClientRect().top - margin;
    if (Math.abs(delta) > 2) {
      fixes += 1;
      window.scrollBy({top: delta, behavior: 'instant'});
    }
  };
  const observer =
    typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(fix);
  observer?.observe(document.body);
  window.addEventListener('scroll', fix, {passive: true});
  const release = () => {
    observer?.disconnect();
    window.removeEventListener('scroll', fix);
    CANCEL.forEach((type) =>
      window.removeEventListener(type, release, {capture: true}),
    );
  };
  CANCEL.forEach((type) =>
    window.addEventListener(type, release, {capture: true, passive: true}),
  );
  return release;
}

function arriveAt(target, restoreY = null, release = () => {}) {
  let done = false;
  let idle = 0;
  let cap = 0;
  let tries = 0;
  // Where focus and the tint go: an alias stands for its element.
  const focusTarget =
    (target.dataset.aliasOf &&
      document.getElementById(target.dataset.aliasOf)) ||
    target;
  const stop = () => {
    done = true;
    release();
    endHop();
    document.documentElement.removeAttribute('data-jump');
    clearTimeout(idle);
    clearTimeout(cap);
    window.removeEventListener('scroll', onScroll);
    CANCEL.forEach((type) =>
      window.removeEventListener(type, stop, {capture: true}),
    );
  };
  const land = () => {
    if (done) return;
    // The jump is over: from here the margin follows the bar as it is,
    // and a correction goes at once.
    release();
    endHop();
    document.documentElement.removeAttribute('data-jump');
    const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    const delta =
      restoreY == null
        ? target.getBoundingClientRect().top - margin
        : restoreY - window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const room = delta < 0 ? window.scrollY > 0 : window.scrollY < max - 1;
    if (Math.abs(delta) > 2 && room && tries < 2) {
      tries += 1;
      window.scrollBy({top: delta});
      onScroll();
      return;
    }
    stop();
    if (restoreY == null) {
      focusTarget.dispatchEvent(new CustomEvent(ARRIVE_EVENT, {bubbles: true}));
    }
    const el = focusTarget;
    if (document.activeElement === el) return;
    if (!el.hasAttribute('tabindex')) {
      el.setAttribute('tabindex', '-1');
      el.addEventListener('blur', () => el.removeAttribute('tabindex'), {
        once: true,
      });
    }
    const html = document.documentElement;
    html.toggleAttribute('data-quiet-focus', lastInput !== 'key');
    el.addEventListener('blur', () => html.removeAttribute('data-quiet-focus'), {
      once: true,
    });
    el.focus({preventScroll: true});
  };
  function onScroll() {
    clearTimeout(idle);
    idle = setTimeout(land, IDLE_MS);
  }
  window.addEventListener('scroll', onScroll, {passive: true});
  CANCEL.forEach((type) =>
    window.addEventListener(type, stop, {capture: true, passive: true}),
  );
  cap = setTimeout(() => {
    clearTimeout(idle);
    land();
  }, SETTLE_MAX_MS);
  onScroll();
  return stop;
}

// Keeps the bar in place (html[data-bar-hold]) until the reader scrolls:
// their wheel, touch or key arms it, and the scroll that follows lets it
// go, so the theme's own rule for that scroll (down hides, up shows)
// takes over from there.
const SCROLL_INPUT = ['wheel', 'touchmove', 'keydown', 'pointerdown'];

function holdBar() {
  const html = document.documentElement;
  html.setAttribute('data-bar-hold', '');
  let armed = false;
  const arm = () => {
    armed = true;
  };
  const onScroll = () => {
    if (armed) release();
  };
  function release() {
    html.removeAttribute('data-bar-hold');
    window.removeEventListener('scroll', onScroll);
    SCROLL_INPUT.forEach((type) =>
      window.removeEventListener(type, arm, {capture: true}),
    );
  }
  window.addEventListener('scroll', onScroll, {passive: true});
  SCROLL_INPUT.forEach((type) =>
    window.addEventListener(type, arm, {capture: true, passive: true}),
  );
  return release;
}

function useHashArrival(enabled, onArrival, shortTitle) {
  const {pathname, hash, key} = useLocation();
  // A page left and come back to is entered again.
  useEffect(
    () => () => {
      if (enabled) shownPath = null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  useEffect(() => {
    if (!enabled) return undefined;
    if (shownPath !== pathname) {
      shownPath = pathname;
      enteredKey = key;
    }
    const fromElsewhere = enteredKey === key;
    // Back or Forward: at once, which also stops the theme's smooth
    // scroll to the heading, then held there while the page settles.
    const restoreY = takeRestore();
    if (restoreY != null) {
      window.scrollTo({top: restoreY, behavior: 'instant'});
    }
    const target = hash
      ? document.getElementById(decodeURIComponent(hash.slice(1)))
      : null;
    const arrived = fromElsewhere && restoreY == null && target;
    onArrival(arrived ? arrivalOf(target, shortTitle) : null);
    if (!target) return undefined;
    const releaseBar = arrived ? holdBar() : () => {};
    let stop = null;
    let cancelled = false;
    // Held only where the jump has landed it (not a return, not a glide
    // still on its way).
    const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    const landed =
      restoreY == null &&
      Math.abs(target.getBoundingClientRect().top - margin) <= 2;
    const release = landed ? holdPlace(target) : () => {};
    const fonts = document.fonts?.ready ?? Promise.resolve();
    fonts.then(() =>
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (!cancelled) stop = arriveAt(target, restoreY, release);
        }),
      ),
    );
    return () => {
      cancelled = true;
      releaseBar();
      release();
      stop?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, hash, key]);
}

export default function MobileWrapper({
  placement,
  toc,
  minHeadingLevel,
  maxHeadingLevel,
  shortTitle,
  ...props
}) {
  const [arrival, setArrival] = useState(null);
  const endArrival = useCallback(() => setArrival(null), []);
  useHashArrival(placement === 'intro', setArrival, shortTitle);
  if (placement !== 'intro') {
    return null;
  }
  if (!Array.isArray(toc) || toc.length === 0) {
    return <Mobile {...props} />;
  }
  return (
    <PhoneTOC
      toc={toc}
      minHeadingLevel={minHeadingLevel}
      maxHeadingLevel={maxHeadingLevel}
      arrival={arrival}
      onArrivalEnd={endArrival}
    />
  );
}
