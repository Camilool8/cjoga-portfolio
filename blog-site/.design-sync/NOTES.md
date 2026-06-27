# design-sync notes — blog-site (handbook DS)

The Docusaurus handbook (blog.cjoga.cloud) synced as its own Claude Design
project, separate from the portfolio. These are genuine reusable presentational
components — higher fidelity than the portfolio sync.

## How the build is wired (non-obvious)

- **Shape = package, barrel entry.** No library build; `--entry` points at
  `.design-sync/barrel.jsx`, which re-exports each component (default + named)
  so they land on `window.CjogaHandbook.*`. Every export is pinned in
  `cfg.componentSrcMap`. Adding a component = barrel line + pin + preview.
- **RUN FROM THE blog-site DIRECTORY.** The converter resolves `.design-sync/`
  (previews, cache, grades) relative to the CURRENT WORKING DIR, not the config
  path. Run every command with CWD = `blog-site/`, e.g.
  `cd blog-site && node ../.ds-sync/package-build.mjs --config .design-sync/config.json --node-modules ./node_modules --entry ./.design-sync/barrel.jsx --out ./ds-bundle`.
  Running from the repo root makes it read the PORTFOLIO's `.design-sync/`
  (you'll see "stale preview: About/Hero/..." warnings — that's the tell).
- **AuthorCard was renamed `index.js` → `index.jsx`.** It contains JSX, and the
  converter's esbuild `.js` loader doesn't parse JSX (bundle.mjs is not
  forkable). All imports use the directory form (`@site/src/components/AuthorCard`),
  so the rename is transparent to Docusaurus. Keep it `.jsx`.
- **`@docusaurus/Link` is stubbed** via `cfg.tsconfig` →
  `.design-sync/stubs/docusaurus-link.jsx` (a plain anchor). The real Link needs
  the Docusaurus router, absent in the browser bundle. Used by AuthorCard and
  SectionCard.
- **`cfg.provider = PreviewFrame`** (`.design-sync/preview-providers.jsx`) only
  paints the dark brand surface behind cards (the preview scaffold forces a white
  body bg). No i18n/router context is needed by these components.

## CSS / fonts

- `cfg.cssEntry = src/css/custom.css` — plain CSS (no Tailwind/SCSS compile
  needed), with the brand `:root` tokens and a Google Fonts `@import` at the top
  (→ `[FONT_REMOTE]`, expected). Component CSS modules compile via esbuild's
  automatic `local-css` loader for `*.module.css` and ship in `_ds_bundle.css`.
- The components reference brand tokens (`--accent`, `--text-*`, `--bg-*`, …),
  all defined in custom.css. Only one stray `--ifm-leading` (a Docusaurus base
  token) is undefined — negligible.

## Grading

- All 12 graded `good` from accurate capture sheets (no framer-motion
  `whileInView` gating here, unlike the portfolio — the `?story=` captures render
  correctly).

## Known cosmetic quirk — DS-pane grouping

- The grid/sub-components land in singleton groups derived from their parent's
  directory name (`CertBadgeGrid`→certbadge, `CourseCardGrid`→coursecard,
  `SectionCard`→sectioncardgrid, `TimelineEntry`→timeline), while their parents
  sit in `general`. Cause: group derivation filters a dir segment only when it
  equals the component name; the subcomponents' names differ from the dir.
  NOT fixed because the only lever (a `docsMap` category stub) would REPLACE the
  synthesized `.prompt.md` with an empty frontmatter-only doc — a worse trade.
  Cosmetic only; the design agent reads `.prompt.md` + `.d.ts`, not the group.

## Re-sync procedure

```sh
cd blog-site
# rebuild Docusaurus only if you need a fresh compiled CSS for reference; the
# sync uses src/css/custom.css directly, so a rebuild is usually unnecessary.
cp -r "<skill-base>"/{package-build,package-validate,package-capture,resync}.mjs "<skill-base>"/lib "<skill-base>"/storybook ../.ds-sync/   # if scripts are stale
node ../.ds-sync/resync.mjs --config .design-sync/config.json --node-modules ./node_modules \
  --entry ./.design-sync/barrel.jsx --out ./ds-bundle --remote .design-sync/.cache/remote-sync.json
```
- Reuses the repo-root `../.ds-sync/` staged scripts + their node_modules
  (esbuild, ts-morph, @types/react, playwright 1.60.0 / chromium 1223, typescript).

## Re-sync risks

- Forgetting CWD = blog-site → reads the portfolio's `.design-sync/` (stale).
- If AuthorCard reverts to `.js`, the build fails on JSX parsing — keep `.jsx`.
- The `@docusaurus/Link` stub is a fixed prop list; extend if Link usage grows.
- custom.css carries Docusaurus global selectors (navbar/footer/.markdown) that
  ship in styles.css — inert in non-Docusaurus designs, but present.
