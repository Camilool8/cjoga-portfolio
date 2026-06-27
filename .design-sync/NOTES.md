# design-sync notes — cjoga-portfolio

This repo is **not a real component library**. It is the cjoga.cloud portfolio
(a private Vite app) force-synced as a makeshift design system at the user's
request. The "components" are the portfolio's page sections in `src/components/`.
Expect lower fidelity than a purpose-built DS, and read every bullet below before
re-syncing — most of the pipeline relies on non-default workarounds.

## How the build is wired (non-obvious)

- **Shape = package, synth from `src/`.** There is no library build — `npm run
  build` emits a website, not a component bundle.
- **Components are DEFAULT exports**, but the synth entry uses `export *` (skips
  defaults). So we DON'T use synth discovery. Instead `--entry` points at
  `.design-sync/barrel.jsx`, a hand-written barrel that re-exports each default
  as a NAMED export (and exports `PreviewProvider`). The barrel is also what sets
  `PKG_DIR` to the repo root (the build walks up from the entry to `package.json`;
  `node_modules/cjoga-portfolio` does not exist).
- Every component is pinned in `cfg.componentSrcMap`. **Adding a component =
  barrel line + `componentSrcMap` pin + author `previews/<Name>.tsx`.**
- **Excluded:** `ProfessionalPDFCV` (a `@react-pdf` PDF document, Node-only, not
  a DOM UI component), `App` (page root), `Terminal`/`TerminalPromo` (need the
  live backend API). They are not in the barrel/componentSrcMap.
- **`@react-pdf/renderer` is stubbed** via `cfg.tsconfig` →
  `.design-sync/stubs/react-pdf.js`. It imports Node built-ins (fs/path/zlib/…)
  and cannot bundle for the browser. `PrintButton` dynamically `import()`s it;
  the stub lets the bundle build. If `PrintButton`/`ProfessionalPDFCV` start
  importing more `@react-pdf` symbols, extend the stub or the bundle breaks.

## CSS / fonts (build-derived — regenerate every re-sync)

- Components style themselves with **Tailwind utility classes**, which only exist
  in the **compiled** CSS. `cfg.cssEntry` = `.design-sync/styles-src.css`, which
  is `dist/assets/index-*.css` (from `npm run build`) with a Google Fonts
  `@import` prepended. **`styles-src.css` is gitignored and build-derived — it
  must be regenerated before each converter run** (see Re-sync procedure).
- Brand fonts (Syne / Outfit / JetBrains Mono) load **remotely** via that Google
  Fonts `@import` → validate reports `[FONT_REMOTE]` (informational, expected).
  If the font `<link>` in `index.html` changes, update the `@import` line.

## Provider & theme

- `cfg.provider.component = PreviewProvider` (in `.design-sync/preview-providers.jsx`,
  shipped via the barrel). It supplies an i18n instance preloaded with
  `public/locales/en/translation.json` (the app's i18n uses an HTTP backend that
  can't load in a static card → `t()` would render raw keys) plus a `MemoryRouter`.
- The preview scaffold hardcodes a **white** body background; `PreviewProvider`
  paints `var(--bg-void)` on a wrapper so sections render on the dark theme.

## Grading & known render warns

- **Grade from the validate full-card render, NOT the `?story=` capture sheets.**
  The sections use framer-motion `whileInView` / `useScrollReveal`; the isolated
  `?story=Default` capture does not trigger the reveal, so
  `_screenshots/review/*.png` show BLACK for those components. The shipped
  `<Name>.html` cards (what validate, `.review.html`, and the product render) show
  the content correctly — confirmed via the validate contact sheet. This will
  recur on every re-sync; trust validate.
- **`SideElements`** is best-effort: the social rails are `xl:`-only and fade in
  2s after load, so a static screenshot never captures them. The card shows a
  context stand-in label; the rails render live on a desktop-width viewport.
- `CursorGlow`/`ScrollProgress` are pointer-/scroll-driven; cards show a context
  label plus the at-rest state.

## Re-sync procedure (one block)

```sh
# 1. rebuild the site for compiled CSS
npm run build
# 2. regenerate the build-derived stylesheet (font @import + compiled CSS)
{ echo "@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');"; cat dist/assets/index-*.css; } > .design-sync/styles-src.css
# 3. re-copy staged scripts (instant) + run the driver
cp -r "<skill-base>"/{package-build,package-validate,package-capture,resync}.mjs "<skill-base>"/lib "<skill-base>"/storybook .ds-sync/
node .ds-sync/resync.mjs --config .design-sync/config.json --node-modules ./node_modules \
  --entry ./.design-sync/barrel.jsx --out ./ds-bundle --remote .design-sync/.cache/remote-sync.json
```
- playwright **1.60.0** pins chromium **1223**, which matches the cache at
  `~/Library/Caches/ms-playwright` (macOS path, not `~/.cache`). A different
  cached build → install the matching playwright version.

## Re-sync risks (what can silently go stale)

- `styles-src.css` not regenerated → stale tokens/utilities or a missing
  `cssEntry`. Always run steps 1–2 above.
- The Google Fonts `@import` is hand-maintained in step 2 — drifts if the site's
  font set changes.
- The `@react-pdf` stub is a fixed symbol list — extend it if those components
  import more from `@react-pdf/renderer`.
- Grades are carried forward by source hash; the `?story=` capture will keep
  showing black for the scroll-reveal sections — do NOT re-grade them down from
  the capture sheets.
- The IntersectionObserver-patch idea was rejected: it's a module-level side
  effect in the bundle that would globally break scroll behavior in every design
  the agent builds. Do not reintroduce it.
