# Writing & design tone

The rubric this site is written against. Applies to every page on
`cjoga.cloud` (the portfolio) and `blog.cjoga.cloud` (the handbook).
Pre-existing pages were audited against this before it was written
down — the rubric is the codification, not the invention.

---

## Voice

**Declarative. Active. Concrete.** State things; don't hedge them.
Name the tool, the file, the version. Choose nouns and verbs over
adjectives.

> _What broke_: the WiFi dropped, flannel fell over, pod-to-pod
> networking went down across the cluster.
>
> Not: _Sometimes the network would experience intermittent issues
> that could potentially affect cluster connectivity._

## Do

- Use the **Goal / Approach / Stack** pattern on plan-shaped sections
  (lab overview, work engagements, in-progress builds).
- Lead with the fact. Put the reason after.
- Cut anything the header already said.
- Prefer one sharp example over three mediocre ones.
- Memoir voice is fine on `/me/who-i-am` — narrative is the point
  there. Everywhere else, declarative.
- Opinion essays: first-person, sharper, hedges removed. The
  paragraph should be defendable in a code review.

## Don't

| Tic | Example | Fix |
|---|---|---|
| Filler intensifiers | "I _actually_ learned this work" | Cut "actually" |
| Hedge tails | "more often than I want to admit" | "the daily mode" |
| Throat-clearing | "The interesting part isn't X, it's Y" | Just say Y |
| Textbook scaffolding | `## Where to read more` over a one-line link | Inline the link |
| Cliché framing | "dive in", "explore", "discover" | A verb that means something |
| Cleft inversions | "What the courses are not is the only path" | "They are not the only path, though" |
| On-call clichés | "at 2 a.m.", "midnight", "3 a.m. page" as flavor | Concrete operational context, or delete |
| Hedge softeners mid-sentence | ",though this depends on the team, of course," | Delete |

## Special rules

### Publishing

- **Never name end clients in public content.** Employers are fine
  (Arctiq, INSPYR Global Solutions, FL Betances, KODEPULL). The
  actual clients those employers placed me with are not named on
  the site. Banking, retail, etc. — anonymized.

### Vendor tiles & visualizations

- Use the real product's logo, CLI output, or dashboard — not an
  abstract geometric metaphor. Icon source priority:
  `react-icons` → `simple-icons` CDN → `homarr-labs/dashboard-icons`
  → project repos.

### Red Hat training

- Never frame the official Red Hat prep courses as "not necessary"
  or "slides." They teach history, every command, and multiple
  approaches. The lab is an _alternative path_, not a replacement.
  Position them as complements.

### Diagrams

- Mermaid diagrams in MDX are auto-wrapped by the swizzled
  `@theme/Mermaid` to add a zoom lightbox (`yet-another-react-lightbox`).
  No per-page setup needed.

## On Docusaurus + custom components

Docusaurus's global `.markdown img` rule applies `margin-bottom:
var(--ifm-leading)` (≈1.5rem) to **every `<img>`** rendered inside
MDX content, including images inside custom React components. If
you need a flush image (e.g. card banner), override with
`margin: 0 !important` on the component's `<img>` rule.

The same caveat applies to inner `<section>` elements: the global
`section { @apply py-16 md:py-24 }` rule adds ~4-6rem of vertical
padding to every `<section>`. Use `<div>` for inner section
groupings unless you actually want that padding.

## On commits & contribution

- Commits are authored by the human driving the work (Camilo). No
  Co-Authored-By trailers attributing the work to an LLM or AI
  service. The tool is a tool; the contributor is the person.
- Commit subjects use Conventional Commits style:
  `feat(scope): ...`, `refactor(scope): ...`, `docs(scope): ...`,
  `ci: ...`, `fix(scope): ...`.
- Commit bodies explain the **why** for non-obvious changes. Don't
  re-narrate the diff.

## Source of truth

When this document and an actual rendered page disagree, the page
is the answer — this file describes how things are written, not
which specific pages exist. Audit pages against the rules above
when adding new content.
