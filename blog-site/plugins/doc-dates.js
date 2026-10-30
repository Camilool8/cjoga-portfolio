// Publication and update dates for every dated doc, keyed by route, so
// index pages can show a page's date without importing the page itself
// (an MDX import pulls the whole article into the index's bundle).
// Read straight from front matter, the same source as the article
// dateline, so an index row never disagrees with the page it links to.
// The title rides along for the landing's "Last updated" row; the
// Atom feed (plugins/docs-feed.js) reads the same records.
//
// `last_update_kind: correction` marks a last_update that only corrected
// the page (a "Since then" note, a wording fix), not new content. It
// sits beside last_update, not inside it: Docusaurus validates
// last_update strictly. The dateline then says "Corrected", and the
// landing's "Last updated" leaves the page out.

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.mdx?$/.test(entry.name) ? [full] : [];
  });
}

// docs/ is served from "/": a doc's route is its `slug`, or its path.
function routeOf(file, docsDir, frontMatter) {
  if (frontMatter.slug) return frontMatter.slug;
  const rel = path.relative(docsDir, file).replace(/\.mdx?$/, "");
  return `/${rel.replace(/(^|\/)index$/, "")}`;
}

const iso = (value) =>
  value instanceof Date ? value.toISOString().slice(0, 10) : value || null;

// Every dated doc as { route, title, description, date, updated, kind }.
// Drafts and unlisted pages are left out: they never reach a reader.
function readDatedDocs(docsDir) {
  const docs = [];
  for (const file of walk(docsDir)) {
    const { data } = matter(fs.readFileSync(file, "utf8"));
    if (!data.date && !data.last_update?.date) continue;
    if (data.draft || data.unlisted) continue;
    docs.push({
      route: routeOf(file, docsDir, data),
      title: data.title || null,
      description: data.description || null,
      date: iso(data.date),
      updated: iso(data.last_update?.date),
      kind: data.last_update_kind === "correction" ? "correction" : "update",
    });
  }
  return docs;
}

module.exports = function docDates(context) {
  const docsDir = path.join(context.siteDir, "docs");
  return {
    name: "doc-dates",
    getPathsToWatch() {
      return [`${docsDir}/**/*.{md,mdx}`];
    },
    async loadContent() {
      const dates = {};
      for (const { route, title, date, updated, kind } of readDatedDocs(docsDir)) {
        dates[route] = { title, date, updated, kind };
      }
      return dates;
    },
    async contentLoaded({ content, actions }) {
      actions.setGlobalData(content);
    },
  };
};

module.exports.readDatedDocs = readDatedDocs;
