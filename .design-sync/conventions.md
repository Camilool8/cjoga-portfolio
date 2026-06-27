## How to build with this design system

This is the component set behind **cjoga.cloud**, a single-page personal
portfolio. The components are **full-page sections and page furniture**, not
atomic primitives — there is no generic Button/Input/Card here. Compose a page
by stacking sections; style your own layout glue with the tokens below.

### Components

- **Sections** (each renders a complete, full-width band of the page; no props):
  `Hero`, `About`, `Experience`, `Certifications`, `Projects`, `Contact`,
  `Footer`, `HandbookCallout`.
- **Fixed page furniture** (each positions itself relative to the viewport — use
  at most one of each per page): `NavigationBar` (top bar), `PrintButton`
  (bottom-right "Download CV" pill), `ScrollProgress` (top-edge progress bar),
  `SideElements` (left/right social rails, xl+ only), `BackgroundAnimation`
  (full-viewport particle canvas, sits behind content), `CursorGlow`
  (pointer-following glow, desktop).

### Required setup (without these, components render wrong)

1. **Dark theme is the default.** The page must supply the dark background —
   set `background: var(--bg-void); color: var(--text-primary)` on the page root.
   Add `data-theme="light"` on a wrapping element to flip to the light palette
   (every token re-maps).
2. **i18n is required.** Every section pulls its copy from `react-i18next`;
   without an i18n provider preloaded with locale resources, text renders as raw
   keys. The bundle exports **`PreviewProvider`** — a reference wrapper that
   supplies an English-preloaded i18n instance plus a router. Wrap your page in
   it (or your own equivalent): `<PreviewProvider><Hero/>…</PreviewProvider>`.
   A few components also expect a React Router context.
3. **Account for the fixed nav.** `NavigationBar` is `position: fixed`; sections
   already include their own vertical padding, so they stack directly.

### Styling idiom — Tailwind utilities + CSS custom-property tokens

Style your own layout with these tokens (defined in `styles.css`, which imports
`_ds_bundle.css` — read it for the full set):

| Group | Tokens |
|---|---|
| Background | `--bg-void` (page), `--bg-primary`, `--bg-surface`, `--bg-elevated`, `--bg-glass` |
| Accent | `--accent` (#64ffda), `--accent-secondary` (#38bdf8), `--accent-dim`, `--accent-glow`, `--accent-warm` |
| Text | `--text-primary`, `--text-secondary`, `--text-tertiary` |
| Border | `--border-subtle`, `--border-medium`, `--border-active` |
| Gradient | `--gradient-accent`, `--gradient-hero` |
| Font | `--font-display` (Syne · headings), `--font-body` (Outfit · copy), `--font-mono` (JetBrains Mono · chrome/eyebrows) |

For your own section-style blocks, the design system ships these classes:
`.section-inner` (max-width centered container), `.section-label` (mono eyebrow),
`.section-heading` (display heading). Per-component usage is in each
`<Name>.prompt.md`.

### Idiomatic example

```jsx
import { PreviewProvider, NavigationBar, Hero, About, Footer } from "<pkg>";

export default function Page() {
  return (
    <PreviewProvider>
      <div style={{ background: "var(--bg-void)", color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>
        <NavigationBar />
        <Hero />
        <About />
        <Footer />
      </div>
    </PreviewProvider>
  );
}
```
