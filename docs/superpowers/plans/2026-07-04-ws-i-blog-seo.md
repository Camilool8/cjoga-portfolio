# WS-I — Handbook platform config & SEO (2026-07-04)

Workstream I of the audit-remediation wave. Scope: `blog-site/` platform
config and SEO fixes from AUDIT-2026-07-04.md §5 (plus the §3 font-loading
item that pairs with the custom.css `@import` removal happening in another
workstream this same wave).

## Findings addressed

| Audit ref | Sev | Fix |
|---|---|---|
| §5 — live `blog.cjoga.cloud/robots.txt` absent | Critical | New `blog-site/static/robots.txt` with `Sitemap:` line |
| §3 — render-blocking Google Fonts CSS `@import` | High | Preconnect + `<link rel="stylesheet">` in `headTags` (CSS `@import` removed by sibling agent) |
| §5 — sitemap has no `<lastmod>` | Med | `lastmod: "date"` in preset sitemap options |
| §5 — docs emit `og:type=website`, no TechArticle JSON-LD | Med | New `DocItem/Metadata` swizzle |
| §5 — blog homepage title is just "cjoga.cloud" | Low | Layout title on `src/pages/index.js` |
| §5 — `twitter:site @cjoga_cloud` unverified account | Low | Remove the meta entry |
| §2 — orphaned 1.1 MB `static/img/og-image.webp` | Low | Delete (verified zero references in blog-site) |

## Changes

### 1. `blog-site/static/robots.txt` (new)

```
User-agent: *
Allow: /

Sitemap: https://blog.cjoga.cloud/sitemap.xml
```

### 2. `blog-site/docusaurus.config.js`

- **headTags**: add `preconnect` links for `fonts.googleapis.com` and
  `fonts.gstatic.com` (crossorigin), plus a stylesheet link carrying the
  exact URL currently in `custom.css:9`:
  `https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Outfit:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap`
  Decision: keep the identical families/weights rather than trimming —
  `font-weight: 600/700` appear 10/12 times across `blog-site/src` CSS and
  can't be safely attributed per-family; trimming Outfit to 300–500 would
  drop bold body text to faux-bold.
- **sitemap**: add `lastmod: "date"` (Docusaurus ≥3.5 reads `last_update`
  frontmatter); keep existing `changefreq`/`priority`/`ignorePatterns`.
- **themeConfig.metadata**: remove `{ name: "twitter:site", content: "@cjoga_cloud" }`.

### 3. `blog-site/src/pages/index.js`

Layout `title` → `Camilo's Handbook — DevOps Opinions, K3s Lab & Cert Guides`
(Docusaurus appends ` | cjoga.cloud` automatically; no site name in the
string, so no double branding).

### 4. `blog-site/src/theme/DocItem/Metadata/index.js` (new swizzle)

Wraps `@theme-original/DocItem/Metadata` and appends a `<Head>` with:

- TechArticle JSON-LD: `headline` (doc title), `description`, `image`
  (frontmatter `image` resolved absolute via `useBaseUrl(..., {absolute: true})`),
  `datePublished` (frontmatter `date`), `dateModified` (`last_update.date`),
  `author` → `{"@type":"Person","@id":"https://cjoga.cloud/#person","name":"José Camilo Joga Guerrero"}`,
  `mainEntityOfPage` → the doc's canonical URL.
- `<meta property="og:type" content="article" />` on doc pages (Helmet
  dedupes against the global `website` meta), and
  `article:published_time` / `article:modified_time` only when the
  respective frontmatter dates exist.
- **All fields guarded** — hub/index pages without `date`/`image` emit a
  minimal-but-valid JSON-LD (or none if the doc context is unavailable).

Known gotcha (documented in `DocItem/Content/index.js`): under this
project's Rspack **dev** resolution, `useDoc()` from
`@docusaurus/plugin-content-docs/client` in a `src/` swizzle can resolve a
different module instance and throw "outside DocProvider". Mitigation:
wrap the `useDoc()` call in try/catch and render only the original
Metadata when it fails — dev degrades gracefully, production build (where
resolution is consistent) emits the full JSON-LD.

### 5. Delete `blog-site/static/img/og-image.webp`

1.1 MB, referenced by nothing under `blog-site/` (verified by grep across
`blog-site/src`, config, and content). All `og-image` hits in the repo
point at the portfolio's `public/images/og-image.{png,webp}`, which the
brand script generates separately.

## Verification

- Node parse/syntax check of `docusaurus.config.js` and both JS files.
- `cat blog-site/static/robots.txt`.
- `grep -n "lastmod\|fonts.gstatic\|twitter:site" blog-site/docusaurus.config.js`.
- `ls blog-site/static/img/og-image.webp` → gone.
- No `npm run build` here — the wave gate builds (shared `build/` races).
