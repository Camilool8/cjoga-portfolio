/**
 * Navbar search (wraps @easyops-cn/docusaurus-search-local's SearchBar).
 *
 * Accessibility repairs to the markup that the plugin and its
 * autocomplete.js produce. None of them changes behaviour:
 *
 * - The clear control is <button>✕</button>: a glyph for a name and no
 *   type. It becomes "Clear search", type="button"; custom.css (Search)
 *   hides the glyph and draws the cross.
 * - autocomplete.js puts role="listbox" on the whole results panel, which
 *   also holds the "See all results" link, and a listbox may only hold
 *   options. The role moves to the element that holds the options, and
 *   the panel becomes a plain container.
 * - The combobox points at its popup with aria-owns (ARIA 1.0). It gets
 *   aria-controls (ARIA 1.2) instead: the options list while there is
 *   one, the panel when it shows the no-results message.
 *
 * autocomplete.js rebuilds the options list on every query, so a
 * MutationObserver (child-list changes only, so its own attribute writes
 * do not retrigger it) re-applies the repairs after each render.
 *
 * Two keyboard fixes, both in the capture phase so they run before
 * autocomplete.js's own listeners on the input:
 *
 * - Tab leaves the field for the next control, as it does from any
 *   combobox. autocomplete.js otherwise treats Tab as "pick the
 *   highlighted result" (its tabAutocomplete default), which navigates
 *   away mid-tab. (The panel's links are also out of the tab order; see
 *   repair().)
 * - Esc closes the results and keeps focus in the field. The plugin blurs
 *   the input on every close, which drops focus on <body>; for a close
 *   caused by Esc, that blur is skipped. Typing again reopens the results.
 *
 * Results: the plugin's rows lead with the page title and repeat it for
 * every hit on that page, under tree glyphs and type icons. The wrapper
 * swaps in its own rows (see hits.js and rowTemplate below): the matched
 * heading first, an excerpt with the match marked, the page name quiet
 * above, and a page's later rows grouped under its first with no rule
 * between them. autocomplete.js keeps its instance in Zepto's data store
 * on the input, so the wrapper loads the same Zepto module to reach it,
 * then wraps the dataset's source (to regroup the hits) and replaces its
 * suggestion template. If any of that is missing the plugin's own rows
 * stay.
 *
 * Precision (hits.js): rows are ranked exact, prefix, then fuzzy, with no
 * fuzzy matches for words of four characters or fewer, then by what
 * matched (title, cert-guide domain, heading, body text); a guide's
 * "Key commands by domain" row goes when one of its domains matched.
 * Learner phrases ("tips", "cheat sheet", "how long") also bring in the
 * section that answers them, and shorthand ("k8s") is searched spelled
 * out (intents.js). When the results are not for the query as typed (a
 * misspelling the fuzzy pass corrected, or spelled-out shorthand), a
 * quiet line over them says what they are for, and so does the status.
 * The source asks
 * for more hits than it shows (searchResultLimits in docusaurus.config.js)
 * so ranking and grouping still fill ROW_LIMIT rows. Every word of a
 * query counts (hits.js, findAnswers): a word no page holds is named over
 * the results for the others ("Not found: “zxqvbn”"), and when no page
 * holds every word, the panel says so and lists pages for each word on
 * its own, under a label on that word's first row.
 * One page shows at most SECTIONS_PER_PAGE sections while others matched
 * too (a cheat sheet can match in a dozen domains). When nothing matches,
 * the panel names the query and offers example queries as options: the
 * arrow keys reach them, Enter or a tap fills the field and runs the
 * search, and they are never auto-selected.
 *
 * Result count: a visually hidden status line says how many rows the
 * panel shows ("5 results", "No results"), so a screen reader hears it
 * without leaving the field. It empties on every answer and is filled
 * once the typing pauses (COUNT_DELAY), so a fast typist hears one count,
 * not one per keystroke; it empties again when the panel closes. On first
 * use, if the reader types before the index has arrived, the same line
 * says "Loading search…" once (custom.css puts the plugin's ring in the
 * magnifier's place meanwhile).
 *
 * Shortcut: the plugin's Ctrl K (Cmd K on a Mac), announced on the field
 * with aria-keyshortcuts; the keycap hint beside it is decoration and
 * hidden from screen readers. No single-key shortcut ("/"): WCAG 2.1.4
 * would need a way to turn it off.
 *
 * Phones (below 997px): the field opens over the bar while it has focus.
 * A visible "Cancel" beside it folds it back, since an empty overlay had
 * no way out but a tap elsewhere. Cancel closes the results and leaves
 * focus on the search control, folded (data-search-folded on the bar's
 * search container overrides the open look; custom.css, Search); typing,
 * a tap on the control or leaving it opens or resets it. Esc with no
 * results showing folds it the same way.
 *
 * The wrapper is `display: contents`, so the navbar layout is unchanged.
 */
import React, {useEffect, useRef} from 'react';
import SearchBar from '@theme-original/SearchBar';
import {escapeHtml} from '@easyops-cn/docusaurus-search-local/dist/client/client/utils/escapeHtml';
import {isMacPlatform} from '@easyops-cn/docusaurus-search-local/dist/client/client/utils/platform';
import {translate} from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {
  EXAMPLE_QUERIES,
  examplesLead,
  findAnswers,
  loadIntros,
  loadStemmer,
  missingMessage,
  noMatchesMessage,
  noteMessage,
  partialMessage,
  queryNote,
  queryTerms,
  termGroupLabel,
  toRows,
} from './hits';
import styles from './styles.module.css';

// Characters of context around the match in a row's excerpt.
const EXCERPT_LENGTH = 72;
// Rows in the panel; "See all results" leads to the rest.
const ROW_LIMIT = 8;
const FALLBACK_ROW_LIMIT = ROW_LIMIT - 2;
// Sections of one page in the panel while other pages matched too.
const SECTIONS_PER_PAGE = 3;
// Pause in the answers before the result count is announced.
const COUNT_DELAY = 700;

const SEARCH_ICON =
  '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="7" cy="7" r="4.75"/><path d="M10.5 10.5L14 14"/></svg>';

const ENTER_ICON =
  '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 3v4.5a2 2 0 0 1-2 2H3"/><path d="M6 6.5l-3 3 3 3"/></svg>';

function rowTemplate(hit) {
  const row = hit._row;
  if (row.example) {
    // An example query: picking it searches for it (see onSelected).
    return `<span class="${styles.exampleIcon}" aria-hidden="true">${SEARCH_ICON}</span><span class="${styles.hit} ${styles.example}"><span class="${styles.primary}"><span class="${styles.srOnly}">Search for </span>${escapeHtml(row.example)}</span></span><span class="${styles.enter}" aria-hidden="true">${ENTER_ICON}</span>`;
  }
  const parts = [`<span class="${styles.primary}">${row.primaryHtml}</span>`];
  if (row.group) {
    parts.push(`<span class="${styles.group}">${escapeHtml(row.group)}</span>`);
  }
  if (row.excerptHtml) {
    parts.push(`<span class="${styles.excerpt}">${row.excerptHtml}</span>`);
  }
  if (row.page) {
    const cls = row.continues ? `${styles.page} ${styles.srOnly}` : styles.page;
    parts.push(
      `<span class="${cls}"><span class="${styles.srOnly}">, in </span>${escapeHtml(row.page)}</span>`,
    );
  }
  let hitCls = styles.hit;
  if (row.continues) hitCls += ` ${styles.continues}`;
  if (row.group) hitCls += ` ${styles.groupStart}`;
  return `<span class="${hitCls}">${parts.join('')}</span><span class="${styles.enter}" aria-hidden="true">${ENTER_ICON}</span>`;
}

// autocomplete.js bundles Zepto 1.2 and keeps the typeahead under this key.
let zeptoPromise;
let zepto;
function loadZepto() {
  zeptoPromise ??= import('@easyops-cn/autocomplete.js/zepto.js').then(
    (mod) => {
      zepto = mod.default ?? mod;
    },
  );
  return zeptoPromise;
}

const patchedDatasets = new WeakSet();

// The status line's text for an answer (see the header comment).
function countMessage(rows, meta) {
  if (meta?.examples) {
    return translate({
      id: 'theme.SearchBar.noResultsCount',
      message: 'No results',
      description: 'Search dropdown, screen-reader status when nothing matches',
    });
  }
  const forms = translate(
    {
      id: 'theme.SearchBar.resultCount',
      message: '1 result|{count} results',
      description: 'Search dropdown, screen-reader status: rows in the panel (singular|plural)',
    },
    {count: rows.length},
  ).split('|');
  const count = forms[rows.length === 1 ? 0 : forms.length - 1];
  // The panel's header lines, then the count.
  const lines = [];
  if (meta?.partial) lines.push(partialMessage().replace(/\.$/, ''));
  if (meta?.missing?.length) lines.push(missingMessage(meta.missing));
  if (meta?.note) lines.push(noteMessage(meta.note));
  return lines.length > 0 ? `${lines.join('. ')}. ${count}` : count;
}

// The status line while the index is still downloading (first use).
function loadingMessage() {
  return translate({
    id: 'theme.SearchBar.loading',
    message: 'Loading search…',
    description: 'Search dropdown, screen-reader status while the search index downloads on first use',
  });
}

// The rows shown when nothing matches: example queries, as options, so
// they are reached with the arrow keys like any result and Tab still
// leaves the field. The document is a stub; onSelected handles a pick.
function exampleRows() {
  return EXAMPLE_QUERIES.map((term) => ({
    document: {i: -1, t: term, u: ''},
    type: -1,
    tokens: [],
    _example: term,
    _row: {example: term},
  }));
}

function patchRows(root, baseUrl) {
  if (!zepto) return;
  const input = root.querySelector('input[role="combobox"]');
  if (!input) return;
  const dataset = zepto(input).data('aaAutocomplete')?.dropdown?.datasets?.[0];
  if (!dataset || patchedDatasets.has(dataset)) return;
  if (typeof dataset.source !== 'function' || !dataset.templates) return;
  patchedDatasets.add(dataset);

  const typeahead = zepto(input).data('aaAutocomplete');
  const source = dataset.source;
  const search = (query) => new Promise((resolve) => source(query, resolve));
  // Example rows are offers, not answers: Enter on a query with no
  // matches must not pick the first one, so autoselect is off while
  // they show.
  const answer = (callback, rows, meta, query) => {
    typeahead.autoselect = !meta?.examples;
    callback(rows, meta);
    // An empty field shows no panel and has nothing to count.
    const text = rows.length > 0 ? countMessage(rows, meta) : '';
    root.dispatchEvent(new CustomEvent('search:count', {detail: {text, query}}));
  };
  dataset.source = async (query, callback) => {
    // Pages' openings and tags, for excerpts and ranking (hits.js);
    // fetched once.
    await loadIntros(baseUrl);
    const {query: found, results, missing, groups} = await findAnswers(query, search);
    // A row fewer under a line over the results ("Not found: “zxqvbn”",
    // "Showing results for “kubernetes”"), so the panel keeps its height
    // and never scrolls on a laptop screen.
    const note = results.length > 0 ? queryNote(found, results) : null;
    const said = Boolean(note) || missing.length > 0;
    const rows = toRows(results, EXCERPT_LENGTH, {
      limit: said ? ROW_LIMIT - 1 : ROW_LIMIT,
      sectionsPerPage: SECTIONS_PER_PAGE,
    });
    if (rows.length > 0) {
      answer(callback, rows, said ? {note, missing} : null, query);
      return;
    }
    if (groups.length > 0) {
      // No page has every word: the best pages for each word, a share
      // of the rows each. Two rows fewer than usual make room for the
      // note above them (three when it also names a word not found, and
      // may wrap), so the panel still fits a phone screen without
      // scrolling. autocomplete.js drops the answer if the query moved on.
      const limit = FALLBACK_ROW_LIMIT - (missing.length > 0 ? 1 : 0);
      const share = Math.max(2, Math.ceil(limit / groups.length));
      const fallback = groups
        .flatMap((group) =>
          toRows(group.results, EXCERPT_LENGTH, {
            limit: share,
            group: termGroupLabel(group.term),
            sectionsPerPage: 1,
          }),
        )
        .slice(0, limit);
      if (fallback.length > 0) {
        answer(callback, fallback, {partial: true, missing}, query);
        return;
      }
    }
    answer(callback, queryTerms(query).length > 0 ? exampleRows() : [], {examples: true}, query);
  };
  // The panel's header: what the results are for when not the query as
  // typed, the note over the per-word fallback, or the no-matches message
  // over the example queries.
  dataset.templates.header = (context, meta) => {
    // Words no page holds, named after the line they qualify, quieter.
    const missing = meta?.missing?.length ? missingMessage(meta.missing) : null;
    if (meta?.partial) {
      const rest = missing ? ` <span class="${styles.lead}">${escapeHtml(missing)}.</span>` : '';
      return `<p class="${styles.partial}">${escapeHtml(partialMessage())}${rest}</p>`;
    }
    if (meta?.note || missing) {
      const lines = [missing, meta.note && noteMessage(meta.note)].filter(Boolean);
      return `<p class="${styles.note}">${lines.map(escapeHtml).join('. ')}</p>`;
    }
    if (meta?.examples) {
      return `<p class="${styles.partial}">${escapeHtml(noMatchesMessage(context.query))} <span class="${styles.lead}">${escapeHtml(examplesLead())}</span></p>`;
    }
    return null;
  };
  // "See all results" leads nowhere useful from the example queries.
  const footer = dataset.templates.footer;
  dataset.templates.footer = (context, meta, ...rest) =>
    meta?.examples ? null : footer?.(context, meta, ...rest);
  // A search sent before the patch can still answer with plain hits.
  const template = dataset.templates.suggestion;
  dataset.templates.suggestion = (hit, ...rest) =>
    hit._row ? rowTemplate(hit) : template(hit, ...rest);
  // Rows already on screen came from the plugin's template.
  if (input.value) dataset.update(input.value);
}

function repair(root) {
  for (const button of root.querySelectorAll(
    'button[class*="searchClearButton_"]',
  )) {
    if (button.getAttribute('aria-label') !== 'Clear search') {
      button.setAttribute('aria-label', 'Clear search');
      button.setAttribute('type', 'button');
    }
  }

  const field = root.querySelector('.navbar__search-input');
  const shortcuts = isMacPlatform() ? 'Meta+K' : 'Control+K';
  if (field && field.getAttribute('aria-keyshortcuts') !== shortcuts) {
    field.setAttribute('aria-keyshortcuts', shortcuts);
  }
  const hint = root.querySelector('[class*="searchHintContainer_"]');
  if (hint && !hint.hasAttribute('aria-hidden')) hint.setAttribute('aria-hidden', 'true');

  const input = root.querySelector('input[role="combobox"]');
  const panel = root.querySelector('[class*="dropdownMenu_"]');
  if (!input || !panel || !panel.id) return;

  if (panel.getAttribute('role') === 'listbox') panel.removeAttribute('role');

  // Results are reached with the arrow keys (aria-activedescendant), not
  // Tab. As tab stops, the panel's links caught Tab from the field, and the
  // panel closed on blur under them, dropping focus on <body>.
  for (const link of panel.querySelectorAll('a[href]')) {
    if (link.getAttribute('tabindex') !== '-1') link.setAttribute('tabindex', '-1');
  }

  const options = panel.querySelector('[class*="suggestions_"]');
  let target = panel.id;
  if (options) {
    target = `${panel.id}-options`;
    if (options.id !== target) options.id = target;
    if (options.getAttribute('role') !== 'listbox') {
      options.setAttribute('role', 'listbox');
      options.setAttribute('aria-label', 'Search results');
    }
  }

  // A re-render with no highlighted row (the example queries, which are
  // not auto-selected) leaves the last query's highlight pointing at an
  // option that is gone.
  const active = input.getAttribute('aria-activedescendant');
  if (active && !document.getElementById(active)) {
    input.removeAttribute('aria-activedescendant');
  }

  if (input.hasAttribute('aria-owns')) input.removeAttribute('aria-owns');
  if (input.getAttribute('aria-controls') !== target) {
    input.setAttribute('aria-controls', target);
  }
}

const PHONE = '(max-width: 996px)';

function containerOf(root) {
  return root.closest('[class*="navbarSearchContainer_"]') ?? root;
}

export default function SearchBarWrapper(props) {
  const {
    siteConfig: {baseUrl},
  } = useDocusaurusContext();
  const ref = useRef(null);
  const statusRef = useRef(null);
  // Set by the effect: closes the results without the plugin's blur.
  const foldRef = useRef(() => {});

  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    repair(root);
    const observer = new MutationObserver(() => {
      patchRows(root, baseUrl);
      repair(root);
    });
    observer.observe(root, {childList: true, subtree: true});

    let escaping = false;
    const container = containerOf(root);
    const unfold = () => container.removeAttribute('data-search-folded');
    // Fold the phone overlay back to the 44px control, focus kept on it.
    const fold = () => {
      const input = root.querySelector('input[role="combobox"]');
      container.setAttribute('data-search-folded', '');
      const typeahead = zepto && input && zepto(input).data('aaAutocomplete');
      if (typeahead) {
        escaping = true;
        typeahead.close();
        setTimeout(() => {
          escaping = false;
        }, 0);
      }
      if (input && document.activeElement !== input) input.focus();
    };
    foldRef.current = fold;

    const resultsShowing = () => {
      const panel = root.querySelector('[class*="dropdownMenu_"]');
      return Boolean(panel && panel.offsetParent !== null);
    };
    const onKeyDown = (event) => {
      if (!event.target.matches?.('input[role="combobox"]')) return;
      if (event.key === 'Tab') {
        event.stopPropagation();
      } else if (event.key === 'Escape') {
        if (
          window.matchMedia(PHONE).matches &&
          !container.hasAttribute('data-search-folded') &&
          !resultsShowing()
        ) {
          fold();
          return;
        }
        escaping = true;
        setTimeout(() => {
          escaping = false;
        }, 0);
      } else if (!['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) {
        unfold();
      }
    };
    const onPointerDown = (event) => {
      if (event.target.matches?.('input[role="combobox"]')) unfold();
    };
    const onFocusOut = (event) => {
      if (!container.contains(event.relatedTarget)) unfold();
    };
    // The result count: emptied on every answer, filled once they pause.
    let countTimer;
    const setCount = (text) => {
      if (statusRef.current) statusRef.current.textContent = text;
    };
    const onCount = (event) => {
      const {text, query} = event.detail;
      // A slower answer to an earlier query: autocomplete.js drops it too.
      const input = root.querySelector('input[role="combobox"]');
      if (input && input.value.trim() !== query.trim()) return;
      clearTimeout(countTimer);
      setCount('');
      if (text) countTimer = setTimeout(() => setCount(text), COUNT_DELAY);
    };
    const onClosed = (event) => {
      clearTimeout(countTimer);
      setCount('');
      if (escaping) event.stopPropagation();
    };
    // First use on a slow connection: the plugin marks the bar as loading
    // (searchIndexLoading_) once the reader types before the index has
    // arrived, and swaps the magnifier for its ring. Said once, in the
    // same status line; the count replaces it when the results come.
    const bar = root.querySelector('.navbar__search');
    const loadingText = loadingMessage();
    let loadingSaid = false;
    const loadingObserver = new MutationObserver(() => {
      const loading = /\bsearchIndexLoading_/.test(bar.className);
      if (loading && !loadingSaid) {
        loadingSaid = true;
        clearTimeout(countTimer);
        setCount(loadingText);
      } else if (!loading && statusRef.current?.textContent === loadingText) {
        setCount('');
      }
    });
    if (bar) {
      loadingObserver.observe(bar, {attributes: true, attributeFilter: ['class']});
    }
    // An example query picked from the no-matches panel: it fills the
    // field and runs, and the panel stays open on its results. Stopped
    // here, the plugin never sees the pick (it would navigate to the
    // stub's empty URL); prevented, autocomplete.js keeps the panel.
    const onSelected = (event) => {
      const term = event._args?.[0]?._example;
      if (!term) return;
      event.stopPropagation();
      event.preventDefault();
      const input = event.target;
      // React owns the field's value: set it through the native setter
      // so the input event reaches both React and autocomplete.js.
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(
        input,
        term,
      );
      input.dispatchEvent(new Event('input', {bubbles: true}));
      if (document.activeElement !== input) input.focus();
    };
    // The plugin loads autocomplete.js on first focus or hover; Zepto
    // comes with it, so ask for it then too.
    const onFirstUse = () => {
      loadIntros(baseUrl);
      Promise.all([loadZepto(), loadStemmer()]).then(() => patchRows(root, baseUrl));
    };
    root.addEventListener('keydown', onKeyDown, true);
    root.addEventListener('pointerdown', onPointerDown, true);
    root.addEventListener('input', unfold, true);
    container.addEventListener('focusout', onFocusOut);
    root.addEventListener('autocomplete:closed', onClosed, true);
    root.addEventListener('autocomplete:selected', onSelected, true);
    root.addEventListener('search:count', onCount);
    root.addEventListener('focusin', onFirstUse, {once: true});
    root.addEventListener('pointerover', onFirstUse, {once: true});
    return () => {
      observer.disconnect();
      loadingObserver.disconnect();
      root.removeEventListener('keydown', onKeyDown, true);
      root.removeEventListener('pointerdown', onPointerDown, true);
      root.removeEventListener('input', unfold, true);
      container.removeEventListener('focusout', onFocusOut);
      unfold();
      root.removeEventListener('autocomplete:closed', onClosed, true);
      root.removeEventListener('autocomplete:selected', onSelected, true);
      root.removeEventListener('search:count', onCount);
      clearTimeout(countTimer);
      root.removeEventListener('focusin', onFirstUse, {once: true});
      root.removeEventListener('pointerover', onFirstUse, {once: true});
    };
  }, [baseUrl]);

  return (
    <div ref={ref} className="search-shell">
      <SearchBar {...props} />
      {/* Shown only while the phone overlay is open (custom.css). A
          press keeps focus in the field, so the overlay holds until the
          click lands. */}
      <button
        type="button"
        className="search-cancel"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => foldRef.current()}>
        Cancel
      </button>
      {/* The result count, for screen readers (filled by the effect). */}
      <span ref={statusRef} className={styles.srOnly} role="status" aria-atomic="true" />
    </div>
  );
}
