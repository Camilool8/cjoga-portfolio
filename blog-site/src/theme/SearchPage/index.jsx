/**
 * The /search page (ejected from @easyops-cn/docusaurus-search-local
 * 0.55.3, theme/SearchPage). Same query handling and worker as the
 * plugin's; what changes is the results and the page around them:
 *
 * - Hits are grouped by page (src/theme/SearchBar/hits.js): the page
 *   title links the page once, and its matched sections follow as
 *   indented links, each heading with a short excerpt. The plugin listed
 *   one row per hit, so a long guide could fill the list with its own
 *   title and a long breadcrumb under each.
 * - Hits are ranked and filtered as in the dropdown (hits.js: exact, then
 *   prefix, then fuzzy; no fuzzy matches for short words), learner
 *   phrases bring in the section that answers them, and shorthand ("k8s")
 *   is searched spelled out (intents.js).
 * - When the results are not for the query as typed, the result line says
 *   so: "No exact matches for “kubernetis”. Showing results for
 *   “kubernetes”." It is part of the status, so it is heard too.
 * - A result line counts what is shown: "7 matches in 3 pages". It is a
 *   status message, so screen readers hear the count as it changes.
 * - Every word of a query counts (hits.js, findAnswers): a word no page
 *   holds is named in the result line ("Not found: “zxqvbn”") and the
 *   results are for the others. A multi-word query that no page matches
 *   whole falls back to the pages for each word on its own, one list per
 *   word under its own heading.
 * - A fact-sheet answer ("how long") links to its row of the guide's
 *   ExamFacts (`#fact-duration`).
 * - The tab title goes through PageMetadata, so it carries the site
 *   suffix like every other page ("Search | Camilo's handbook").
 * - Empty and no-results states offer a few queries that do match.
 * - A page that matched in many sections (a cheat sheet's domains) shows
 *   its first few, and a button reveals the rest in place.
 *
 * The plugin's search-context selector is left out: this site has one
 * docs plugin and no search contexts. The <main> landmark comes from
 * src/theme/Layout.
 */
import React, {useEffect, useId, useRef, useState} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import {translate} from '@docusaurus/Translate';
import {PageMetadata, usePluralForm} from '@docusaurus/theme-common';
import useSearchQuery from '@easyops-cn/docusaurus-search-local/dist/client/client/theme/hooks/useSearchQuery';
import {
  fetchIndexesByWorker,
  searchByWorker,
} from '@easyops-cn/docusaurus-search-local/dist/client/client/theme/searchByWorker';
import {
  EXAMPLE_QUERIES,
  examplesLead,
  findAnswers,
  groupByPage,
  loadIntros,
  loadStemmer,
  missingMessage,
  noteMessage,
  partialMessage,
  queryNote,
  termGroupLabel,
} from '@site/src/theme/SearchBar/hits';
import styles from './styles.module.css';

// Characters of context around the match in an excerpt.
const EXCERPT_LENGTH = 140;
// Hits asked of the worker per query (the plugin's page asks for 100).
const SEARCH_LIMIT = 100;
// Sections of one page shown before "Show N more in this page".
const SECTIONS_SHOWN = 5;

export default function SearchPage() {
  return (
    <Layout>
      <SearchPageContent />
    </Layout>
  );
}

function Suggestions() {
  return (
    <p className={styles.suggestions}>
      <span className={styles.suggestionsLead}>{examplesLead()}</span>{' '}
      {EXAMPLE_QUERIES.map((term) => (
        <Link
          key={term}
          className={styles.suggestion}
          to={`/search?q=${encodeURIComponent(term)}`}>
          {term}
        </Link>
      ))}
    </p>
  );
}

function SearchPageContent() {
  const {
    siteConfig: {baseUrl},
  } = useDocusaurusContext();
  const {selectMessage} = usePluralForm();
  const {searchValue, searchContext, searchVersion, updateSearchPath} =
    useSearchQuery();
  const [searchQuery, setSearchQuery] = useState(searchValue);
  // {pages} for the query as typed; {pages: [], groups: [{term, pages}]}
  // when only the per-word fallback found something.
  const [outcome, setOutcome] = useState();
  const [searchWorkerReady, setSearchWorkerReady] = useState(false);
  const versionUrl = `${baseUrl}${searchVersion}`;
  const query = searchQuery.trim();

  const heading = query
    ? translate(
        {
          id: 'theme.SearchPage.existingResultsTitle',
          message: 'Results for “{query}”',
          description: 'Heading of the /search page when it has a query',
        },
        {query},
      )
    : translate({
        id: 'theme.SearchPage.emptyResultsTitle',
        message: 'Search the handbook',
        description: 'Heading of the /search page without a query',
      });
  const tabTitle = query
    ? translate(
        {
          id: 'theme.SearchPage.documentTitleWithQuery',
          message: '“{query}” – Search',
          description: 'Tab title of the /search page with a query; the site name follows',
        },
        {query},
      )
    : translate({
        id: 'theme.SearchPage.documentTitle',
        message: 'Search',
        description: 'Tab title of the /search page; the site name follows',
      });

  useEffect(() => {
    updateSearchPath(searchQuery);
    if (!query) {
      setOutcome(undefined);
      return undefined;
    }
    // A slower search for an earlier query must not overwrite this one.
    let current = true;
    const find = (text) =>
      searchByWorker(versionUrl, searchContext, text, SEARCH_LIMIT);
    (async () => {
      // Opening lines for rows with no excerpt come from the index too.
      await Promise.all([loadStemmer(), loadIntros(baseUrl)]);
      // Learner phrases ("tips", "how long") also find the section that
      // answers them (SearchBar/intents.js); every other word must be on
      // the page, or is named as not found.
      const answer = await findAnswers(query, find);
      const pages = groupByPage(answer.results, EXCERPT_LENGTH);
      const note = pages.length > 0 ? queryNote(answer.query, answer.results) : null;
      const groups = answer.groups
        .map(({term, results}) => ({term, pages: groupByPage(results, EXCERPT_LENGTH)}))
        .filter((group) => group.pages.length > 0);
      if (current) setOutcome({pages, groups, note, missing: answer.missing});
    })();
    return () => {
      current = false;
    };
    // `updateSearchPath` changes every render; in the deps it would loop
    // (as in the plugin).
  }, [searchQuery, versionUrl, searchContext, baseUrl]);

  useEffect(() => {
    if (searchValue && searchValue !== searchQuery) {
      setSearchQuery(searchValue);
    }
  }, [searchValue]);

  useEffect(() => {
    fetchIndexesByWorker(versionUrl, searchContext).then(() =>
      setSearchWorkerReady(true),
    );
  }, [searchContext, versionUrl]);

  const pages = outcome?.pages ?? [];
  const groups = outcome?.groups ?? [];
  // Lines under the result line: words not found, and what the results
  // are for when not the query as typed.
  const notes = [];
  if ((pages.length > 0 || groups.length > 0) && outcome.missing.length > 0) {
    notes.push(`${missingMessage(outcome.missing)}.`);
  }
  if (pages.length > 0 && outcome.note) notes.push(noteMessage(outcome.note, {long: true}));
  const matchCount = pages.reduce(
    (sum, page) => sum + (page.matched ? 1 : 0) + page.sections.length,
    0,
  );

  let status = null;
  if (query && !searchWorkerReady) {
    status = translate({
      id: 'theme.SearchPage.loading',
      message: 'Loading the search index…',
      description: 'The /search page while the index downloads',
    });
  } else if (outcome && pages.length > 0) {
    status = translate(
      {
        id: 'theme.SearchPage.resultSummary',
        message: '{matches} in {pages}',
        description: 'Result count on the /search page, e.g. "7 matches in 3 pages"',
      },
      {
        matches: selectMessage(
          matchCount,
          translate(
            {
              id: 'theme.SearchPage.documentsFound.plurals',
              message: '1 match|{count} matches',
              description: 'Matches (pages and sections) on the /search page',
            },
            {count: matchCount},
          ),
        ),
        pages: selectMessage(
          pages.length,
          translate(
            {
              id: 'theme.SearchPage.pagesFound.plurals',
              message: '1 page|{count} pages',
              description: 'Pages with matches on the /search page',
            },
            {count: pages.length},
          ),
        ),
      },
    );
  } else if (groups.length > 0) {
    status = partialMessage();
  } else if (outcome) {
    status =
      process.env.NODE_ENV === 'production'
        ? translate(
            {
              id: 'theme.SearchPage.noResultsText',
              message: 'Nothing in the handbook matches “{query}”.',
              description: 'The /search page, no results',
            },
            {query},
          )
        : 'Search works in a production build only: the index is made by docusaurus build.';
  }

  return (
    <>
      <PageMetadata title={tabTitle} />
      <Head>
        {/* Search pages stay out of search engines
            (https://github.com/facebook/docusaurus/pull/3233). */}
        <meta name="robots" content="noindex, follow" />
      </Head>

      <div className="container margin-vert--lg">
        <h1 className={styles.heading}>
          <span className={styles.headingText}>{heading}</span>
        </h1>

        <input
          type="search"
          name="q"
          className={styles.searchQueryInput}
          aria-label={translate({
            id: 'theme.SearchPage.inputLabel',
            message: 'Search the handbook',
            description: 'Accessible name of the /search page field',
          })}
          onChange={(event) => setSearchQuery(event.target.value)}
          value={searchQuery}
          autoComplete="off"
          autoFocus
        />

        <p className={styles.status} role="status" aria-atomic="true">
          {status}
          {/* With notes under it, the count ends its sentence where it is
              seen ("28 matches in 15 pages."), so it is read, heard and
              copied as one sentence and each note as the next, with no
              stray mark between them. */}
          {status && notes.length > 0 && !/[.…!?]$/.test(status) ? '.' : null}
          {status &&
            notes.map((text) => (
              <React.Fragment key={text}>
                {/* Seen as separate lines; the space keeps them apart in
                    text read off the page. */}{' '}
                <span className={styles.note}>{text}</span>
              </React.Fragment>
            ))}
        </p>

        {(!query || (outcome && pages.length === 0 && groups.length === 0)) && (
          <Suggestions />
        )}

        {pages.length > 0 && <PageList pages={pages} />}

        {groups.map((group) => (
          <section key={group.term} className={styles.group}>
            <h2 className={styles.groupTitle}>{termGroupLabel(group.term)}</h2>
            <PageList pages={group.pages} titleAs="h3" />
          </section>
        ))}
      </div>
    </>
  );
}

/** Pages with their matched sections; titles are h2, or h3 in a group. */
function PageList({pages, titleAs: Title = 'h2'}) {
  return (
    <ol className={styles.results}>
      {pages.map((page) => (
        <li key={page.key} className={styles.page}>
          <Title className={styles.pageTitle}>
            {/* A fact-sheet answer leads to its row (hits.js, factHash). */}
            <Link
              to={page.url + (page.factHash ?? '')}
              dangerouslySetInnerHTML={{__html: page.titleHtml}}
            />
          </Title>
          {page.crumbs.length > 0 && (
            <p className={styles.crumbs}>{page.crumbs.join(' › ')}</p>
          )}
          {page.excerptHtml && (
            <p
              className={styles.excerpt}
              dangerouslySetInnerHTML={{__html: page.excerptHtml}}
            />
          )}
          {page.sections.length > 0 && <SectionList sections={page.sections} />}
        </li>
      ))}
    </ol>
  );
}

/**
 * A page's matched sections. Past SECTIONS_SHOWN (plus one, so the button
 * never stands in for a single row) the rest wait behind a button; once
 * shown, focus moves to the first of them so the reader carries on from
 * where the list grew.
 */
function SectionList({sections}) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const firstHidden = useRef(null);
  useEffect(() => {
    if (open) firstHidden.current?.focus();
  }, [open]);
  const folds = sections.length > SECTIONS_SHOWN + 1;
  const shown = folds && !open ? sections.slice(0, SECTIONS_SHOWN) : sections;
  const firstHiddenKey = folds ? sections[SECTIONS_SHOWN].key : null;
  return (
    <>
      <ul className={styles.sections} id={listId}>
        {shown.map((section) => (
          <li key={section.key}>
            <Link
              className={styles.section}
              to={section.url}
              ref={section.key === firstHiddenKey ? firstHidden : undefined}>
              <span
                className={styles.sectionTitle}
                dangerouslySetInnerHTML={{__html: section.titleHtml}}
              />
              {section.excerptHtml && (
                <span
                  className={styles.excerpt}
                  dangerouslySetInnerHTML={{
                    __html: section.excerptHtml,
                  }}
                />
              )}
            </Link>
          </li>
        ))}
      </ul>
      {folds && !open && (
        <button
          type="button"
          className={styles.more}
          aria-controls={listId}
          aria-expanded="false"
          onClick={() => setOpen(true)}>
          {translate(
            {
              id: 'theme.SearchPage.moreSections',
              message: 'Show {count} more in this page',
              description: "/search: reveals the rest of one page's matched sections",
            },
            {count: sections.length - SECTIONS_SHOWN},
          )}
        </button>
      )}
    </>
  );
}
