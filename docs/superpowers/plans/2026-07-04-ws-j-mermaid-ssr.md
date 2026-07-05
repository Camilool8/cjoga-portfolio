# WS-J — Mermaid build-time SSR (handbook)

**Audit refs:** AUDIT-2026-07-04.md §3 (client-side Mermaid: docs LCP 5.7s,
428 KiB JS chunk, ~367 kB gzip of diagram chunks per diagram page) and §4
(1.1.1 — every diagram gets the identical "Architecture diagram — open in
zoom view" label).

## Goal

Render the four handbook mermaid diagrams to static SVG at build time with
`rehype-mermaid` (strategy `img-svg`), drop `@docusaurus/theme-mermaid` and
its runtime chunks entirely, keep the click-to-zoom lightbox, and give every
diagram its own descriptive alt text.

## Current state

- `blog-site/docusaurus.config.js`: `markdown.mermaid: true`,
  `themes: ["@docusaurus/theme-mermaid"]`, a `themeConfig.mermaid` block with
  light-oriented `themeVariables` (stale sky-blue palette — wave 1 rebranded
  to phosphor green: accent `#3ee07f` dark / `#0d7038` light).
- `blog-site/src/theme/Mermaid/index.js`: swizzle wrapping every diagram in
  `DiagramZoom` with the hardcoded label "Architecture diagram".
- `blog-site/src/components/DiagramZoom/`: React wrapper (hover affordance,
  role=button, Enter/Space) + `yet-another-react-lightbox` zoom modal. It
  serializes the client-rendered inline `<svg>` to a data URI slide.
- 4 mermaid fences: `docs/engineering/lab/overview.mdx`,
  `docs/engineering/work/{arctiq,fl-betances,inspyr-global-solutions}.mdx`.
- `rehype-mermaid@3.0.0` + `playwright@^1.61` already installed
  (devDependencies); chromium present in the user playwright cache.

## Key facts discovered up front

1. **rehype-mermaid alt mapping** (from installed source,
   `rehype-mermaid/dist/rehype-mermaid.js` + `mermaid-isomorphic`):
   `accTitle` → the img **`title`** attribute; `accDescr` → the img **`alt`**.
   The remit allows only `accTitle:` lines inside fences, so a tiny inline
   rehype pass in `docusaurus.config.js` (a writable file) runs after
   rehype-mermaid and, for `img[id^="mermaid"]`, promotes `title` → `alt`,
   drops the redundant `title`, and adds a `mermaid-diagram` class as a
   stable selector. Static HTML then ships per-diagram alt text.
2. **`img-svg` output shape:** a plain `<img>` with `id="mermaid-N"`,
   `width`/`height` from the SVG viewBox, and an `data:image/svg+xml` URI
   src (mini-svg-data-uri). No class by default — hence the class added by
   the inline pass.
3. **ESM:** `rehype-mermaid` is ESM-only. The config already uses ESM syntax;
   convert to Docusaurus' supported **async config function** and load the
   plugin with a dynamic `import()` so it works regardless of how the config
   is transpiled.
4. **Playwright sandbox:** `chromiumSandbox` defaults to `false` in
   Playwright, so root-in-Docker builds work without extra args. Only
   `executablePath` needs wiring (env-driven, undefined locally).
5. **Fonts:** an SVG rendered inside `<img>` cannot load web fonts, so
   JetBrains Mono can't ship inside the diagram. Use a deterministic system
   mono stack (`ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`)
   so build-time metrics match what viewers actually render.

## Design decisions

- **One color scheme, dark:** the site defaults dark; diagrams are rendered
  once with a phosphor-dark `base` theme (node fill `#1a2332`, borders
  `#3ee07f`, lines/text slate, cluster `#0e1626`, transparent background).
  A CSS card (`background: #0b0f1a`, border, radius, padding) sits behind
  every `img.mermaid-diagram` in **both** themes, so diagrams stay legible
  on the light theme. The card CSS is a `:global` rule in the DiagramZoom
  CSS module, which is pulled into the main stylesheet by the client module
  import — so the card is there pre-JS.
- **Zoom via client module** (`blog-site/src/clientModules/mermaidZoom.js`),
  not an MDXComponents override (keeps writes inside the allowed file set):
  - On `onRouteDidUpdate`, find `img.mermaid-diagram:not([data-zoom-bound])`,
    wrap each in a `role="button"`/`tabIndex=0` div reusing the DiagramZoom
    hover-affordance styles, label it from the img alt, and bind
    click + Enter/Space.
  - A single persistent React root (appended to `<body>`, outside the
    Docusaurus app root — so no hydration interference) renders the adapted
    `DiagramZoom` lightbox host; the binder hands it a slide
    (`src` = the SVG data URI, upscaled to 2400px wide for sharp zoom).
    Escape/focus handling stays with yet-another-react-lightbox.
  - Progressive enhancement: pre-JS (and no-JS) users still get the static
    diagram with alt text; only zoom needs JS — same as before, where no-JS
    users got *nothing* (client-rendered mermaid).
- **DiagramZoom adaptation:** the component becomes a slide-driven lightbox
  host (`MermaidZoomHost`) instead of a children-wrapping widget; the inline
  affordance CSS is kept and reused by the client module. The old
  `theme/Mermaid` swizzle is deleted.
- **accTitle sentences** (one per fence, derived from each diagram; no
  client names):
  - lab/overview: homelab traffic flow (Cloudflare → Envoy Gateway →
    HTTPRoutes → Tailscale-meshed K3s cluster).
  - work/arctiq: GitOps platform (GitLab CI + Terraform → EKS, FluxCD
    per-team namespaces, OTel → Grafana/Loki).
  - work/fl-betances: PR-triggered build → framework templates →
    deployment pipeline.
  - work/inspyr-global-solutions: alerts-as-code what-if → per-env release
    → Azure alerts/action groups/Grafana across NPD/PRD.
- **Dockerfile (builder stage only):** `apk add --no-cache chromium nss
  freetype harfbuzz ca-certificates ttf-freefont` +
  `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` (set **before** `npm ci` — the
  `playwright` package downloads browsers in its postinstall) +
  `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser`, wired
  through `launchOptions.executablePath` (undefined locally → playwright
  cache). Fallback A if chromium-on-alpine fails: builder base →
  `node:24-bookworm-slim` + `npx playwright install --with-deps chromium`.

## Steps

1. Plan doc (this file).
2. `docusaurus.config.js`: async config; dynamic-import `rehype-mermaid`;
   add it (+ the title→alt/class pass) to the docs preset `rehypePlugins`
   with `strategy: "img-svg"`, phosphor-dark `mermaidConfig`, and
   env-driven `launchOptions`; remove `markdown.mermaid`, the
   `theme-mermaid` theme, and the `themeConfig.mermaid` block; register the
   client module.
3. Add `accTitle:` lines to the 4 fences (fence contents only).
4. Delete `blog-site/src/theme/Mermaid/`.
5. Rework `DiagramZoom` (lightbox host + kept affordance styles + global
   card CSS) and add `src/clientModules/mermaidZoom.js`.
6. Dockerfile builder stage: chromium + env.
7. `npm run build`; inspect output HTML (selector, alt), chunk sizes vs the
   captured baseline; `npm run brand:og`.

## Baseline (before, existing `blog-site/build`)

`build/assets/js` total **4.0 MB**; top chunks:
`1134.*.js` 642,614 B (152,863 gz), `4936.*.js` 593,692 B (137,853 gz),
`4950.*.js` 428,800 B (133,869 gz), `3535.*.js` 268,178 B (75,597 gz) —
the mermaid/diagram family flagged by the audit (~367 kB gzip on diagram
pages).

## Fallback B (not expected)

If rehype-mermaid proves incompatible with Docusaurus 3.10 + faster/rspack
after two real attempts: restore config/swizzle/Dockerfile, document the
incompatibility here, report deferral. No half-migrated state.

## Results (implemented 2026-07-05)

- **Strategy used:** primary path (rehype-mermaid `img-svg`), no fallbacks.
  One wrinkle: jiti (Docusaurus' config loader) can neither evaluate
  rehype-mermaid itself (`import.meta.resolve` in mermaid-isomorphic) nor
  host a native dynamic `import()` (its VM sandbox lacks the
  dynamic-import callback). Solution: load the plugin via a native
  `createRequire(import.meta.url)` — Node ≥ 22 `require()` of ESM — which
  bypasses jiti's transform entirely.
- **Bundle:** `build/assets/js` 4.0 MB → **1.1 MB**. The mermaid chunk
  family (642 K + 593 K + 428 K + 268 K raw; ~500 kB gzip) is gone; the
  largest non-main chunk is now the overview *content* chunk (82 K raw /
  25 K gz, mostly the inlined SVG) and the lazy-loaded lightbox chunk
  (43 K raw / 16 K gz) which only loads on pages that have diagrams.
- **Static output:** each diagram page ships its SVG in the HTML
  (`img.mermaid-diagram`, `src="data:image/svg+xml,..."`) with a unique
  descriptive `alt` promoted from the fence's `accTitle` — audit §4 closed.
- **Zoom:** verified present in the shipped bundle (binder +
  `mermaid-zoom-host` in `main.*.js`, affordance/card CSS in the main
  stylesheet, yarl in a lazy chunk). Manual gate: `npm run serve`, open
  `/engineering/lab/overview`, confirm the diagram shows the dark card +
  hover affordance, click (and Tab + Enter) opens the lightbox, Escape
  closes it, then client-navigate to `/engineering/work/arctiq` and repeat
  (route-rebind path).
- `npm run brand:og` re-ran clean: 26 images regenerated in place,
  0 frontmatter patches (no new docs).
