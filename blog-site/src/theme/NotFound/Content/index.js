import React, {
  useEffect,
  useId,
  useLayoutEffect,
  useState,
} from 'react';
import clsx from 'clsx';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import {useHistory, useLocation} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useAllPluginInstancesData} from '@docusaurus/useGlobalData';
import {PageMetadata} from '@docusaurus/theme-common';
import {FiArrowRight, FiSearch} from 'react-icons/fi';
import ReaderPaths from '@site/src/components/ReaderPaths';
import rows from '@site/src/components/ReaderPaths/rows.module.css';
import styles from './styles.module.css';

// Path segments that name a format or a folder, not a topic.
const NOISE = new Set(['html', 'htm', 'php', 'md', 'mdx', 'index', 'docs', 'www']);

// Words too common to point anywhere ("not" is in a title; /does-not-exist
// is not about it).
const STOP = new Set([
  'a', 'an', 'and', 'the', 'of', 'to', 'in', 'on', 'for', 'is', 'it', 'my', 'i',
  'be', 'not', 'no', 'do', 'does', 'one', 'with', 'by', 'at', 'or', 'as',
  'you', 'your', 'how', 'why', 'what', 'page',
]);

// The words of a bad address: "/learn/rhcsa-labs.html" gives
// ["learn", "rhcsa", "labs"].
function wordsOf(pathname) {
  let text = pathname;
  try {
    text = decodeURIComponent(pathname);
  } catch {
    // A malformed escape: use the raw path instead.
  }
  return text
    .split(/[\s/_.+\-]+/)
    .map((word) => word.toLowerCase())
    .filter((word) => word && !NOISE.has(word))
    .slice(0, 6);
}

// Words that say only that the page is missing or made up. An address of
// these and stop words alone ("/does-not-exist", "/test-page") gives the
// search nothing to find, so the field is left empty instead.
const GENERIC = new Set([
  'exist', 'exists', 'existing', 'missing', 'found', 'notfound', '404',
  'error', 'broken', 'old', 'new', 'test', 'testing', 'foo', 'bar', 'baz',
  'example', 'random', 'here', 'this', 'that', 'there',
]);

// The search field's prefill: the address's words without the stop and
// generic words ("/foo/selinux" gives "selinux"), or nothing when none
// is left.
function prefillOf(pathname) {
  return wordsOf(pathname)
    .filter((word) => !STOP.has(word) && !GENERIC.has(word))
    .join(' ');
}

const tokensOf = (text) =>
  text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word && !STOP.has(word));

// Edit distance with transpositions ("rhsca" is one step from "rhcsa"),
// stopping early once it passes the limit.
function distance(a, b, limit) {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  const d = Array.from({length: a.length + 1}, (_, i) => [i]);
  for (let j = 1; j <= b.length; j += 1) d[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

// How well one word of the address matches a page's words: whole word,
// then a prefix either way ("rhcsa-guides", "opinion"), then a typo.
function wordScore(word, tokens) {
  if (tokens.includes(word)) return 1;
  if (
    word.length >= 3 &&
    tokens.some((t) => t.length >= 3 && (t.startsWith(word) || word.startsWith(t)))
  ) {
    return 0.6;
  }
  // No typos for numbers ("2025" is not a near miss for "2026") or for
  // words under five letters ("does" is one step from "docs").
  const limit = /\d/.test(word) ? 0 : word.length >= 7 ? 2 : word.length >= 5 ? 1 : 0;
  if (limit && tokens.some((t) => distance(word, t, limit) <= limit)) return 0.4;
  return 0;
}

// The address's folders ("learn" in /learn/rhcsa-guide) only break ties
// between pages in the same place; its last segment names the topic.
const FOLDER_WEIGHT = 0.25;

// Each page's title, read from the docs plugin's version data: the
// sidebar labels, which on this site are the pages' titles. Bundled
// with this page only (about 12 KB). A page outside the sidebars falls
// back to its last path segment.
let labelCache;
function sidebarLabels() {
  if (labelCache) return labelCache;
  labelCache = new Map();
  const walk = (items) =>
    items.forEach((item) => {
      if (item.href && item.label && !item.unlisted) {
        labelCache.set(item.href, item.label);
      }
      if (Array.isArray(item.items)) walk(item.items);
    });
  const files = require.context(
    '@generated/docusaurus-plugin-content-docs/default/p',
    false,
    /\.json$/,
  );
  files.keys().forEach((key) => {
    const sidebars = files(key)?.version?.docsSidebars ?? {};
    Object.values(sidebars).forEach(walk);
  });
  return labelCache;
}

const fallbackLabel = (path) => {
  const last = path.split('/').filter(Boolean).pop() ?? path;
  const text = last.replace(/-/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// A match has to cover at least half the words of the last segment, and
// score at least this share of the best match. Below that it is a guess
// ("not" alone pointed /does-not-exist at an opinion piece), and the
// search under the heading is the better offer.
const MIN_COVERAGE = 0.5;
const MIN_SHARE = 0.6;

// The pages closest to a bad address, best first, at most three: the
// words of its last segment scored against each page's title and path
// words, with its folders as a tie-break. When nothing matches the last
// segment, the closest published folder above it is offered on its own
// (/me/now/2025 is about Now; /learn/kubernetes leads to Learn), and
// nothing when no folder above it is a page.
function closestPages(pathname, docsData) {
  const segments = pathname.split('/').filter(Boolean);
  const pages = listPages(docsData);
  const found = rank(segments, pages);
  if (found.length) return found;
  for (let end = segments.length - 1; end > 0; end -= 1) {
    const path = `/${segments.slice(0, end).join('/')}`.toLowerCase();
    const page = pages.find((item) => item.path.toLowerCase() === path);
    if (page) return [page];
  }
  return [];
}

// Every page offered in a sidebar, with its title.
function listPages(docsData) {
  const labels = sidebarLabels();
  const seen = new Set();
  const pages = [];
  Object.values(docsData ?? {}).forEach((plugin) =>
    (plugin?.versions ?? []).forEach((version) =>
      (version.docs ?? []).forEach((doc) => {
        if (seen.has(doc.path)) return;
        seen.add(doc.path);
        const label = labels.get(doc.path);
        // Listed in no sidebar: unlisted or a draft, so not offered.
        if (labels.size && !label) return;
        pages.push({path: doc.path, label: label ?? fallbackLabel(doc.path)});
      }),
    ),
  );
  return pages;
}

function rank(segments, pages) {
  const topic = wordsOf(segments.slice(-1).join('/')).filter((w) => !STOP.has(w));
  const folders = wordsOf(segments.slice(0, -1).join('/'));
  if (!topic.length) return [];

  const scored = pages
    .map((page) => {
      // The topic is matched against the page's own name (title and last
      // segment), not its folders: /opinion is the Opinions page, not
      // every page filed under it.
      const pathTokens = tokensOf(page.path);
      const nameTokens = tokensOf(page.path.split('/').pop() ?? '');
      const titleTokens = tokensOf(page.label);
      let score = 0;
      let hits = 0;
      topic.forEach((word) => {
        const title = wordScore(word, titleTokens);
        const path = wordScore(word, nameTokens);
        score += Math.max(title, path) + 0.25 * Math.min(title, path);
        if (title || path) hits += 1;
      });
      const strong = hits / topic.length >= MIN_COVERAGE;
      folders.forEach((word) => {
        score += FOLDER_WEIGHT * wordScore(word, pathTokens);
      });
      return {...page, score, strong};
    })
    .filter((page) => page.strong)
    .sort((a, b) => b.score - a.score || a.path.length - b.path.length);
  if (!scored.length) return [];
  const floor = scored[0].score * MIN_SHARE;
  return scored.filter((page) => page.score >= floor).slice(0, 3);
}

// The address as text that wraps only after a "/" or "-", never inside
// a word.
function breakable(address) {
  const parts = [];
  address.split(/([/-])/).forEach((part, i) => {
    if (i % 2) {
      // A separator: it ends the piece before it, and the line may
      // break after it.
      parts[parts.length - 1] += part;
    } else if (part || !parts.length) {
      parts.push(part);
    }
  });
  // Never a lone leading "/" at a line's end.
  if (parts.length > 1 && parts[0] === '/') {
    parts.splice(0, 2, `/${parts[1]}`);
  }
  return parts.map((part, i) => (
    // eslint-disable-next-line react/no-array-index-key -- a fixed split
    <React.Fragment key={i}>
      {i > 0 && <wbr />}
      {part}
    </React.Fragment>
  ));
}

// Runs before paint in the browser, so the matches and the address land
// in the same frame as the rest; a plain effect on the server.
const useBrowserLayoutEffect = ExecutionEnvironment.canUseDOM
  ? useLayoutEffect
  : useEffect;

// A wrong address lands in the handbook's own voice: what happened and
// the address that wasn't found, the pages closest to it, a search
// already filled in with that address's words (empty, on its placeholder,
// when they name nothing; see prefillOf), then the same routes the
// landing page offers, so the reader is one step from a guide instead of
// being told to contact "the site that linked you".
//
// The address is only known in the browser (the static 404.html is built
// for no particular path), so everything under the heading is worked out
// after load. Until then it is held invisible (only when scripts run:
// html[data-theme] is set by the theme's inline script), so the matches
// arriving never push the search and the routes down the page.
export default function NotFoundContent({className}) {
  const {pathname} = useLocation();
  const history = useHistory();
  const searchUrl = useBaseUrl('/search');
  const docsData = useAllPluginInstancesData('docusaurus-plugin-content-docs');
  const fieldId = useId();
  const matchesId = useId();
  const [ready, setReady] = useState(false);
  const [address, setAddress] = useState('');
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState([]);

  useBrowserLayoutEffect(() => {
    setAddress(pathname);
    setQuery(prefillOf(pathname));
    setMatches(closestPages(pathname, docsData));
    setReady(true);
  }, [pathname, docsData]);

  // Without JavaScript the form still works: a GET to /search?q=….
  const onSubmit = (event) => {
    event.preventDefault();
    const q = query.trim();
    history.push(q ? `${searchUrl}?q=${encodeURIComponent(q)}` : searchUrl);
  };

  return (
    <main className={clsx(styles.main, className)}>
      <PageMetadata title="Page not found" />
      <Head>
        <meta name="robots" content="noindex, follow" />
      </Head>
      <div className={styles.inner}>
        <h1 className={styles.title}>
          That page isn’t here.{' '}
          <span className={styles.titleMuted}>Here’s what is.</span>
        </h1>
        <div className={styles.body} data-pending={ready ? undefined : ''}>
          <p className={styles.address}>
            {address ? (
              <>
                Nothing is published at{' '}
                <code className={styles.path}>{breakable(address)}</code>.
              </>
            ) : (
              <>Nothing is published at this address.</>
            )}
          </p>
          {matches.length > 0 && (
            <section className={styles.matches} aria-labelledby={matchesId}>
              <h2 id={matchesId} className={styles.matchesTitle}>
                {matches.length === 1 ? 'Closest page' : 'Closest pages'}
              </h2>
              <ul className={clsx(rows.list, rows.framed)}>
                {matches.map((page) => (
                  <li key={page.path} className={rows.item}>
                    <Link to={page.path} className={rows.row}>
                      <span className={rows.text}>
                        <span className={rows.label}>{page.label}</span>
                        <span className={styles.matchPath}>{page.path}</span>
                      </span>
                      <FiArrowRight className={rows.arrow} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <p className={styles.lede}>
            {matches.length > 1
              ? 'It may be old or mistyped. If it isn’t one of these, search for it, or start from one of the routes below.'
              : matches.length === 1
                ? 'It may be old or mistyped. If it isn’t that one, search for it, or start from one of the routes below.'
                : 'It may be old or mistyped. Search for it, or start from one of these routes.'}
          </p>
          <form
            className={styles.search}
            role="search"
            action={searchUrl}
            method="get"
            onSubmit={onSubmit}>
            <label htmlFor={fieldId} className={styles.searchLabel}>
              Search the handbook
            </label>
            <div className={styles.searchRow}>
              <div className={styles.searchField}>
                <FiSearch className={styles.searchIcon} aria-hidden="true" />
                <input
                  id={fieldId}
                  className={styles.searchInput}
                  type="search"
                  name="q"
                  value={query}
                  placeholder="Try LVM or SELinux"
                  onChange={(event) => setQuery(event.target.value)}
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>
              <button type="submit" className={styles.searchButton}>
                Search
              </button>
            </div>
          </form>
          <ReaderPaths />
        </div>
      </div>
    </main>
  );
}
