## How to build with this design system

These are the custom presentational components behind **blog.cjoga.cloud** (the
handbook — a Docusaurus site). They're meant to be dropped into MDX docs to
present credentials, courses, diagrams, quotes, tech stacks, and timelines. They
are real, prop-driven components — compose them; don't restyle them.

### Components (compose containers with their items as children)

- `CertBadge` — one certification badge (the `issuer` string drives the vendor
  icon). `CertBadgeGrid` — wraps multiple `CertBadge` children in a responsive grid.
- `CourseCard` — a course tile (links out when `link` is set). `CourseCardGrid`
  — wraps multiple `CourseCard` children.
- `SectionCard` — an index card (icon/monogram + title + description, links via
  `href`). `SectionCardGrid` — wraps multiple `SectionCard` children.
- `Timeline` — a vertical timeline; put `TimelineEntry` children inside
  (`year`, `title`, optional `emphasis`, optional body).
- `TechStackGrid` — pass `items` as an array of tech names (strings); each name
  resolves to a brand icon internally. `compact` for a denser row.
- `PullQuote` — a hairline-ruled quote (`eyebrow`, `attribution`, children).
- `DiagramZoom` — wraps any diagram/SVG/image (as children) with click-to-zoom.
- `AuthorCard` — the fixed author sign-off (no props).

### Setup

1. **Dark theme is the default.** Tokens live on `:root` (dark palette). Render
   on the dark surface: `background: var(--bg-void); color: var(--text-primary)`.
   The blog also defines a light palette under `[data-theme="light"]`.
2. **No provider needed.** These components don't read app context. (In the real
   Docusaurus app `SectionCard`/`AuthorCard` use the router `Link`; in this bundle
   that's a plain anchor, so `href`/`to` just navigate normally.)
3. **Containers need their items as children** — a bare `CertBadgeGrid` /
   `CourseCardGrid` / `SectionCardGrid` / `Timeline` renders empty. Always nest
   the matching item component(s) inside.

### Styling idiom — props + CSS-module components

Components are **CSS-module based**: you style them through their **props**, not
by passing class names (the internal classes are scoped/hashed). Your own layout
glue uses the shared brand tokens (defined in `styles.css` → `_ds_bundle.css`):

| Group | Tokens |
|---|---|
| Background | `--bg-void` (page), `--bg-primary`, `--bg-surface`, `--bg-elevated`, `--bg-glass` |
| Accent | `--accent` (#64ffda), `--accent-secondary`, `--accent-dim`, `--accent-glow`, `--accent-warm` |
| Text | `--text-primary`, `--text-secondary`, `--text-tertiary` |
| Border | `--border-subtle`, `--border-medium` |
| Font | `--font-display` (Syne), `--font-body` (Outfit), `--font-mono` (JetBrains Mono) |

Per-component props and examples are in each `<Name>.prompt.md`.

### Idiomatic example

```jsx
import { CertBadgeGrid, CertBadge, TechStackGrid } from "<pkg>";

export default function CredentialsSection() {
  return (
    <div style={{ background: "var(--bg-void)", color: "var(--text-primary)" }}>
      <CertBadgeGrid>
        <CertBadge name="Kubernetes & Cloud Native Associate" issuer="The Linux Foundation" year={2026} status="Active" />
        <CertBadge name="AWS Solutions Architect – Associate" issuer="Amazon Web Services" year={2025} />
      </CertBadgeGrid>
      <TechStackGrid caption="The stack" items={["Kubernetes", "Terraform", "ArgoCD", "Grafana"]} />
    </div>
  );
}
```
