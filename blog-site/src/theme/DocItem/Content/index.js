import React, {useEffect} from 'react';
import Content from '@theme-original/DocItem/Content';
import DocItemTOCMobile from '@theme/DocItem/TOC/Mobile';
import MDXComponents from '@theme/MDXComponents';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

// Renders a "Published / Updated" dateline above each doc's content, and
// places the phone/tablet "On this page" after the page's intro.
//
// We deliberately do NOT call `useDoc()`. Under this project's Rspack dev
// resolution, importing `@docusaurus/plugin-content-docs/client` from a src/
// swizzle resolves to a different module instance than the core theme's, so its
// DocContext reads null and `useDoc()` throws "called outside the <DocProvider>".
// Instead we read the doc's `frontMatter` (and `toc`) off the MDX component
// core passes in as `props.children` — static properties, context-free,
// identical in dev, production build, and client hydration.
//
// Both dates come straight from frontmatter, never from `metadata.lastUpdatedAt`
// (which Docusaurus backfills from git / file mtime and would show a bogus
// "Updated" on docs that were never actually given a `last_update`). So:
//   - Published = `date`
//   - Updated   = `last_update.date`, shown ONLY when explicitly set, and
//     labelled "Corrected" when `last_update_kind: correction` says that
//     change only corrected the page (plugins/doc-dates.js).
// Hub/index pages carry no `date` and render nothing here. Reading time
// comes from front matter `reading_time`, which docusaurus.config.js
// computes at build time (markdown.parseFrontMatter).
//
// A page marked `time_bound` (Now) says so once its latest date is past
// its threshold (see staleNote).

const fmt = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

function toDate(value) {
  if (!value) {
    return null;
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

// A time-bound page past its threshold adds a quiet note to its
// dateline, naming its age. `time_bound: true` is a quarter (90 days); a
// number sets the days, for a page that goes stale sooner (Now speaks of
// "this month"). The age is measured against the build's date
// (siteConfig.customFields.buildDate, set once in docusaurus.config.js),
// not the reader's clock: the server's HTML and the hydrating client
// then agree, and the note changes only when the site is rebuilt.
// Without a build date, no note.
const STALE_DAYS = 90;
const DAY_MS = 24 * 60 * 60 * 1000;

function staleNote(frontMatter, latest, buildDate, verb) {
  const bound = frontMatter.time_bound;
  const limit =
    typeof bound === 'number' && bound > 0 ? bound : bound ? STALE_DAYS : 0;
  const built = toDate(buildDate);
  if (!limit || !latest || !built) {
    return null;
  }
  const days = Math.floor((built.getTime() - latest.getTime()) / DAY_MS);
  if (days <= limit) {
    return null;
  }
  // Weeks up to twelve, then months: "11 weeks", "5 months".
  const weeks = Math.floor(days / 7);
  const months = Math.round(days / 30.44);
  const age =
    weeks <= 12
      ? `${weeks} week${weeks === 1 ? '' : 's'}`
      : `${months} month${months === 1 ? '' : 's'}`;
  return `${verb} ${age} ago; some of this has likely changed.`;
}

// The year in its own span: on a phone a date from the build's own year
// drops it ("Jul 5"), so two dates and "N min read" share one line. The
// <time> keeps the full date for machines and screen readers alike.
function DateItem({label, date, buildYear}) {
  const parts = fmt.formatToParts(date);
  const sameYear = date.getUTCFullYear() === buildYear;
  return (
    <span className="doc-dateline__item">
      <span className="doc-dateline__label">{label}</span>{' '}
      <time className="doc-dateline__date" dateTime={date.toISOString()}>
        {parts.map((part, i) =>
          sameYear && (part.type === 'year' || (part.type === 'literal' && parts[i + 1]?.type === 'year')) ? (
            <span key={i} className="doc-dateline__year">
              {part.value}
            </span>
          ) : (
            part.value
          ),
        )}
      </time>
    </span>
  );
}

// MDX layout for the doc body. On a phone the contents list used to sit
// above the dateline and the title; here it goes after the intro (title,
// lede, and whatever the page sets under it, such as the repo row), right
// before the first heading it lists. It is real DOM order, so reading and
// focus order match what is seen. The wrapper gets the compiled content
// as a single element; rendering it here (it only reads the MDX provider
// context) gives the top-level blocks to split. Without a top-level match
// the list goes first, as Docusaurus had it.

// Inline code is a command or a name ("prox-k8s-master", "su -"): a
// short one stays whole rather than split at its hyphen. The same pass
// marks every inline code of 24 characters or fewer (what fits the
// narrowest phone column) with "code-whole"; custom.css ("Inline code")
// keeps those on one line, and longer ones break where they must. It is
// done here, on the rendered tree, so it is in the server's HTML and
// nothing re-wraps once the page is live. Code blocks are left alone.
const WHOLE_MAX = 24;

function keepCodeWhole(node) {
  if (!React.isValidElement(node)) {
    return node;
  }
  const {children, className} = node.props ?? {};
  if (node.type === MDXComponents.code) {
    return typeof children === 'string' &&
      children.length <= WHOLE_MAX &&
      !children.includes('\n')
      ? React.cloneElement(node, {
          className: className ? `${className} code-whole` : 'code-whole',
        })
      : node;
  }
  // Only element children are walked: text, render functions and other
  // values pass through as they are.
  const many = Array.isArray(children);
  if (
    node.type === MDXComponents.pre ||
    node.type === 'pre' ||
    !(many || React.isValidElement(children))
  ) {
    return node;
  }
  const list = many ? children : [children];
  const mapped = list.map(keepCodeWhole);
  // Passed back as separate arguments, as MDX passed them, so they stay
  // static children (no keys needed).
  return mapped.some((child, i) => child !== list[i])
    ? React.cloneElement(node, undefined, ...mapped)
    : node;
}

function ArticleBlocks({children, tocAnchor, tocProps}) {
  const tree =
    typeof children?.type === 'function'
      ? children.type(children.props)
      : children;
  const blocks =
    tree?.type === React.Fragment
      ? React.Children.toArray(tree.props.children)
          .map(keepCodeWhole)
      : null;
  if (!tocAnchor) {
    return blocks ? <>{blocks}</> : tree;
  }
  const contents = (
    <DocItemTOCMobile key="doc-toc-mobile" placement="intro" {...tocProps} />
  );
  const at = blocks
    ? blocks.findIndex((block) => block?.props?.id === tocAnchor)
    : -1;
  if (at < 0) {
    return (
      <>
        {contents}
        {blocks ?? tree}
      </>
    );
  }
  return (
    <>
      {blocks.slice(0, at)}
      {contents}
      {blocks.slice(at)}
    </>
  );
}

// Phones and tablets: the floating back-to-top button sits over the
// column's bottom-right corner, where it would cover line ends, code
// lines and a code block's copy and wrap buttons. Two rules keep it off
// the text (custom.css, "Back to top"):
// - It is wanted only once the reader is more than two screens down and
//   scrolls back up (a deliberate move, past a few pixels of jitter); any
//   scroll down puts it away again (html[data-top-wanted]). The theme's
//   own rule (up, past 300px) still has to hold too.
// - While a code block passes through the button's band at the foot of
//   the screen, the button steps aside (html[data-top-over-code]).
// html[data-top-gate] says this hook is running, so the CSS never hides
// the button on a page without it.
const TOP_BUTTON_BAND_PX = 96;
const TOP_WANTED_SCREENS = 2;
const UP_SLOP_PX = 24;

// Checked on scroll rather than with an IntersectionObserver: code blocks
// re-render once the browser takes over (the theme keys them on
// useIsBrowser), so nodes observed at mount go stale.
function useBackToTopClearance() {
  useEffect(() => {
    const root = document.documentElement;
    const narrow = window.matchMedia('(max-width: 996px)');
    let frame = 0;
    let lastY = window.scrollY;
    let upTravel = 0;
    let wanted = false;
    const check = () => {
      frame = 0;
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      if (dy > 2) {
        upTravel = 0;
        wanted = false;
      } else if (dy < 0) {
        upTravel -= dy;
        if (
          !wanted &&
          upTravel >= UP_SLOP_PX &&
          y > TOP_WANTED_SCREENS * window.innerHeight
        ) {
          wanted = true;
        }
      }
      root.toggleAttribute('data-top-wanted', wanted);

      const band = window.innerHeight - TOP_BUTTON_BAND_PX;
      const over =
        narrow.matches &&
        Array.from(document.querySelectorAll('article .theme-code-block')).some(
          (block) => {
            const rect = block.getBoundingClientRect();
            return rect.bottom > band && rect.top < window.innerHeight;
          },
        );
      root.toggleAttribute('data-top-over-code', over);
    };
    const schedule = () => {
      if (!frame) {
        frame = requestAnimationFrame(check);
      }
    };
    root.setAttribute('data-top-gate', '');
    schedule();
    window.addEventListener('scroll', schedule, {passive: true});
    window.addEventListener('resize', schedule);
    narrow.addEventListener('change', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      narrow.removeEventListener('change', schedule);
      root.removeAttribute('data-top-over-code');
      root.removeAttribute('data-top-wanted');
      root.removeAttribute('data-top-gate');
    };
  }, []);
}

export default function ContentWrapper(props) {
  const mdx = props?.children;
  const frontMatter = mdx?.type?.frontMatter ?? {};
  const toc = mdx?.type?.toc ?? [];
  const published = toDate(frontMatter.date);
  const updated = toDate(frontMatter.last_update?.date);
  const showUpdated =
    updated &&
    (!published || updated.toDateString() !== published.toDateString());
  const {siteConfig} = useDocusaurusContext();
  const corrected = frontMatter.last_update_kind === 'correction';
  const stale = staleNote(
    frontMatter,
    updated ?? published,
    siteConfig.customFields?.buildDate,
    updated ? (corrected ? 'Corrected' : 'Updated') : 'Published',
  );
  const buildYear = toDate(siteConfig.customFields?.buildDate)?.getUTCFullYear();

  // Reading time from 2 minutes up. 1 is the formula's floor
  // (docusaurus.config.js), so on a list or reference page such as
  // Credentials it measures how little prose there is, not a read.
  const minutes = Number(frontMatter.reading_time) || 0;
  const showMinutes = minutes >= 2;

  useBackToTopClearance();

  // Same test as the Layout's: a contents list only when there is one.
  const hasTOC = !frontMatter.hide_table_of_contents && toc.length > 0;
  const body = React.isValidElement(mdx)
    ? React.cloneElement(mdx, {
        components: {wrapper: ArticleBlocks},
        tocAnchor: hasTOC ? toc[0].id : null,
        // The phone list is built from these (DocItem/TOC/Mobile).
        tocProps: {
          toc,
          minHeadingLevel: frontMatter.toc_min_heading_level,
          maxHeadingLevel: frontMatter.toc_max_heading_level,
        },
      })
    : mdx;

  return (
    <>
      {published && (
        <div className="doc-dateline">
          <DateItem label="Published" date={published} buildYear={buildYear} />
          {showUpdated && (
            <DateItem
              label={corrected ? 'Corrected' : 'Updated'}
              date={updated}
              buildYear={buildYear}
            />
          )}
          {showMinutes && (
            <span className="doc-dateline__item doc-dateline__label">
              <span>
                {minutes} min
                <span className="doc-dateline__suffix"> read</span>
              </span>
            </span>
          )}
          {stale && (
            <span className="doc-dateline__item doc-dateline__stale">
              {stale}
            </span>
          )}
        </div>
      )}
      <Content {...props}>{body}</Content>
    </>
  );
}
