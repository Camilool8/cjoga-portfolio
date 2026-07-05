# WS-B: App shell, routing, ES URLs, nav (2026-07-04)

Workstream B of the audit-remediation wave. Fixes audit §2/§3/§4/§5 items
owned by the app shell.

## Files

- `src/App.jsx` — rewrite shell
- `src/main.jsx` — no functional change needed (kept as-is)
- `src/utils/i18n.js` — bundle EN, URL-language helpers
- `src/components/NavigationBar.jsx` — a11y/UX + language-aware routing
- `src/components/ScrollProgress.jsx` — `m.div`, drop contradictory ARIA
- NEW `src/hooks/useHashScroll.js`
- DELETE `src/components/BackgroundAnimation.jsx`, `src/components/CursorGlow.jsx`

## Changes

1. **Hoist `MainLayout` + `Home` to module scope** (audit §2 High: full-tree
   remount on theme/language change). Theme preference stays state in `App`,
   passed as props; language is no longer state at all — derived from the URL.
2. **Ambient subtraction**: delete `BackgroundAnimation` + `CursorGlow` and
   their renders/imports. `ScrollProgress` keeps only `aria-hidden="true"`
   (audit §4 Low: progressbar role + aria-hidden contradiction).
3. **Motion**: wrap app in `<LazyMotion features={domAnimation} strict>` +
   `<MotionConfig reducedMotion="user">` (audit §3 Med, §4 Med). Convert
   `motion.div` → `m.div` in `ScrollProgress` (only owned file using it).
4. **ES routes**: `/es` and `/es/terminal` alongside `/` and `/terminal`.
   `LanguageSync` component derives lang from path prefix, calls
   `i18n.changeLanguage` and sets `document.documentElement.lang`
   (audit §4 High 3.1.1, §5 High). Helpers (`getLangFromPath`,
   `stripLangPrefix`, `localizePath`) exported from `src/utils/i18n.js`.
   Language toggle navigates to the equivalent localized path preserving
   the hash. `localStorage.language` written only on explicit toggle as a
   first-visit hint — never used to redirect (crawler-safe).
5. **i18n loading**: bundle `en` statically via `resources` +
   `partialBundledLanguages: true`; keep `i18next-http-backend` for `es`
   (audit §3 High: render-blocking translation fetch). Drop the
   browser-language detector — URL wins. Initial `lng` read synchronously
   from `window.location.pathname`.
6. **Prerender flag**: after i18next `initialized` + double rAF, set
   `document.documentElement.dataset.prerenderReady = "true"` (wave-2
   prerender script waits on this).
7. **NavigationBar a11y/UX** (audit §2/§4):
   - Mobile panel: `el.inert = !menuOpen` via ref/effect (React 18),
     `visibility: hidden` after the close transition, Escape closes and
     returns focus to the hamburger, focus moves to first link on open.
   - Language dropdown: `aria-expanded`, `aria-haspopup="listbox"`,
     listbox/option roles, `aria-current` + `aria-selected` on the active
     option, Escape-to-close with focus return,
     `t("nav.languageSelector")` label (contract key, defaultValue kept).
   - Remove "01. 02." numbering from mobile items.
   - `.nav-control-btn` 36 → 44px (touch target; rule lives in this file).
   - Condensed nav pills from `md` (768px) instead of hiding below `lg`;
     hamburger/panel now mobile-only below 768px.
   - Section links are always `<Link to="/#about">` / `/es/#about` —
     `useHashScroll` handles the scroll on both same-page and cross-page.
8. **`useHashScroll`**: on location change with a hash, `scrollIntoView`
   after a rAF, retrying every 50 ms (≤20 tries) for lazy content;
   respects `prefers-reduced-motion`. Called in `MainLayout` so it covers
   all routes (audit §2 High: 5 dead nav items from `/terminal`).
9. **Skip link + landmark**: sr-only-until-focused skip link before the
   nav (`t("nav.skipToContent", "Skip to content")`), content wrapper
   becomes `<main id="main" tabIndex={-1}>` (audit §4 Med 2.4.1).
10. **Certifications import** → `./components/certifications` (workstream
    contract: directory replaces the monolith at wave gate; resolves
    case-insensitively to the current file meanwhile).

## Contracts consumed

- `t("nav.languageSelector")` (defaultValue "Language selector")
- `src/components/certifications/index.jsx` (another workstream; resolves
  case-insensitively to `Certifications.jsx` until the wave gate)

Handbook/terminal nav labels stay on the existing `header.*` keys.
New keys consumed with defaultValue fallbacks: `nav.skipToContent`,
`nav.openMenu`, `nav.closeMenu`.

## Verify (done 2026-07-04)

- `npx eslint` on the six owned files → clean
- `grep -rn "BackgroundAnimation\|CursorGlow" src/` → empty
- `src/main.jsx` untouched (no functional change needed)
