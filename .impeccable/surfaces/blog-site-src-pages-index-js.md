---
version: 1
slug: "blog-site-src-pages-index-js"
primary_target: "blog-site/src/pages/index.js"
related_targets: ["blog-site/src/css/custom.css", "blog-site/docusaurus.config.js", "scripts/brand/tokens.css"]
---

# Surface brief: the handbook (blog.cjoga.cloud, `blog-site/`)

Mode: Read, landing included (an index you choose from, not a pitch). Confirmed with the owner 2026-10-29.

## Job and audience
Primary readers are engineers studying for CKAD, RHCSA and RHCE and peers curious about the homelab. They read long technical pages with code on desktop and dip into sections on phones. Hiring managers arrive from the portfolio's handbook band to check specifics; the handbook must read as the same site. Success: the right guide is one step away, long pages read comfortably, and portfolio and handbook share type, accent, two-tone headings and hairline rules. Copy, routes and the information structure stay as they are.

## Direction
DESIGN.md ("The Quiet Orbit") is the authority, expressed as precision and restraint.
- **Landing:** a quiet orbital band behind the intro replaces the blurred orbs: the homepage scene's planet, orbits and satellites, shorter and calmer, no labels or data. The intro heading becomes a two-tone sentence. The three entry points (hiring / studying / curious the lab) become hairline link lists like the portfolio's handbook band; their labels are Mona Sans headings, not mono uppercase eyebrows.
- **Articles:** no scene, no decoration. A calm reading column between the sidebar and TOC; hierarchy from Mona Sans weight and tone; mint for links, active sidebar/TOC items and focus.
- **Navigation:** Docusaurus's full-width bar, dropdowns (with their section labels), sidebar and mobile drawer stay, restyled in the system: dim-accent active fill, 1px hairlines.

## Rollout
- **Phase 1 (shell):** update `scripts/brand/tokens.css` to the homepage values (Mona Sans, the daylight light palette with #0e7490) and sync; `tokens:check` and `contrast:check` pass. Self-host Mona Sans in `blog-site/static/fonts`, replacing Syne/Outfit files and preloads. Navbar, dropdowns, drawer and footer (mono links become Mona Sans). The landing page. Then the owner reviews.
- **Phase 2 (articles):** reading column, dateline, TOC, pagination, code blocks and Prism, inline code, admonitions, tags, Mermaid (both themes), and the MDX components (AuthorCard, CertBadge, CourseCard, DiagramZoom, PullQuote, SectionCardGrid, TechStackGrid, Timeline). Added by the owner 2026-10-29: the social cards for both sites (`scripts/brand/og-portfolio.svg`, `og-blog-default.svg`, and the per-page cards from `build-doc-og.mjs`) get a new layout in the system.
- **Done after Phase 1 (2026-10-29):** the "Orbit C" brand mark replaced the cloud + CJ icon on both sites, including the portfolio navbar.

## Owner decisions after Phase 2 (2026-10-30)
- Reader paths reordered for the primary reader: studying (RHCSA, RHCE, CKAD, kubestronaut-sim) first, then hiring, the lab, and a new opinions group. One source: `blog-site/src/data/readerPaths.js`.
- Navbar dropdowns cut to index-level items (Me: 5, Engineering: 3); index pages and the sidebar list individual pages, with doc titles as the single source of names.

## Boundaries
Untouched: the portfolio, `docs/` content, routes, sidebar structure, SEO metadata. Anti-goals: mono for labels or ornament, the full-strength homepage hero, a floating pill nav, blurred orbs, paper-white light grounds, text under 12px.

## States
Long dropdown and sidebar titles; long code lines and wide tables scroll inside their block, never the page; Mermaid up to full width with zoom kept; the band shows a calm still frame before JS, keeps the gradient ground if the canvas fails, and holds a still frame under reduced motion; both themes on every page.

## Constraints and open decisions
The scene must be ported or shared into the separate Docusaurus build, read colours from the shared tokens, and survive static rendering. Mermaid `themeVariables` and the Prism theme are hard-coded hex and must follow the tokens, with a light set. Check whether `brand:og` depends on Syne/Outfit; if so, switch social cards to Mona Sans in the same pass. WCAG 2.2 AA in both themes.
