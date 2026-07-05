# WS-D: Portfolio SEO & prerender (2026-07-04)

Workstream D of the audit-remediation wave (wave 2). Fixes audit §5 items
owned by the portfolio head, robots/sitemap, and the "0 words, 0 h1
pre-JS" client-render finding.

## Files

- NEW `scripts/prerender.mjs` — Playwright snapshot of `/` and `/es/`
- `index.html` — meta description trim, JSON-LD `inLanguage`
- NEW `public/sitemap.xml` — 3 URLs, hreflang alternates on the homes
- `public/robots.txt` — no change needed (Sitemap line becomes truthful)
- `server/index.js` — no change needed (wave-1 already serves prerendered
  `dist/<route>/index.html` when present, incl. `/es` and `/es/`)
- `Dockerfile` — builder stage gains chromium + prerender step
- DELETE `public/images/og-image-1.webp` — verified unreferenced
  (`src/data.js` uses `og-image.webp`; head uses `og-image.png`; the
  brand generator writes `og-image.{png,webp}`, never `-1`)

## Changes

1. **`scripts/prerender.mjs`** (audit §5 High: empty pre-JS body; §5 High:
   ES unreachable by crawlers — wave 1 added the `/es` routes, this makes
   them crawlable content):
   - Requires `dist/` to exist (fail fast with a build hint).
   - Reads the ORIGINAL built `dist/index.html` into memory FIRST, then
     starts a plain `node:http` static server on an ephemeral port
     (`listen(0)`) serving `dist/` with SPA fallback to that in-memory
     original — this is the idempotency guard: re-runs never navigate to
     an already-prerendered snapshot.
   - `/api/health` is mocked with `{"status":"ok"}` 200 so the hero status
     strip captures "systems online" (prod steady state) instead of
     "systems offline"; other `/api/*` return JSON 404.
   - Chromium via playwright; `executablePath` honors
     `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` (Docker builder sets it to the
     apk chromium).
   - Per route (`/` → `dist/index.html`, `/es/` → `dist/es/index.html`):
     `goto` (waitUntil `load`, 30 s) → `waitForSelector`
     `html[data-prerender-ready="true"]` (30 s, flag set by wave-1
     `App.jsx` after i18n + double rAF) → best-effort
     `waitForLoadState("networkidle")` (10 s, non-fatal — the ready flag
     is the authoritative gate; networkidle alone is fragile).
   - Capture `<!DOCTYPE html>` + `document.documentElement.outerHTML`,
     then head fixups before writing:
     - strip the transient `data-prerender-ready` attribute
     - force `<html lang="en">` / `lang="es"`
     - canonical → `https://cjoga.cloud/` / `https://cjoga.cloud/es/`
     - strip any hreflang alternates already in the captured head (a
       second script invocation snapshots pages that already carry run-1's
       alternates), then insert hreflang alternates (en, es, x-default →
       EN home) in BOTH — two idempotency guards: the in-memory original
       shell within a run, the strip-before-insert across runs
     - `/es/` only: localized `<title>`, `<meta name="description">`,
       `og:title`, `og:description`, `twitter:title`,
       `twitter:description` (≤160 chars, derived from
       `public/locales/es/translation.json` `hero.description`), plus
       `og:url` → `/es/` and `og:locale` ↔ `og:locale:alternate` swap
       (es_DO primary) so the OG block is self-consistent.
   - All `<script>` tags kept: `createRoot` re-render over the
     prerendered DOM is the accepted behavior (NOT switching to
     `hydrateRoot`).

2. **`index.html`** (audit §5 Low + hygiene):
   - Meta description trimmed to ≤160 chars, AWS/Azure/Kubernetes/
     Terraform early, hardcoded cert count dropped.
   - JSON-LD WebSite `inLanguage` → `["en","es"]`.
   - OG/Twitter/JSON-LD otherwise untouched; `og:image` verified to
     point at existing `public/images/og-image.png`.
   - No hreflang links in the source file — the prerenderer owns them
     per-route (avoids duplicates on insert).

3. **`public/sitemap.xml`** (audit §5 Critical: robots.txt declares a
   sitemap that soft-200s): `https://cjoga.cloud/`,
   `https://cjoga.cloud/es/`, `https://cjoga.cloud/terminal`, lastmod
   2026-07-04, `xhtml:link` hreflang alternates on the two home URLs.
   Vite copies `public/` → `dist/`, express.static serves it with a real
   content type before the SPA handler.

4. **`Dockerfile` builder stage only**:
   - `apk add --no-cache chromium nss freetype harfbuzz ca-certificates
     ttf-freefont`
   - `ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` BEFORE `npm ci`
     (playwright's postinstall would otherwise download browsers into the
     image) + `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser`
   - `node scripts/prerender.mjs` after `npm run build`
   - Runtime stage untouched: copies `dist/` (now containing the
     snapshots) as before; no chromium in runtime; USER/PORT/healthcheck
     are wave-1's.

## Contracts consumed (wave 1)

- `document.documentElement.dataset.prerenderReady = "true"`
  (`src/App.jsx:208`)
- Routes `/`, `/es`, `/terminal`, `/es/terminal`; EN bundled, ES fetched
  from `/locales/es/translation.json`
- `server/index.js` `sendSpa` prefers `dist/<route>/index.html`

## Verify

- `npm run build && node scripts/prerender.mjs` → `dist/index.html` has
  `<h1`, `dist/es/index.html` has `lang="es"`, hreflang en/es/x-default
  in both; second run produces the same output (idempotent).
- `PORT=3999 node server/index.js`: `/sitemap.xml` is XML, `/es/` serves
  the ES snapshot, `/nonexistent` → 404, `/api/health` → 200. Kill after.
- Meta description content ≤160 chars.
