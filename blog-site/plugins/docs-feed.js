// An Atom feed of the handbook's dated pages, written to /atom.xml after
// the build, for readers who follow sites in a feed reader instead of
// checking back. The docs plugin has no feed of its own (only the blog
// plugin does), so this builds one from the same front matter as the
// article dateline (plugins/doc-dates.js): an entry's <published> is its
// `date`, its <updated> the later of `date` and `last_update.date`.
// Only pages the build actually emitted are listed, newest change first.
// A correction still moves <updated> (the page did change), and says so
// with a "correction" category a reader can filter on.
//
// Opened in a browser, the feed reads as a page, not raw XML: static/
// atom.css styles it, and a few XHTML elements carry what CSS can't (a
// real heading, the "this is a feed" note, a link per entry, a readable
// date). Atom allows elements from other namespaces anywhere in a feed or
// an entry, and feed readers skip ones they don't know, so the document
// stays valid Atom. Not XSLT: Chrome now warns on every XSLT page and
// removes XSLT in late 2026.

const fs = require("fs");
const path = require("path");
const { readDatedDocs } = require("./doc-dates");

const FEED_PATH = "atom.xml";

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

// The later of the two days: an update older than its page is a typo.
const latest = (doc) => [doc.date, doc.updated].filter(Boolean).sort().pop();

// Front matter dates are days; Atom wants an RFC 3339 timestamp.
const stamp = (day) => `${day}T00:00:00Z`;

const MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");

// "2026-10-30" reads "Oct 30, 2026", as in the article dateline.
const human = (day) => {
  const [y, m, d] = day.split("-").map(Number);
  return `<h:time datetime="${day}">${MONTHS[m - 1]} ${d}, ${y}</h:time>`;
};

// The entry's dateline for the browser view.
const dateline = (doc) => {
  if (!doc.date) return `Updated ${human(doc.changed)}`;
  const line = [`Published ${human(doc.date)}`];
  if (doc.changed !== doc.date) {
    const verb = doc.kind === "correction" && doc.updated === doc.changed ? "Corrected" : "Updated";
    line.push(`${verb} ${human(doc.changed)}`);
  }
  return line.join(" · ");
};

module.exports = function docsFeed(context) {
  const docsDir = path.join(context.siteDir, "docs");
  return {
    name: "docs-feed",
    async postBuild({ siteConfig, routesPaths, outDir }) {
      const site = siteConfig.url.replace(/\/$/, "");
      const base = siteConfig.baseUrl.replace(/\/$/, "");
      const absolute = (route) => `${site}${base}${route}`;
      const built = new Set(routesPaths);

      const entries = readDatedDocs(docsDir)
        .filter((doc) => doc.title && built.has(`${base}${doc.route}`))
        .map((doc) => ({ ...doc, changed: latest(doc) }))
        .sort(
          (a, b) =>
            b.changed.localeCompare(a.changed) ||
            (b.date || "").localeCompare(a.date || "") ||
            a.title.localeCompare(b.title),
        );
      if (entries.length === 0) return;

      const author = "José Camilo Joga Guerrero";
      const home = escapeXml(absolute("/"));
      const self = escapeXml(absolute(`/${FEED_PATH}`));
      const xml = [
        '<?xml version="1.0" encoding="utf-8"?>',
        `<?xml-stylesheet type="text/css" href="${escapeXml(`${base}/atom.css`)}"?>`,
        '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:h="http://www.w3.org/1999/xhtml" xml:lang="en">',
        `  <id>${escapeXml(absolute("/"))}</id>`,
        `  <title>${escapeXml(siteConfig.title)}</title>`,
        `  <subtitle>${escapeXml(siteConfig.tagline)}</subtitle>`,
        `  <link rel="alternate" type="text/html" href="${escapeXml(absolute("/"))}"/>`,
        `  <link rel="self" type="application/atom+xml" href="${escapeXml(absolute(`/${FEED_PATH}`))}"/>`,
        `  <updated>${stamp(entries[0].changed)}</updated>`,
        "  <author>",
        `    <name>${escapeXml(author)}</name>`,
        "    <uri>https://cjoga.cloud/</uri>",
        "  </author>",
        `  <icon>${escapeXml(absolute("/img/apple-touch-icon.png"))}</icon>`,
        // The browser view's opening (static/atom.css). A browser reads
        // the viewport, icon and title from XHTML elements even here.
        '  <h:meta name="viewport" content="width=device-width, initial-scale=1"/>',
        `  <h:link rel="icon" type="image/svg+xml" href="${escapeXml(`${base}/img/logo.svg`)}"/>`,
        `  <h:title>Feed | ${escapeXml(siteConfig.title)}</h:title>`,
        '  <h:header class="feed-bar">',
        `    <h:a class="feed-brand" href="${home}"><h:img src="${escapeXml(`${base}/img/logo.svg`)}" width="28" height="28" alt=""/><h:span>cjoga.cloud<h:span class="feed-muted"><h:span aria-hidden="true">/</h:span>handbook</h:span></h:span></h:a>`,
        "  </h:header>",
        '  <h:div class="feed-intro">',
        `    <h:h1 class="feed-title">${escapeXml(siteConfig.title)} feed</h:h1>`,
        '    <h:p class="feed-lede">This is a feed, not a page to read here. Paste its address into a feed reader to hear about new and updated pages as they land.</h:p>',
        `    <h:p class="feed-address"><h:span class="feed-label">Feed address</h:span><h:code>${self}</h:code></h:p>`,
        `    <h:p class="feed-lede">Or <h:a href="${home}">read the handbook</h:a> in the browser.</h:p>`,
        '    <h:h2 class="feed-h2">Pages, newest change first</h:h2>',
        "  </h:div>",
        ...entries.flatMap((doc) => [
          "  <entry>",
          `    <id>${escapeXml(absolute(doc.route))}</id>`,
          `    <title>${escapeXml(doc.title)}</title>`,
          `    <link rel="alternate" type="text/html" href="${escapeXml(absolute(doc.route))}"/>`,
          `    <h:h3 class="feed-entry-title"><h:a href="${escapeXml(absolute(doc.route))}">${escapeXml(doc.title)}</h:a></h:h3>`,
          `    <h:p class="feed-date">${dateline(doc)}</h:p>`,
          ...(doc.date ? [`    <published>${stamp(doc.date)}</published>`] : []),
          `    <updated>${stamp(doc.changed)}</updated>`,
          ...(doc.kind === "correction" && doc.updated === doc.changed
            ? ['    <category term="correction" label="Correction"/>']
            : []),
          ...(doc.description
            ? [`    <summary>${escapeXml(doc.description)}</summary>`]
            : []),
          "  </entry>",
        ]),
        "</feed>",
        "",
      ].join("\n");

      await fs.promises.writeFile(path.join(outDir, FEED_PATH), xml);
    },
  };
};
