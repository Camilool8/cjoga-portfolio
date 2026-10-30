/**
 * Search hits, regrouped by page. Shared by the navbar dropdown
 * (SearchBar) and the /search page (SearchPage).
 *
 * The plugin returns one hit per indexed piece: a page title, a heading,
 * a paragraph, a description or keywords. One page often answers a query
 * several times over, so a flat list repeats its title row after row.
 * Here hits are folded into pages (in the order the plugin ranked them),
 * and inside a page into sections: a heading hit and a paragraph hit under
 * that heading become one entry, the heading with an excerpt.
 *
 * Before grouping, hits are ranked by how each query word matched
 * (rankHits): exact, then as a prefix, then only through the plugin's
 * fuzzy pass (one edit). A fuzzy-only match on a word of four characters
 * or fewer is dropped: one edit away from "lvm" is "vm", "llm", "nvme".
 *
 * After grouping, pages and their sections are ordered by what matched
 * (recordKind): a page title, then a cert guide's domain heading
 * (`#sheet-…`), then any other heading, then body text, then last a
 * page's front-matter keywords alone. Among pages that matched alike, the
 * one that answers in more places leads. A keyword is a tag, not text the
 * reader will find on the page: a page found only by its tags says so in
 * its excerpt ("Tagged: kubernetes"), and a section index found only so
 * goes when one of its own pages is in the results. Every page row gets
 * an excerpt: when nothing in the page's own text matched, its opening
 * line (loadIntros). A guide's "Key commands by domain" H2
 * only gathers the text around its domains, so it is dropped when one of
 * those domains matched too: it would repeat the same answer one row
 * down.
 *
 * Intents (intents.js, searchWithIntents): a query that holds a phrase
 * like "tips" or "how long" also searches for the section that answers
 * it ("Day-of guidance", a guide's fact sheet). Those hits rank as
 * KIND_INTENT: below a heading that matched the query's own words, above
 * any body-text match. Body text that matched only the intent's own words
 * ("long" in "how long") is dropped: the intent already found the answer.
 * A fact-sheet hit shows the asked-for row as its excerpt ("Duration: 2
 * hours · …"), and a guide whose row gives a figure ranks above one whose
 * row defers to the official page (factRow).
 *
 * Body text that matched only inside a machine name ("k8s" in the
 * hostname prox-k8s-master) ranks last, below a page found by its tags
 * (inMachineName).
 *
 * Synonyms (intents.js): "k8s" also searches "kubernetes". Certification
 * words ("cert", "exam") put the cert guides first. When the plugin's
 * fuzzy pass changed a word ("kubernetis" found "kubernetes"), or a
 * synonym added one, queryNote says so above the results.
 *
 * Every word counts (findAnswers): the worker also runs a query of three
 * or more words with each word left out, so "selinux lvm zxqvbn" used to
 * answer for "selinux lvm" and say nothing of the word it dropped. A page
 * now has to hold every word; a word the handbook never uses is named
 * ("Not found: “zxqvbn”") and the rest are searched without it; when no
 * page holds them all, the per-word fallback lists pages for each.
 *
 * A fact-sheet hit ("how long") links to the asked-for row of ExamFacts
 * (`#fact-duration`), not the page top. Among pages that matched alike,
 * one whose title, description or first sentence names the word (or a
 * kind of it: "K3s" for "kubernetes", intents.js KINDS) leads one that
 * only mentions it (isAbout).
 */
import {translate} from '@docusaurus/Translate';
import {highlight} from '@easyops-cn/docusaurus-search-local/dist/client/client/utils/highlight';
import {highlightStemmed} from '@easyops-cn/docusaurus-search-local/dist/client/client/utils/highlightStemmed';
import {getStemmedPositions} from '@easyops-cn/docusaurus-search-local/dist/client/client/utils/getStemmedPositions';
import {escapeHtml} from '@easyops-cn/docusaurus-search-local/dist/client/client/utils/escapeHtml';
import {searchIndexUrl} from '@easyops-cn/docusaurus-search-local/dist/client/client/utils/proxiedGeneratedConstants';
import {FILLER, INTENTS, KINDS, LEARN_PATH, LEARN_WORDS, SYNONYMS} from './intents';

// SearchDocumentType in the plugin's shared/interfaces.
const TITLE = 0;
const HEADING = 1;
const DESCRIPTION = 2;
const KEYWORDS = 3;
const CONTENT = 4;

// How a hit matched its weakest query word, best first.
const EXACT = 0;
const PREFIX = 1;
const FUZZY = 2;
// Words this short get no fuzzy matches (see rankHits).
const FUZZY_MIN_LENGTH = 5;

// What a record is, best first (recordKind).
const KIND_TITLE = 0;
const KIND_DOMAIN = 1;
const KIND_HEADING = 2;
const KIND_INTENT = 3;
const KIND_DOMAIN_TEXT = 4;
const KIND_TEXT = 5;
const KIND_KEYWORD = 6;
const KIND_EMBEDDED = 7;

// A cert guide's domains (DomainSheet) carry ids starting "sheet-", under
// one H2 whose id is this (DESIGN.md, Domain Sheet).
const DOMAIN_PREFIX = '#sheet-';
const SHEET_SECTION = '#key-commands-by-domain';
// ExamFacts' first row as the index reads it (its hidden ": " mark): the
// page-top text that holds a guide's facts. A guide whose title is the
// exam's name has no Exam row, so its sheet opens on Format.
const FACTS_MARKS = ['Exam: ', 'Format: '];

function factsAt(text) {
  const found = FACTS_MARKS.map((mark) => text.indexOf(mark)).filter((at) => at !== -1);
  return found.length ? Math.min(...found) : -1;
}
// A fact row's value that gives the figure the reader asked for: a number
// with its unit ("2 hours", "66%", "210 of 300 points"). A date is not
// one, so "Not published by Red Hat (checked October 30, 2026)" isn't.
const FIGURE =
  /\d+(?:[.,]\d+)?\s*(?:%|percent\b|hours?\b|hrs?\b|minutes?\b|mins?\b|points?\b|marks?\b|(?:out\s+)?of\s+\d|\/\s*\d)|\b(?:one|two|three|four|five|six)[\s-]+(?:hours?|minutes?)\b/i;
// A value that sends the reader elsewhere instead.
const DEFERRAL = /^\s*(?:not\b|see\b|n\/a\b|unknown\b|unpublished\b|—|-)/i;
// A word inside a machine name ("k8s" in prox-k8s-master): parts joined
// by hyphens, one of them letters and digits together.
const MACHINE_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)+$/i;
const MIXED_PART = /[a-z]\d|\d[a-z]/i;
// lunr's English stop words (lunr.stopWordFilter). The index leaves them
// out and the worker drops them from a query, so no hit holds them and
// they never count as a word to find ("how", "for").
const STOP_WORDS = new Set(
  ('a able about across after all almost also am among an and any are as at be because been but by ' +
    'can cannot could dear did do does either else ever every for from get got had has have he her ' +
    'hers him his how however i if in into is it its just least let like likely may me might most ' +
    'must my neither no nor not of off often on only or other our own rather said say says she ' +
    'should since so some than that the their them then there these they this tis to too twas us ' +
    'wants was we were what when where which while who whom why will with would yet you your').split(' '),
);

// The index holds stemmed words ("tips" is stored as "tip"), so a query
// word is compared through the same stemmer. lunr is the worker's
// library; here it loads on first use, outside the main bundle.
let stem = (word) => word;
let stemmerPromise;
export function loadStemmer() {
  stemmerPromise ??= import('lunr').then((mod) => {
    const lunr = mod.default ?? mod;
    stem = (word) => lunr.stemmer(new lunr.Token(word)).toString();
  });
  return stemmerPromise;
}

/*
 * Each page's and section's opening text, and its tags, from the same
 * index the worker searches: openings for rows whose own hit holds no
 * excerpt (a page found by its title or tags, a heading found without
 * the text under it), tags for taggedWith. The browser
 * already has the file (the worker fetched it), so this is a revalidation,
 * not a second download. Without it (dev, or a failed fetch) rows keep
 * what they had.
 */
let intros = null;
let introsPromise;
const INTRO_LENGTH = 240;
export function loadIntros(baseUrl) {
  introsPromise ??= fetch(`${baseUrl}${searchIndexUrl.replace('{dir}', '')}`)
    .then((response) => (response.ok ? response.json() : null))
    .then((json) => {
      if (!Array.isArray(json)) return;
      const pages = new Map();
      const sections = new Map();
      // Headings with no anchor (a credential's name) by page and text.
      const named = new Map();
      // Content records come in page order; the first one wins.
      const content = [...(json[CONTENT]?.documents ?? [])].sort((a, b) => a.i - b.i);
      for (const doc of content) {
        const text = doc.t.slice(0, INTRO_LENGTH);
        const map = doc.h ? sections : pages;
        const key = doc.u + (doc.h ?? '');
        if (!map.has(key)) map.set(key, text);
        if (!doc.h && doc.s) named.set(`${doc.u}\n${doc.s}`, text);
      }
      // What each page says it is about: its description and the first
      // sentence of its opening (isAbout).
      const summaries = new Map();
      for (const [url, text] of pages) summaries.set(url, text.split(/(?<=[.!?])\s/)[0]);
      // A page with no text before its first heading: its description.
      for (const doc of json[DESCRIPTION]?.documents ?? []) {
        if (!pages.has(doc.u)) pages.set(doc.u, doc.t.slice(0, INTRO_LENGTH));
        summaries.set(doc.u, `${doc.t} ${summaries.get(doc.u) ?? ''}`);
      }
      // Each page's tags. The worker returns one record per page across
      // its indexes, so a page whose description matched never shows its
      // tags matching too; taggedWith reads them from here instead.
      const tags = new Map();
      for (const doc of json[KEYWORDS]?.documents ?? []) {
        tags.set(doc.u, doc.t.split(',').map((tag) => tag.trim()).filter(Boolean));
      }
      intros = {pages, sections, named, tags, summaries};
    })
    .catch(() => {});
  return introsPromise;
}

// Queries that match well, offered when a search finds nothing (the
// dropdown and /search).
export const EXAMPLE_QUERIES = ['Kubernetes', 'SELinux', 'RHCSA'];

export function examplesLead() {
  return translate({
    id: 'theme.SearchPage.suggestions',
    message: 'Try a tool or exam name:',
    description: 'Lead-in to example queries on the /search page',
  });
}

export function noMatchesMessage(query) {
  return translate(
    {
      id: 'theme.SearchBar.noMatches',
      message: 'No matches for “{query}”.',
      description: 'Search dropdown, no results; example queries follow',
    },
    {query},
  );
}

// Copy shared by the dropdown and /search for the per-word fallback.
export function partialMessage() {
  return translate({
    id: 'theme.Search.partialResults',
    message: 'No page has all of these words.',
    description: 'Search: no page matches every word of a multi-word query; per-word results follow',
  });
}

// The line over results when some words of the query are nowhere in the
// handbook (findAnswers): "Not found: “zxqvbn”".
export function missingMessage(words) {
  return translate(
    {
      id: 'theme.Search.missing',
      message: 'Not found: {words}',
      description: 'Search: words of the query that no page holds; results for the other words follow',
    },
    {words: words.map((word) => `“${word}”`).join(', ')},
  );
}

// The note over results the query did not find as typed (queryNote).
export function noteMessage(note, {long = false} = {}) {
  if (note.corrected) {
    return long
      ? translate(
          {
            id: 'theme.Search.correctedLong',
            message: 'No exact matches for “{typed}”. Showing results for “{query}”.',
            description: '/search: the query had no exact match; results for the closest spelling follow',
          },
          {typed: note.typed, query: note.corrected},
        )
      : translate(
          {
            id: 'theme.Search.corrected',
            message: 'Showing results for “{query}”',
            description: 'Search dropdown: results are for the closest spelling of the query',
          },
          {query: note.corrected},
        );
  }
  return translate(
    {
      id: 'theme.Search.expanded',
      message: 'Also searched for “{query}”',
      description: 'Search: a shorthand in the query (k8s) was also searched spelled out',
    },
    {query: note.expanded},
  );
}

export function termGroupLabel(term) {
  return translate(
    {
      id: 'theme.Search.termGroup',
      message: 'Pages matching “{term}”',
      description: 'Search: label over the pages that match one word of a multi-word query',
    },
    {term},
  );
}

/** A query's words, as the plugin splits them (spaces and hyphens). */
export function queryTerms(query) {
  const words = query.toLowerCase().match(/[^-\s]+/g) ?? [];
  return [...new Set(words)];
}

/**
 * The intents a query holds (intents.js), and its other words: those
 * name the pages the intents are narrowed to. Words compare stemmed, so
 * "tips" holds "tip" and "commands" holds "command".
 */
export function matchIntents(query) {
  const typed = (query.toLowerCase().match(/[^-\s]+/g) ?? [])
    .map((word) => word.replace(/^\W+|\W+$/g, ''))
    .filter(Boolean);
  const stems = typed.map((word) => stem(word));
  const used = new Set();
  const intents = [];
  for (const intent of INTENTS) {
    for (const phrase of intent.phrases) {
      const target = phrase.split(/[-\s]+/).map((word) => stem(word));
      const at = stems.findIndex((_, i) =>
        target.every((word, j) => stems[i + j] === word),
      );
      if (at === -1) continue;
      target.forEach((_, j) => used.add(at + j));
      intents.push(intent);
      break;
    }
  }
  const rest = typed.filter((word, i) => !used.has(i) && !FILLER.has(word));
  const learnStems = LEARN_WORDS.map((word) => stem(word));
  const learn = stems.some((word) => learnStems.includes(word));
  return {intents, rest: [...new Set(rest)], learn};
}

/** The query with its shorthand spelled out (intents.js), or null. */
export function withSynonyms(query) {
  const words = query.toLowerCase().match(/[^-\s]+/g) ?? [];
  let changed = false;
  const spelled = words.map((word) => {
    const bare = word.replace(/^\W+|\W+$/g, '');
    if (!Object.hasOwn(SYNONYMS, bare)) return word;
    changed = true;
    return SYNONYMS[bare];
  });
  return changed ? spelled.join(' ') : null;
}

// Whether a hit matched one of these words (as the index stores them).
function matchesWord(result, words) {
  const keys = Object.keys(result.metadata ?? {});
  return words.some((word) => {
    const stemmed = stem(word);
    return keys.some(
      (key) =>
        key === word || key === stemmed || key.startsWith(word) || key.startsWith(stemmed),
    );
  });
}

// Whether a hit is what the intent points at: the named heading or the
// text under it (for an excerpt), or the page-top text with the facts.
function answers(intent, {document: doc, type}) {
  if (intent.heading) {
    const name = intent.heading.toLowerCase();
    if (type === HEADING) return doc.t.trim().toLowerCase() === name;
    return type === CONTENT && Boolean(doc.h) && doc.s?.trim().toLowerCase() === name;
  }
  return type === CONTENT && !doc.h && factsAt(doc.t) !== -1;
}

const recordKey = ({document: doc, type}) => `${type} ${doc.i} ${doc.u}${doc.h ?? ''}`;

/**
 * The pages a query's other words name, by title or tags ("ckad" names
 * the CKAD guide): {urls, naming (the words that named one)}. urls is
 * null when they name none, so the intent stays on every guide ("exam
 * day nerves").
 */
async function pagesNamed(words, search) {
  if (words.length === 0) return {urls: null, naming: new Set()};
  const lists = await Promise.all(words.map((word) => search(word)));
  const urls = new Set();
  const naming = new Set();
  lists.forEach((list, i) => {
    for (const hit of list) {
      if ((hit.type === TITLE || hit.type === KEYWORDS) && matchQuality(hit) !== null) {
        urls.add(hit.document.u);
        naming.add(words[i]);
      }
    }
    // Tags the worker's answer left out (see loadIntros).
    const stemmed = stem(words[i]);
    for (const [url, tags] of intros?.tags ?? []) {
      if (tags.some((tag) => tag.toLowerCase().split(/[-\s]+/).some((w) => stem(w) === stemmed))) {
        urls.add(url);
        naming.add(words[i]);
      }
    }
  });
  return {urls: urls.size > 0 ? urls : null, naming};
}

/**
 * The query's hits, plus what its intents point at: each intent's target
 * is searched for, kept where it answers (the named heading, or a guide's
 * fact sheet) on the pages the query names, and merged. A record the
 * query found itself is only marked as an intent hit, never doubled.
 * A query with shorthand in it is also searched spelled out, and merged
 * the same way (marked _synonym). With an intent, body text that matched
 * none of the query's other words goes ("how long": the fact sheet, not
 * every "long" in the handbook). Certification words mark the cert
 * guides' hits _learn, for orderByMatch.
 *
 * @param search (query) => Promise of plugin hits
 */
export async function searchWithIntents(query, search) {
  const {intents, rest, learn} = matchIntents(query);
  const spelled = withSynonyms(query);
  const [direct, synonymHits, named, ...lists] = await Promise.all([
    search(query),
    spelled ? search(spelled) : [],
    pagesNamed(intents.length > 0 ? rest : [], search),
    ...intents.map((intent) => search(intent.heading ?? intent.fact)),
  ]);
  const merged = direct.slice();
  const at = new Map(merged.map((hit, i) => [recordKey(hit), i]));
  // "kube" is how "kubernetes" begins: its hits rank as the prefix
  // matches they would be. "k8s" is not: its hits rank as typed.
  const typed = queryTerms(query);
  const partial = typed.some((word) => SYNONYMS[word]?.startsWith(word));
  for (const hit of synonymHits) {
    const key = recordKey(hit);
    const marked = {...hit, _synonym: partial ? 'prefix' : 'whole'};
    if (!at.has(key)) {
      at.set(key, merged.length);
      merged.push(marked);
    } else if (
      matchQuality(merged[at.get(key)]) === null ||
      inMachineName(merged[at.get(key)])
    ) {
      // The query as typed reached this record only by a fuzzy match
      // rankHits drops ("k8s" ~ "k3s"), or only inside a hostname
      // (prox-k8s-master); the spelled-out word holds it as text.
      merged[at.get(key)] = marked;
    }
  }
  intents.forEach((intent, n) => {
    for (const hit of lists[n]) {
      if (!answers(intent, hit)) continue;
      if (named.urls && !named.urls.has(hit.document.u)) continue;
      const key = recordKey(hit);
      if (at.has(key)) {
        const found = merged[at.get(key)];
        // A fact sheet keeps the first label it was asked for (factRow).
        merged[at.get(key)] = {...found, _intent: true, _fact: found._fact ?? intent.fact};
      } else {
        at.set(key, merged.length);
        merged.push({...hit, _intent: true, _fact: intent.fact, _mapped: true});
      }
    }
  });
  // With an intent, a hit the intent did not choose stays if it matched
  // one of the query's other words that is not a page's name, or is a
  // title or heading holding the intent's words whole: never body text,
  // never "long" in "Longhorn", and in "ckad how long" never a paragraph
  // that says "CKAD" and "long".
  const content = rest.filter((word) => !named.naming.has(word));
  const restWords = content.concat(content.map((word) => SYNONYMS[word]).filter(Boolean));
  const kept =
    intents.length === 0
      ? merged
      : merged.filter(
          (hit) =>
            hit._intent ||
            matchesWord(hit, restWords) ||
            (hit.type !== CONTENT &&
              hit.type !== DESCRIPTION &&
              matchQuality(hit) === EXACT),
        );
  if (!learn) return kept;
  return kept.map((hit) =>
    hit.document.u.startsWith(LEARN_PATH) ? {...hit, _learn: true} : hit,
  );
}

// The words of a query a page must hold: as typed, less lunr's stop
// words, which the worker drops too.
function contentWords(query) {
  return queryTerms(query)
    .map((word) => word.replace(/^\W+|\W+$/g, ''))
    .filter((word) => word && !STOP_WORDS.has(word));
}

// Whether a hit holds a word of the query: the worker lists the words
// each hit answered (fewer than the query's when it left one out), and a
// hit for spelled-out shorthand holds the shorthand ("kubernetes", "k8s").
function holds(hit, word) {
  return (hit.tokens ?? []).some((token) => {
    const bare = token.replace(/^\W+|\W+$/g, '');
    return bare === word || SYNONYMS[word] === bare;
  });
}

// A hit rankHits keeps.
const survives = (hit) => Boolean(hit._intent) || matchQuality(hit) !== null;

// The hits on pages that hold every word, in any of their hits.
function onPagesWithAll(results, words) {
  const held = new Map();
  for (const hit of results) {
    if (!survives(hit)) continue;
    const url = hit.document.u;
    if (!held.has(url)) held.set(url, new Set());
    for (const word of words) if (holds(hit, word)) held.get(url).add(word);
  }
  return results.filter((hit) => held.get(hit.document.u)?.size === words.length);
}

/**
 * The answer to a query, every word counted (header comment):
 * {query (the words the results are for), results, missing (words no
 * page holds), groups ([{term, results}] when no page holds all the
 * words found: the per-word fallback)}. A query with an intent is
 * answered as searchWithIntents answers it: its other words name the
 * page to look in ("ckad tips"), they are not text to find.
 *
 * @param search (query) => Promise of plugin hits
 */
export async function findAnswers(query, search) {
  const results = await searchWithIntents(query, search);
  const words = contentWords(query);
  const answer = {query, results, missing: [], groups: []};
  if (words.length < 2) return answer;
  if (matchIntents(query).intents.length > 0 && results.length > 0) return answer;
  const whole = onPagesWithAll(results, words);
  if (whole.length > 0) return {...answer, results: whole};
  // No page holds every word. Each word on its own: which are anywhere?
  const lists = await Promise.all(words.map((word) => searchWithIntents(word, search)));
  const found = words.filter((_, i) => lists[i].some(survives));
  const missing = words.filter((word) => !found.includes(word));
  const listOf = (word) => lists[words.indexOf(word)];
  if (found.length === 0) return {...answer, results: [], missing};
  if (missing.length > 0) {
    // The words found, searched without the others.
    const rest = found.join(' ');
    const hits =
      found.length === 1
        ? listOf(found[0])
        : onPagesWithAll(await searchWithIntents(rest, search), found);
    if (hits.length > 0) return {query: rest, results: hits, missing, groups: []};
  }
  return {
    ...answer,
    results: [],
    missing,
    groups: found.map((word) => ({term: word, results: listOf(word)})),
  };
}

// The word in a hit's text that an index key matched ("kubernet" ->
// "kubernetes"), lowercased, or null.
function surfaceOf(result, key) {
  const position = result.metadata?.[key]?.t?.position?.[0];
  if (!position) return null;
  const [start, length] = position;
  const word = result.document.t.slice(start, start + length);
  return word.toLowerCase().replace(/^\W+|\W+$/g, '') || null;
}

function editDistance(a, b) {
  let row = Array.from({length: b.length + 1}, (_, j) => j);
  for (let i = 1; i <= a.length; i += 1) {
    const next = [i];
    for (let j = 1; j <= b.length; j += 1) {
      next[j] = Math.min(
        row[j] + 1,
        next[j - 1] + 1,
        row[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    row = next;
  }
  return row[b.length];
}

/**
 * What the results answer, when it is not the query as typed: {typed,
 * corrected} when a word matched nowhere as typed and only the plugin's
 * fuzzy pass found it ("kubernetis" -> "kubernetes"), or {expanded} when
 * a shorthand was also searched spelled out ("k8s" -> "kubernetes").
 * Null otherwise. Shown above the results and said in the status line.
 */
export function queryNote(query, results) {
  if (results.length === 0) return null;
  const words = queryTerms(query)
    .map((word) => word.replace(/^\W+|\W+$/g, ''))
    .filter(Boolean);
  const literal = (key, word) => {
    const stemmed = stem(word);
    return key === word || key === stemmed || key.startsWith(word) || key.startsWith(stemmed);
  };
  // Words an intent answered ("cheat sheet") are not corrected: the
  // intent, not their spelling, found the results.
  const {rest} = matchIntents(query);
  let changed = false;
  const corrected = words.map((word) => {
    if (word.length < FUZZY_MIN_LENGTH || !rest.includes(word)) return word;
    const stemmed = stem(word);
    // Index keys the hits for this word matched that no word of the query
    // spells: the fuzzy pass's corrections, nearest first.
    let best = null;
    for (const result of results) {
      if (result._mapped || result._synonym || !result.tokens?.includes(word)) continue;
      for (const key of Object.keys(result.metadata ?? {})) {
        if (literal(key, word)) return word;
        if (words.some((other) => literal(key, other))) continue;
        const distance = editDistance(key, stemmed);
        if (best && best.distance <= distance) continue;
        const surface = surfaceOf(result, key);
        if (surface) best = {distance, surface};
      }
    }
    if (!best) return word;
    changed = true;
    return best.surface;
  });
  if (changed) return {typed: words.join(' '), corrected: corrected.join(' ')};
  const spelled = withSynonyms(query);
  if (spelled && results.some((result) => result._synonym)) {
    const added = (spelled.match(/[^-\s]+/g) ?? []).filter(
      (word) => !words.includes(word),
    );
    return {expanded: [...new Set(added)].join(' ')};
  }
  return null;
}

function matchQuality(result) {
  const indexed = Object.keys(result.metadata ?? {});
  let worst = EXACT;
  for (const raw of result.tokens ?? []) {
    // lunr trims punctuation off indexed words; trim the query word too.
    const word = raw.replace(/^\W+|\W+$/g, '');
    if (!word) continue;
    const stemmed = stem(word);
    let best = FUZZY;
    for (const key of indexed) {
      if (key === word || key === stemmed) {
        best = EXACT;
        break;
      }
      if (key.startsWith(word) || key.startsWith(stemmed)) best = PREFIX;
    }
    if (best === FUZZY && word.length < FUZZY_MIN_LENGTH) return null;
    worst = Math.max(worst, best);
  }
  return worst;
}

/**
 * Drops fuzzy-only matches on short words and ranks the rest by match
 * quality. The sort is stable, so the plugin's order (titles first, a
 * page's hits together) holds within each tier.
 */
function rankHits(results) {
  return results
    // An intent hit was chosen for what it answers, not how it spells. A
    // hit for a synonym that only completes the typed word ranks as a
    // prefix match ("kube": kubestronaut-sim's title still leads).
    .map((result) => {
      if (result._intent) return {result, quality: EXACT};
      const quality = matchQuality(result);
      const partial = result._synonym === 'prefix' && quality !== null;
      return {result, quality: partial ? Math.max(quality, PREFIX) : quality};
    })
    .filter((item) => item.quality !== null)
    .sort((a, b) => a.quality - b.quality);
}

function recordKind(result) {
  if (result._intent) return Math.min(baseKind(result), KIND_INTENT);
  return inMachineName(result) ? KIND_EMBEDDED : baseKind(result);
}

/**
 * Whether body text matched the query only inside machine names: "k8s"
 * in the hostname prox-k8s-master is not a page about Kubernetes. Such a
 * hit ranks last (KIND_EMBEDDED). A name the reader typed whole
 * ("prox-k8s-master") is a match like any other; so is a command
 * ("nmcli", "kubectl rollout"), which stands as its own word.
 */
function inMachineName({document: doc, type, metadata, tokens}) {
  if (type !== CONTENT && type !== DESCRIPTION) return false;
  const typed = new Set((tokens ?? []).map((word) => word.toLowerCase()));
  const positions = getStemmedPositions(metadata ?? {}, 't');
  return (
    positions.length > 0 &&
    positions.every(([start, length]) => {
      let from = start;
      let to = start + length;
      while (from > 0 && !/\s/.test(doc.t[from - 1])) from -= 1;
      while (to < doc.t.length && !/\s/.test(doc.t[to])) to += 1;
      const word = doc.t.slice(from, to).replace(/^\W+|\W+$/g, '');
      if (!MACHINE_NAME.test(word)) return false;
      const parts = word.toLowerCase().split('-');
      return parts.some((part) => MIXED_PART.test(part)) && !parts.every((part) => typed.has(part));
    })
  );
}

function baseKind({document: doc, type}) {
  if (type === TITLE) return KIND_TITLE;
  const domain = (doc.h ?? '').startsWith(DOMAIN_PREFIX);
  if (type === HEADING) return domain ? KIND_DOMAIN : KIND_HEADING;
  if (type === KEYWORDS) return KIND_KEYWORD;
  return domain ? KIND_DOMAIN_TEXT : KIND_TEXT;
}

// [quality, kind, -score]: lower is better, compared in that order.
function rankOf(quality, result) {
  return [quality, recordKind(result), -(result.score ?? 0)];
}

function compareRanks(a, b) {
  for (let i = 0; i < a.length; i += 1) {
    if (Math.abs(a[i] - b[i]) > 1e-9) return a[i] - b[i];
  }
  return 0;
}

const better = (rank, best) => !best || compareRanks(rank, best) < 0;

/** HTML for a short line (title, heading): whole, matched terms marked. */
function markLine(text, result, field) {
  if (field) {
    return highlightStemmed(
      text,
      getStemmedPositions(result.metadata, field),
      result.tokens,
      text.length + 1,
    );
  }
  return highlight(text, result.tokens);
}

/**
 * HTML for a section's opening, about `length` characters, cut at a word:
 * the excerpt of a section found only through an intent, which holds none
 * of the reader's words to centre on.
 */
function openingExcerpt(text, length) {
  if (text.length <= length) return escapeHtml(text);
  const cut = text.lastIndexOf(' ', length);
  return `${escapeHtml(text.slice(0, cut > 0 ? cut : length))}…`;
}

/**
 * The row of a guide's fact sheet that holds `fact` ("Duration"), in the
 * page-top text: {start (where the row's labels begin), label, end (of
 * the label), figure (its value gives a number and unit)}, or null.
 * Unstated facts share a row ("Duration, Pass mark: Not stated here…")
 * or a line under the list ("Duration, pass mark and as-of date: see…");
 * either way their value defers, so there is no figure. A row's source
 * follows its value after a " · " ("210 of 300 points · my sitting,
 * 2024"), so the value ends there and the excerpt still carries it.
 */
function factRow(text, fact) {
  const facts = factsAt(text);
  if (facts === -1) return null;
  const label = text.toLowerCase().indexOf(fact.toLowerCase(), facts);
  if (label === -1) return null;
  const colon = text.indexOf(': ', label);
  if (colon === -1) return null;
  // The row starts after the last " · " before the label, or at the
  // label when another row's value comes between (the line under the
  // list follows the last row with no mark).
  const before = text.lastIndexOf(' · ', label);
  const start = before >= facts && !text.slice(before + 3, label).includes(': ') ? before + 3 : label;
  const next = text.indexOf(' · ', colon);
  const value = text.slice(colon + 2, next === -1 ? colon + 62 : next);
  return {
    start,
    label,
    end: label + fact.length,
    figure: !DEFERRAL.test(value) && FIGURE.test(value),
  };
}

// ExamFacts' id for a fact's row: "Pass mark" -> "#fact-pass-mark". A
// row that gives two facts carries the first's id and the other's as an
// alias, so either lands on it.
function factHash(fact) {
  return `#fact-${fact.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

/**
 * HTML for a fact sheet's row and what follows it, the label marked. It
 * opens on the row's labels, as a fact line does, with no lead "…".
 */
function factExcerpt(text, row, length) {
  const rest = openingExcerpt(text.slice(row.end), length - (row.end - row.start));
  return `${escapeHtml(text.slice(row.start, row.label))}<mark>${escapeHtml(text.slice(row.label, row.end))}</mark>${rest}`;
}

/** HTML for an excerpt around the first match, about `length` characters. */
function markExcerpt(result, length) {
  return highlightStemmed(
    result.document.t,
    getStemmedPositions(result.metadata, 't'),
    result.tokens,
    length,
  );
}

/**
 * @param results hits from searchByWorker, best first
 * @param excerptLength characters of context around a match
 * @returns pages, best first: {key, title, titleHtml, url, crumbs,
 *   excerptHtml, matched (the page itself matched), hit (its best
 *   page-level hit), sections: [{key, title, titleHtml, url, excerptHtml,
 *   hit}], count (hits folded in)}
 */
export function groupByPage(results, excerptLength) {
  const pages = new Map();

  for (const {result, quality} of rankHits(results)) {
    const {document: doc, type} = result;
    const rank = rankOf(quality, result);
    const pageDoc = type === TITLE ? doc : result.page;
    const url = pageDoc?.u ?? doc.u;
    const title = pageDoc?.t ?? doc.s ?? doc.t;

    let page = pages.get(url);
    if (!page) {
      const crumbs = (pageDoc?.b ?? []).slice();
      if (crumbs[crumbs.length - 1] === title) crumbs.pop();
      page = {
        key: url,
        title,
        titleHtml: escapeHtml(title),
        url,
        crumbs,
        excerptHtml: null,
        matched: false,
        titleMatched: false,
        sections: [],
        hit: null,
        count: 0,
        rank: null,
        order: pages.size,
        tags: [],
        keys: new Set(),
        learn: false,
      };
      pages.set(url, page);
    }
    page.count += 1;
    if (result._learn) page.learn = true;
    // The index words this page matched, for taggedWith.
    if (!result._mapped) {
      for (const key of Object.keys(result.metadata ?? {})) page.keys.add(key);
    }

    // A heading, or a paragraph under one (a paragraph before the first
    // heading has no hash and belongs to the page itself).
    const isSection =
      type === HEADING || (type === CONTENT && Boolean(doc.h) && doc.s);
    if (!isSection) {
      page.matched = true;
      if (better(rank, page.rank)) page.rank = rank;
      if (!page.hit) page.hit = result;
      if (type === TITLE) {
        page.titleHtml = markLine(title, result, 't');
        page.hit = result;
        page.titleMatched = true;
      } else if (type === KEYWORDS) {
        // The tags that matched, as the page lists them.
        for (const [start] of getStemmedPositions(result.metadata, 't')) {
          const from = doc.t.lastIndexOf(',', start) + 1;
          const to = doc.t.indexOf(',', start);
          const tag = doc.t.slice(from, to === -1 ? undefined : to).trim();
          if (tag && !page.tags.includes(tag)) page.tags.push(tag);
        }
      }
      // An intent's excerpt (the fact sheet's row) wins over body text.
      if (
        (type === DESCRIPTION || type === CONTENT) &&
        (!page.excerptHtml || (result._intent && !page.excerptIntent))
      ) {
        const row = result._fact ? factRow(doc.t, result._fact) : null;
        page.excerptHtml = row
          ? factExcerpt(doc.t, row, excerptLength)
          : markExcerpt(result, excerptLength);
        page.excerptIntent = Boolean(result._intent);
        if (result._fact) {
          page.factDeferred = !row?.figure;
          // The row reads as the answer, so the row is where it leads.
          page.factHash = row ? factHash(result._fact) : null;
        }
      }
      continue;
    }

    const heading = type === HEADING ? doc.t : doc.s;
    const sectionUrl = doc.u + (doc.h || '');
    // Headings with no anchor (a credential's name) all link to the page;
    // each is still its own row.
    const sectionKey = doc.h ? sectionUrl : `${sectionUrl}\n${heading}`;
    let section = page.sections.find((item) => item.key === sectionKey);
    if (!section) {
      section = {
        key: sectionKey,
        title: heading,
        // A heading found only through an intent holds none of the
        // reader's words, so nothing in it is marked.
        titleHtml: result._mapped
          ? escapeHtml(heading)
          : type === HEADING
            ? markLine(heading, result, 't')
            : markLine(heading, result),
        url: sectionUrl,
        excerptHtml: null,
        hit: result,
        rank,
        order: page.sections.length,
        intent: false,
      };
      page.sections.push(section);
    } else if (type === HEADING && !result._mapped) {
      section.titleHtml = markLine(heading, result, 't');
    }
    if (result._intent) section.intent = true;
    if (better(rank, section.rank)) section.rank = rank;
    if (type === CONTENT && !section.excerptHtml) {
      section.excerptHtml = result._mapped
        ? openingExcerpt(doc.t, excerptLength)
        : markExcerpt(result, excerptLength);
    }
  }

  return orderByMatch(
    dropListings(dropSheetSections([...pages.values()])).map((page) =>
      withExcerpts(taggedWith(page), excerptLength),
    ),
  );
}

// The page's tags that hold a word it matched (any of its hits), added
// to those its own tag hit marked.
function taggedWith(page) {
  const tags = intros?.tags.get(page.url) ?? [];
  const found = tags.filter(
    (tag) =>
      !page.tags.includes(tag) &&
      tag
        .toLowerCase()
        .split(/[-\s]+/)
        .some((word) => page.keys.has(stem(word))),
  );
  return found.length > 0 ? {...page, tags: page.tags.concat(found)} : page;
}

// "Tagged: kubernetes", the matched tags marked.
function taggedHtml(tags) {
  const slot = '\u0000';
  const text = translate(
    {
      id: 'theme.Search.tagged',
      message: 'Tagged: {tags}',
      description: 'Search: excerpt of a page found only by its front-matter keywords',
    },
    {tags: slot},
  );
  const marked = tags.map((tag) => `<mark>${escapeHtml(tag)}</mark>`).join(', ');
  return escapeHtml(text).replace(slot, marked);
}

/**
 * Every row gets a line under its title. A page found only by its tags
 * gives the reason first ("Tagged: kubernetes · The homelab is…"); a
 * page or section whose hit held no text of its own takes its opening
 * line (loadIntros).
 */
function withExcerpts(page, excerptLength) {
  const opening = (text) => (text ? openingExcerpt(text, excerptLength) : null);
  let {excerptHtml} = page;
  if (page.matched && page.rank?.[1] === KIND_KEYWORD && page.tags.length > 0) {
    const intro = opening(intros?.pages.get(page.url));
    excerptHtml = intro
      ? `${taggedHtml(page.tags)} · ${intro}`
      : taggedHtml(page.tags);
  } else if (page.matched && !excerptHtml) {
    excerptHtml = opening(intros?.pages.get(page.url));
  }
  const sections = page.sections.map((section) => {
    if (section.excerptHtml) return section;
    const text = section.url.includes('#')
      ? intros?.sections.get(section.url)
      : intros?.named.get(`${page.url}\n${section.title}`);
    return {...section, excerptHtml: opening(text)};
  });
  return {...page, excerptHtml, sections};
}

/**
 * A guide's "Key commands by domain" H2 matches through the text around
 * its domains (the index, Verify, In the repo). When a domain matched as
 * well, the H2's row only repeats it one row down, so it goes, unless an
 * intent asked for the sheet itself ("cheat sheet", "commands").
 */
function dropSheetSections(pages) {
  return pages
    .map((page) => {
      const sheet = page.sections.find((section) =>
        section.url.endsWith(SHEET_SECTION),
      );
      const domain = page.sections.some((section) =>
        section.url.includes(DOMAIN_PREFIX),
      );
      if (!sheet || !domain || sheet.intent) return page;
      return {...page, sections: page.sections.filter((s) => s !== sheet)};
    })
    .filter((page) => page.matched || page.sections.length > 0);
}

/**
 * Best answer first: in each page, its sections by rank; then the pages,
 * each by its best record (a page's own match or one of its sections):
 * how well it matched, then what matched, then its score. Pages tied on
 * that are ordered by their scores summed, so the guide that answers in
 * more places leads ("lvm": RHCSA's storage domain and its lab notes,
 * over RHCE's storage domain alone).
 * With a certification word in the query, the cert guides lead every
 * tier but match quality. Remaining ties keep the plugin's order.
 */
function orderByMatch(pages) {
  const byRank = (a, b) => compareRanks(a.rank, b.rank) || a.order - b.order;
  const scored = pages.map((page) => {
    const sections = [...page.sections].sort(byRank);
    const ranks = [page.rank, ...sections.map((s) => s.rank)].filter(Boolean);
    const best = ranks.reduce((a, b) => (compareRanks(b, a) < 0 ? b : a));
    // Ranks carry the score negated.
    const total = ranks.reduce((sum, rank) => sum - rank[2], 0);
    // A tag the page's text bears out: the page is about the word, so it
    // ranks with a cert guide's domains, just under a title ("kubernetes":
    // the CKAD guide over the credentials list that names the exam).
    // A hostname is not text that bears a tag out (inMachineName).
    // So does a summary that names the word: a page tagged kubernetes
    // whose description says "six nodes of K3s" is about it, even where
    // its text says k8s only in hostnames.
    const about = isAbout(page);
    let kind = best[1];
    if (page.tags.length > 0 && kind > KIND_DOMAIN && (kind < KIND_KEYWORD || about)) {
      kind = KIND_DOMAIN;
    }
    // [quality, title match, cert guide (a certification word in the
    // query), kind, a fact sheet that defers the asked-for figure, a
    // summary that names the word, score of the best record]. A page
    // named for the query still leads ("certifications expire"); "how
    // long" opens on a guide that says "2 hours", not on one that says
    // the figure isn't published; "kubernetes" puts the homelab, a K3s
    // cluster, over an essay that names the exam once.
    const tier = [
      best[0],
      kind === KIND_TITLE ? 0 : 1,
      page.learn ? 0 : 1,
      kind,
      page.factDeferred ? 1 : 0,
      about ? 0 : 1,
      best[2],
    ];
    return {...page, sections, rank: best, tier, total};
  });
  return scored.sort(
    (a, b) =>
      compareRanks(a.tier, b.tier) ||
      (Math.abs(a.total - b.total) > 1e-9 ? b.total - a.total : 0) ||
      a.order - b.order,
  );
}

/**
 * Whether a page says it is about what the query found: its title,
 * description or first sentence (loadIntros) holds a word it matched, or
 * a kind of one (intents.js KINDS: "K3s" for "kubernetes").
 */
function isAbout(page) {
  const keys = new Set(page.keys);
  for (const [word, kinds] of Object.entries(KINDS)) {
    if (keys.has(stem(word))) for (const kind of kinds) keys.add(stem(kind));
  }
  if (keys.size === 0) return false;
  const summary = `${page.title} ${intros?.summaries.get(page.url) ?? ''}`;
  return (summary.toLowerCase().match(/[a-z0-9]+/g) ?? []).some((word) => keys.has(stem(word)));
}

/**
 * Section index pages list their articles. The list is left out of the
 * index (ignoreCssSelectors in docusaurus.config.js), so a hub is found by
 * its title and intro only; this is the fallback if a listing slips back
 * in. A hub's heading that repeats the title of a page in the results is
 * dropped, and so is a hub that matched only in body text or tags when
 * one of its own pages is in the results: its tags sum up those pages,
 * which answer better themselves.
 */
function dropListings(pages) {
  const titles = new Set(pages.map((page) => page.title));
  return pages
    .map((page) => ({
      ...page,
      sections: page.sections.filter(
        (section) => section.title === page.title || !titles.has(section.title),
      ),
    }))
    .filter((page) => {
      if (!page.matched && page.sections.length === 0) return false;
      if (page.titleMatched || page.sections.length > 0) return true;
      const prefix = page.url.endsWith('/') ? page.url : `${page.url}/`;
      return !pages.some((other) => other.url.startsWith(prefix));
    });
}

/**
 * The dropdown's rows: one per page that matched as a whole, then one per
 * matched section. Each row is a plugin hit (its document carries the URL
 * the plugin navigates to) with the display data under `_row`.
 *
 * @param limit most rows to return
 * @param group a label for the first row, which then opens a group (the
 *   per-word fallback for a query no page matches as a whole)
 * @param sectionsPerPage most sections of one page, when more than one
 *   page matched: a cheat sheet can match in a dozen of its domains and
 *   would otherwise fill the panel on its own
 */
export function toRows(
  results,
  excerptLength,
  {limit = Infinity, group, sectionsPerPage = Infinity} = {},
) {
  const rows = [];
  const pages = groupByPage(results, excerptLength);
  const cap = pages.length > 1 ? sectionsPerPage : Infinity;
  for (const page of pages) {
    const entries = [];
    if (page.matched) {
      entries.push({
        // A fact row's answer leads to the row (the plugin navigates to
        // the hit's u + h).
        hit: page.factHash
          ? {...page.hit, document: {...page.hit.document, h: page.factHash}}
          : page.hit,
        primaryHtml: page.titleHtml,
        excerptHtml: page.excerptHtml,
        page: null,
      });
    }
    for (const section of page.sections.slice(0, cap)) {
      entries.push({
        hit: section.hit,
        primaryHtml: section.titleHtml,
        excerptHtml: section.excerptHtml,
        page: page.title,
      });
    }
    entries.forEach((entry, i) => {
      rows.push({
        ...entry.hit,
        _row: {
          primaryHtml: entry.primaryHtml,
          excerptHtml: entry.excerptHtml,
          page: entry.page,
          // Later rows of a page sit under its first one with no rule
          // between them; their page name is kept for screen readers only.
          continues: i > 0,
          group: rows.length === 0 ? group : undefined,
        },
      });
    });
  }
  return rows.slice(0, limit);
}
