# WS-F — Certifications split & i18n (2026-07-04)

Workstream F of the audit-remediation wave. Splits the 1609-line
`src/components/Certifications.jsx` monolith, de-slops the tiles, and
i18n's the hardcoded English (AUDIT-2026-07-04 §1 Med, §2 Med/Low,
§4 Info).

## Target layout

```
src/components/certifications/
├── certData.js              # CERT_GROUPS + CERT_COUNT (written FIRST — Hero imports it)
├── index.jsx                # section component, CertRow, CountUp, grid, progress
└── liveTiles/
    ├── LiveTileFrame.jsx    # off-screen unmount wrapper (audit-praised, kept verbatim)
    ├── AWSRegionsLive.jsx
    ├── TerraformGraphLive.jsx
    ├── DynatraceWaveformLive.jsx
    ├── AwardSparkleLive.jsx
    ├── RedHatRadarLive.jsx
    ├── GitLabPipelineLive.jsx
    └── KubestronautRingLive.jsx
```

`src/components/Certifications.jsx` is deleted. `src/App.jsx` is
repointed to `./components/certifications` by another workstream — not
touched here.

## certData.js contract (consumed by Hero mid-wave)

- `export const CERT_GROUPS = [...]` — the old `certGroups`, each group
  gaining a stable `groupId`: `kubestronaut`, `aws`, `terraform`,
  `dynatrace`, `partner`, `redhat`, `gitlab` (matched by old tagline
  order). Hardcoded English `tagline` strings and the English
  `progress.label` are **removed from data** — the component translates
  by `groupId`.
- `export const CERT_COUNT = CERT_GROUPS.flatMap(g => g.certs).length`
  — 11, earned only; `inProgressCerts` (CKAD) stays excluded per the
  earned-count semantics in CLAUDE.md/memory.

## Behavior changes (everything else is preserved verbatim)

1. **De-slop (§1 Med):** drop the red/amber/green traffic-light dots
   from the fake terminal chrome in the Terraform and Red Hat tiles
   (keep the `$ terraform plan` / `systemctl list-units` CLI content);
   replace the gradient/striped Kubestronaut progress bar with plain
   text `1 / 5 · 1 in progress` carrying `role="progressbar"` +
   `aria-valuenow/min/max`; remove the `section-label` eyebrow
   (eyebrows only on Experience/Contact per the identity rule).
2. **i18n (§2 Med):** taglines via
   `t("certifications.groups.<groupId>.tagline")`; per-group count line
   via `t("certifications.countLabel", { count })` +
   `t("certifications.countInProgress", { count })`; Kubestronaut
   progress label via
   `t("certifications.groups.kubestronaut.progressLabel")`. Locale keys
   land via another workstream this wave; every call carries i18next
   `defaultValue` fallbacks matching the current English so nothing
   renders as a raw key. The `x / y` progress numbers stay
   locale-neutral (no new non-contract keys).
3. **External links (§4 Info):** Credly links keep
   `target="_blank" rel="noopener noreferrer"` and gain a
   `<span className="sr-only">(opens in new tab)</span>`; the external
   link glyph becomes `aria-hidden`. The sr-only text goes through
   `t("certifications.opensInNewTab", "(opens in new tab)")` so the
   locale wave can translate it; the fallback keeps it safe either way.

Implementation notes (i18next 23):
- Per-group count line uses plural default values in options:
  `t("certifications.countLabel", { count, defaultValue_one:
  "{{count}} certification", defaultValue_other:
  "{{count}} certifications" })` — reproduces the old
  "1 certification" / "4 certifications" strings when keys are absent.
- `countInProgress` default: `"{{count}} in progress"`.
- `progressLabel` default: `"Kubestronaut path"` (the old
  `progress.label` data string, now removed from `certData.js`).
4. **LazyMotion compat:** every `motion.x` becomes `m.x`
   (`import { m } from "framer-motion"`) — the app root gains
   `<LazyMotion strict>` in another workstream. Hooks
   (`useInView`, `useReducedMotion`, `useMotionValue`, …) are
   unaffected by strict mode.

## Verification

- `npx eslint src/components/certifications/ --ext js,jsx` clean
- `ls src/components/Certifications.jsx` → gone
- `grep -rn "motion\." src/components/certifications/` → empty
- "On the road to Kubestronaut" appears only as a `defaultValue`
  fallback in `index.jsx`, never in `certData.js`
- `CERT_COUNT` export present in `certData.js` (grep)
