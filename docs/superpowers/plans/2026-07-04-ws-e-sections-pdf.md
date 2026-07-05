# WS-E — Portfolio sections & PDF CV (audit remediation, 2026-07-04)

Workstream E of the audit-remediation wave. Scope: `About.jsx`,
`Experience.jsx`, `Projects.jsx`, `Contact.jsx`, `HandbookCallout.jsx`,
`Footer.jsx`, `SectionDivider.jsx`, `SideElements.jsx`, `PrintButton.jsx`,
`ProfessionalPDFCV.jsx`, plus new files under `src/assets/fonts/`.

## Audit findings addressed

- §1 High — mono-uppercase eyebrow + pulse dot on every section is
  templated rhythm. Keep the eyebrow on ≤2 sections.
- §2 Med — `Projects.jsx:160` cards are dead ends despite matching
  handbook case studies existing.
- §2 Low — CV fonts fetched from cdnjs at click time; `alert()` error
  path. CDN hiccup = failed CV in front of a recruiter.
- §4 Low — `HandbookCallout.jsx` has two sibling `<h2>`s in one section.
- Cross-cutting (WS-B dependency) — app shell wraps everything in
  `<LazyMotion features={domAnimation} strict>`; `motion.x` throws under
  strict, so every owned file converts to `m.x`.

## Tasks

### 1. Eyebrow subtraction
Remove `<span className="section-label">` from `About.jsx`,
`Projects.jsx`, `HandbookCallout.jsx`. Eyebrow survives only in
`Experience.jsx` and `Contact.jsx`. No wrappers become empty (each
wrapper also holds the `<h2>`), so only the span goes.

### 2. Project cards → case-study links
Each card in `Projects.jsx` becomes `m.a` with `href`, `target="_blank"`,
`rel="noopener noreferrer"` (cross-site). Mapping (from
`blog-site/docs/engineering/**` slugs, matched by content):

| key | project | case study |
|---|---|---|
| `cicd` | EKS Platform Migration | `https://blog.cjoga.cloud/engineering/work/arctiq` |
| `iac` | Multi-Cloud IaC (Terraform + Bicep) | `https://blog.cjoga.cloud/engineering/work/inspyr-global-solutions` |
| `monitoring` | Observability from Zero (OTel/Grafana/Loki) | `https://blog.cjoga.cloud/engineering/work/arctiq` |
| `infrastructure` | Alerts-as-Code Pipeline | `https://blog.cjoga.cloud/engineering/work/inspyr-global-solutions` |
| `portal` | Self-Service Infrastructure Portal | `https://blog.cjoga.cloud/engineering/work/inspyr-global-solutions` |
| `containerization` | Distributed Kubernetes Homelab | `https://blog.cjoga.cloud/engineering/lab/overview` |

Drop `cursor-default`, add `no-underline`, and add a subtle mono
"read the case study →" affordance at the card foot
(`t("projects.readCaseStudy", "Read the case study")` — key can be
translated later without touching the component). Card styling kept.

### 3. HandbookCallout inner heading
`<h2 className="handbook-title">` (the mirrored Docusaurus title inside
the browser window) → `<p className="handbook-title">`. Styling is
class-based so nothing visual changes; a `<p>` is honest — it's a
preview of another page's title, not a heading of this document.

### 4. PDF CV font hardening
- Download the three exact cdnjs Roboto TTFs referenced in
  `ProfessionalPDFCV.jsx` into `src/assets/fonts/`
  (roboto-regular / roboto-bold / roboto-italic webfont TTFs).
- Import them in `ProfessionalPDFCV.jsx` (Vite emits hashed asset URLs;
  `@react-pdf/renderer` accepts a URL string) and `Font.register` from
  the imports. `grep cdnjs` → empty.
- `cvMetadata.name` comes from `src/data.js` (not writable here);
  override at render: `"José Camilo Joga Guerrero"` (accented,
  site-wide unification).
- `PrintButton.jsx`: replace `alert()` with a component-local toast —
  token-styled, `role="status"`, auto-dismiss after 5 s, cleared on
  retry/unmount.

### 5. LazyMotion compat
`import { m } from "framer-motion"` and `motion.x` → `m.x` in
`About`, `Experience`, `Projects`, `Contact`, `HandbookCallout`,
`SectionDivider`. (`Footer`, `SideElements`, `PrintButton`,
`ProfessionalPDFCV` don't use framer-motion.)

### 6. Footer name
`Footer.jsx` renders only i18n strings (`footer.text1/2/copyright`) —
no hardcoded name; leave as is. The accented name fix lands in the PDF
(task 4) since `data.js` is out of scope.

## Verification

- `npx eslint` on all ten owned files → clean
- `grep -n "section-label" About/Projects/HandbookCallout` → empty
- `grep -n "motion\." <owned files>` → empty
- `grep -n "cdnjs" ProfessionalPDFCV.jsx` → empty
- `ls -la src/assets/fonts/` → three TTFs, non-trivial sizes
