# WS-A — Design tokens & brand CSS (2026-07-04)

Workstream A of the audit-remediation wave. Owns the brand token layer and
brand CSS on both sites. Per AUDIT-2026-07-04.md §1 (identity inherited from
the Brittany Chiang template lineage; token drift between sites) and §4
(tertiary/light-theme contrast failures).

## Files owned

- `scripts/brand/tokens.css` (NEW) — canonical token source, parsed by
  `scripts/brand/check-contrast.mjs` (`:root` = dark, `[data-theme="light"]` = light)
- `scripts/brand/sync-tokens.mjs` (NEW) — copies tokens into both stylesheets
  between `/* @brand-tokens:start */` … `/* @brand-tokens:end */`; `--check` diffs
- `src/styles/global.css` — portfolio
- `src/styles/print.css` — portfolio print CV
- `blog-site/src/css/custom.css` — handbook
- `tailwind.config.js`

## Tasks

1. **Palette** — phosphor green `#3ee07f` dark / `#0d7038` light replaces
   `#64ffda` / `#0284c7`. Dark: secondary `#38bdf8`, warm `#f59e0b`,
   text `#e2e8f0 / #94a3b8 / #8794ab` (tertiary contrast fix). Light:
   secondary `#0369a1`, warm `#b45309`, text secondary `#475569`, tertiary
   `#64748b`; light bgs unified on slate `#ffffff / #f8fafc / #f1f5f9 / #e2e8f0`
   mapped void/primary/surface/elevated (void = page bg, lightest — required
   for the 4.5:1 tertiary-on-void gate). Derived alphas recomputed from
   rgb(62,224,127) / rgb(13,112,56); drift unified: `--accent-glow` 0.10,
   `--accent-dim` 0.12 (light 0.10), `--border-medium` 0.15 (dark), easing
   `cubic-bezier(0.16,1,0.3,1)` for both `--ease-out-expo` and blog `--ease-out`.
   Gradient `linear-gradient(135deg,#3ee07f,#38bdf8)` dark /
   `(135deg,#0d7038,#0369a1)` light. Infima primary shade ramps regenerated
   from the new accents.
2. **Shared token source** — `tokens.css` + marker-wrapped blocks in both
   stylesheets + `sync-tokens.mjs` (write / `--check`). Portfolio-only
   `--gradient-hero` stays outside the markers. Remove stale "kept verbatim"
   comment in custom.css. `--particle-color` deleted (BackgroundAnimation is
   being removed by another workstream).
3. **Identity subtraction** (global.css) — delete `▹` bullet pseudo-elements;
   delete `.section-label::before` pulse dot + `pulse-dot` keyframes (also in
   tailwind.config.js); delete dead `.dark .admin-*` block and unreferenced
   legacy `.prose` / `.section-title` / `.cta-button` / `.skills-list` /
   `.job-description` blocks (grep-verified unreferenced); merge duplicate
   `prefers-reduced-motion` blocks; exempt `#contact` from the blanket
   `min-height: 100vh` (70vh instead).
4. **Code blocks** — replace Dracula Prism theme (incl. the `.light pre`
   dark-background bug) with token-driven scheme: bg `--bg-surface`, keywords
   `--accent-secondary`, strings `--accent`, comments `--text-tertiary`,
   punctuation/plain `--text-primary`. Matching `.token` overrides (with
   `!important`, since prism-react-renderer inlines styles) in custom.css;
   `.theme-code-block` `#0a0e16` → `var(--bg-surface)`.
5. **Small items** — port handbook `*:focus-visible` outline into global.css;
   blog wordmark `"/blog"` → `"/handbook"`; delete Google Fonts `@import`
   (custom.css:9 — WS-I adds headTags); print.css checked for old hexes
   (none — pure black/white; only drop the stale `#background-animation`
   print selector). tailwind.config.js hardcoded hexes updated.

## Verification

- `node scripts/brand/sync-tokens.mjs --check` → exit 0
- `node scripts/brand/check-contrast.mjs` → all pairs ≥ 4.5:1
- `grep -rn 64ffda src/styles tailwind.config.js blog-site/src/css` → empty
- `grep -c admin- src/styles/global.css` → 0; no Google Fonts `@import` left
- Brace-balance node one-liner on both CSS files
