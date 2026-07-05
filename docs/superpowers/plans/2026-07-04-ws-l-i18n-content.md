# WS-L — Portfolio i18n content (audit §6 fixes + new-key contract)

**Date:** 2026-07-04 · **Branch:** `feat/audit-remediation` · **Wave:** 10-agent parallel remediation

## Scope

Write-only surface: `public/locales/en/translation.json`, `public/locales/es/translation.json`, this plan doc. EN/ES key parity must stay perfect (`npm run i18n:check`).

## Part 1 — Fixes (AUDIT-2026-07-04.md §6)

1. **P0 mistranslation** — ES `hero.status.operational`: `"sistemas operativos"` ("operating systems") → `"sistemas en línea"`.
2. **`contact.text` rewrite (both)** — replace the borrowed template chirp with declarative site voice:
   - EN: `"My inbox is open. Questions about the work, the lab, or a role — email gets answered."`
   - ES (natural, no exclamations, not literal): `"Mi correo está abierto. Preguntas sobre el trabajo, el laboratorio o una vacante — todas reciben respuesta."`
3. **ES experience verb register** — all bullets first person. Present for ongoing-role duties, preterite for completed achievements. Facts and numbers untouched.
   - `inspyr`: `Operar` → `Opero`; `Mantener y extender` → `Mantengo y extiendo`; `Impulsar… y reemplazar` → `Impulso… y reemplazo`. (`Lideré`, `Habilité`, `Lideré` stay — completed actions.)
   - `kodepull`: `Liderar` → `Lidero`; `Incorporar` → `Incorporo`; `Colaborar` → `Colaboro`. (`Cofundé`, `Dirijo` stay.)
   - `flBetances` (past role, preterite): `"Integrado en el equipo…"` (participle) → `"Me integré al equipo…"`. Rest already preterite.
   - `arctiq`: already uniformly preterite — no register changes.
4. **ES arctiq anglicism** — `"en los entornos de lower y producción"` → `"en los entornos inferiores y de producción"`.
5. **ES `terminal.help.hire`** — `"Sabes que quieres"` → `"Sabes que quieres hacerlo"`.
6. **`hero.roles[2]`** — EN `"Automation Expert"` → `"Automation Engineer"`; ES `"Experto en Automatización"` → `"Ingeniero de Automatización"`.
7. **Diacritics** — `"Jose "` → `"José "` in both files: `about.paragraph1`, `footer.text1`, `footer.copyright` (hero already uses José).

## Part 2 — New keys (wave contract; added to BOTH files)

| Key | EN | ES |
|---|---|---|
| `hero.status.checking` | checking systems… | verificando sistemas… |
| `hero.status.unavailable` | systems unreachable | sistemas fuera de línea |
| `hero.terminalHint` | try the live terminal → | prueba la terminal en vivo → |
| `terminal.loading` | querying cluster… | consultando el clúster… |
| `terminal.inputLabel` | terminal command input | entrada de comandos de la terminal |
| `terminal.errors.timeout` | cluster did not respond — try again in a moment | el clúster no respondió — intenta de nuevo en un momento |
| `nav.languageSelector` | Language selector | Selector de idioma |
| `nav.skipToContent` | Skip to content | Saltar al contenido |
| `nav.handbook` | Handbook | Handbook (EN) |
| `certifications.groups.kubestronaut.tagline` | On the road to Kubestronaut | Camino a Kubestronaut |
| `certifications.groups.kubestronaut.progressLabel` | Kubestronaut path | Ruta Kubestronaut |
| `certifications.groups.aws.tagline` | Cloud architecture & operations | Arquitectura y operaciones en la nube |
| `certifications.groups.terraform.tagline` | Infrastructure as Code | Infraestructura como código |
| `certifications.groups.dynatrace.tagline` | Application observability | Observabilidad de aplicaciones |
| `certifications.groups.partner.tagline` | Accredited engineer | Ingeniero acreditado |
| `certifications.groups.redhat.tagline` | Linux & system administration | Linux y administración de sistemas |
| `certifications.groups.gitlab.tagline` | DevSecOps & CI/CD | DevSecOps y CI/CD |
| `certifications.countLabel_one` | {{count}} certification | {{count}} certificación |
| `certifications.countLabel_other` | {{count}} certifications | {{count}} certificaciones |
| `certifications.countInProgress` | · {{count}} in progress | · {{count}} en curso |

Notes:
- `nav.*` is a **new top-level object** — the current header keys live under `header.*`. The contract names `nav.handbook` with an ES-only value change ("Handbook (EN)"), so `nav.handbook` is created in both files (EN keeps "Handbook") for parity. `header.handbook` (ES "Manual") is left untouched — it belongs to whichever workstream migrates the Header component to `nav.*`.
- `terminal.errors` is a new nested object inside the existing `terminal` block.
- i18next v23 plurals: both `_one` and `_other` suffixed keys added to both files so the flat parity checker stays green.

## Verification

1. `node -e 'JSON.parse(...)'` on both files.
2. `npm run i18n:check` → parity OK, report key count.
3. `grep -c '"Jose ' both files` → 0; broader `grep 'Jose[^é]'` also clean.
