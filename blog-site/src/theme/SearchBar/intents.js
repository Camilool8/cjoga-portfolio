/**
 * Search intents: words a learner types that the guides answer under
 * other words. Shared by the navbar dropdown and /search (hits.js,
 * searchWithIntents).
 *
 * Search is lexical: "tips" never meets "Day-of guidance", and "how
 * long" never meets "Duration: 2 hours". Each entry below maps a few
 * phrases to the place that answers them. When a query holds one of the
 * phrases, the target is searched for too and merged into the results,
 * ranked like a heading match but below a heading that matched the
 * query's own words (hits.js, KIND_INTENT).
 *
 * To add one: list the phrases (lowercase; plurals match singulars, so
 * "tip" covers "tips") and name the target, either
 *   heading: the exact text of an H2 or H3, e.g. 'Day-of guidance', or
 *   fact:    an ExamFacts label, e.g. 'Duration', which points at the
 *            guide's fact sheet at the top of the page.
 * Keep phrases specific: a common word here pulls the target into every
 * search that uses it.
 *
 * Other words in the query narrow the target to the pages they name:
 * "ckad tips" finds CKAD's Day-of guidance only. Words that name no page
 * ("exam day nerves") leave every guide's target in.
 */
export const INTENTS = [
  {
    phrases: ['tip', 'exam day', 'on the day', 'day of', 'test day', 'advice'],
    heading: 'Day-of guidance',
  },
  {
    phrases: ['cheat sheet', 'cheatsheet', 'command', 'night before', 'quick reference'],
    heading: 'Key commands by domain',
  },
  {
    phrases: ['how long', 'duration', 'time limit', 'exam length', 'how much time', 'how many hours'],
    fact: 'Duration',
  },
  {
    phrases: ['pass mark', 'passing score', 'passing mark', 'pass score', 'cut score'],
    fact: 'Pass mark',
  },
];

/**
 * Shorthand a learner types for a word the guides spell out. A query
 * that holds one is also searched with the word replaced ("k8s pods"
 * also runs as "kubernetes pods"), and both answers are merged; the
 * results say so ("Also searched for kubernetes"). Keys are lowercase,
 * whole words.
 */
export const SYNONYMS = {
  k8s: 'kubernetes',
  kube: 'kubernetes',
  ex200: 'rhcsa',
  ex294: 'rhce',
};

/**
 * Words the handbook uses for a kind of another. They add nothing to a
 * search; they rank it: a page whose title, description or first
 * sentence names one ("six nodes of K3s") is about the word it is a kind
 * of ("kubernetes", and "k8s" through SYNONYMS), and leads pages that
 * only mention that word (hits.js, isAbout). Lowercase.
 */
export const KINDS = {
  kubernetes: ['k3s'],
};

// Certification vocabulary: a query that holds one of these is about the
// exams, so the cert guides (LEARN_PATH) lead its results. Compared
// stemmed, so "certifications" and "exams" count.
export const LEARN_WORDS = ['cert', 'certs', 'certification', 'certified', 'exam'];
export const LEARN_PATH = '/learn/';

// Words that only join a phrase to the page it is about ("tips for the
// ckad exam"); they never narrow the target.
export const FILLER = new Set([
  'a', 'an', 'and', 'the', 'for', 'on', 'of', 'in', 'to', 'my', 'i',
  'is', 'are', 'what', 'exam', 'cert', 'certification', 'guide',
]);
