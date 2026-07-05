# Audit remediation — local review guide

Branch: **`feat/audit-remediation`** (13 workstream commits on top of `main`). Everything from `AUDIT-2026-07-04.md` (kept local/gitignored) was implemented: full phosphor-green rebrand, ES routes, prerendering, Mermaid SSR, terminal a11y, server/Docker hardening, prose edits, SEO plumbing.

## See all changes

```bash
git checkout feat/audit-remediation
git log --oneline main..HEAD              # one commit per workstream
git diff main...HEAD --stat               # full surface
git diff main...HEAD -- src/styles/ blog-site/src/css/   # e.g. just the rebrand
```

Per-workstream plan docs (what/why per stream): `docs/superpowers/plans/2026-07-04-ws-*.md`.

## Run it

```bash
# Portfolio (two terminals)
npm run server:dev            # Express :3001
npm run dev                   # Vite :3000 → open http://localhost:3000

# Portfolio, production-like (prerendered)
npm run build && npm run prerender && PORT=3999 npm start   # :3999

# Handbook
cd blog-site && npm run dev   # :3000
cd blog-site && npm run build && npm run serve

# Docker (what actually ships — both listen on 8080 now)
docker build --platform linux/amd64 -t cjoga/portfolio:local .
docker build --platform linux/amd64 -t cjoga/blog:local blog-site
docker run --rm -p 8080:8080 cjoga/portfolio:local
docker run --rm -p 8081:8080 cjoga/blog:local
```

## Gates (all green at handoff)

```bash
npm run lint && npm test          # eslint + 29 vitest (terminal allowlist, routes, hardening)
npm run i18n:check                # EN/ES key parity (245 keys)
npm run tokens:check              # global.css/custom.css in sync with scripts/brand/tokens.css
npm run contrast:check            # all 15 WCAG pairs from tokens.css
```

## What to look at, commit by commit

| Commit | Try this |
|---|---|
| `feat(design)` tokens | Toggle dark/light on both sites: phosphor-green accent, one slate gray family in light mode, no pulsing dots/▹ bullets, code blocks match across sites. |
| `fix(app)` shell/routes | Toggle theme **on `/terminal`** — session history must survive. Visit `/es` — Spanish with `<html lang="es">`. Click "About" from `/terminal` — it scrolls. Mobile menu: Escape closes, Tab can't reach it when closed. Tab from the page top — a "Skip to content" link appears. |
| `feat(hero)` | Roles crossfade (static under OS reduced-motion). Stop the Express server and reload — status dot goes amber "systems unreachable". "try the live terminal →" navigates. |
| `feat(sections)` | Eyebrow labels only on Experience + Contact. Every project card links to a handbook case study. Download the CV offline-from-CDN (fonts are bundled now). |
| `refactor(certifications)` | Tiles in Spanish (`/es`): no English strings. No traffic-light dots; Kubestronaut shows "1 / 5 · 1 in progress" as text. |
| `fix(terminal)` | Keyboard only: Tab into the input, **Shift+Tab out** (was a hard trap). Run `kubectl get pods` — input keeps focus, "querying cluster…" shows. Try `kubectl get pods -n kube-system` — denied (namespace allowlist). Scroll past the promo mid-animation, scroll back — it restarts. |
| `feat(security)` | `curl -I localhost:8081/` — CSP/HSTS headers. `curl localhost:8080/bogus` → 404. `docker exec <ctr> id -u` ≠ 0. Tests: `npx vitest run tests/server`. |
| `feat(blog-seo)` | `curl localhost:8081/robots.txt`, `/sitemap.xml` (has `<lastmod>`). View-source a doc page: TechArticle JSON-LD + `og:type article`. |
| `docs(handbook)` | Read two opinion essays end to end — different closers. `grep -ri deloitte blog-site/docs/` → nothing. |
| `fix(i18n)` | ES hero says "sistemas en línea". Contact section reads in your voice, both languages. ES nav says "Handbook (EN)". |
| `feat(seo)` prerender | `curl -s localhost:3999/ | grep '<h1'` — real content pre-JS. `/es/` serves Spanish HTML with hreflang pair. `/sitemap.xml` is XML. |
| `perf(blog)` mermaid | Disable JS in devtools → `/engineering/lab/overview` diagrams still render (static SVG, phosphor-themed). Click a diagram → lightbox; Tab+Enter also opens it. `ls blog-site/build/assets/js` — no mermaid mega-chunks (4.0 MB → 1.1 MB). |

## Deploy coordination — read before merging

1. **Ship together**: the images now listen on **8080** and run non-root. Proposed manifests are staged in **`deploy/kp-k8s-dev/`** (your kp-k8s-dev checkout had uncommitted WIP, so nothing was touched there). Copy them across, review, and apply in the same rollout as the new images. The README there explains each change.
2. Your TCP-liveness-probe WIP in kp-k8s-dev is **no longer needed** — `/api/health` is now exempt from rate limiting, and the staged manifest reverts to the httpGet probe.
3. New RBAC: `deploy/kp-k8s-dev/portfolio-rbac.yaml` adds a dedicated read-only ServiceAccount scoped to the terminal's namespace allowlist (`TERMINAL_NAMESPACE_ALLOWLIST`, default `web-development,monitoring`).
4. After deploy, re-run Lighthouse against the live URLs and validate `robots.txt`/`sitemap.xml` on both domains in Search Console.
5. `AUDIT-2026-07-04.md` is gitignored on purpose — it names end clients and security internals. Keep it local.
