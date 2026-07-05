# WS-H — Server hardening, Docker, CI, k8s manifests (2026-07-04)

Workstream H of the audit-remediation wave. Source: `AUDIT-2026-07-04.md` §7
(security), plus the §3 caching item (`immutable` on hashed assets) and the
§5 soft-404 items. The terminal parser is already allowlist-based and
injection-safe; this workstream closes the recon, root-container, CSP, and
rate-limit-keying gaps around it.

## Scope (write-only surface)

- `server/index.js`, `server/routes/terminal.js`, `server/services/k8sClient.js`
- `Dockerfile`, `blog-site/Dockerfile`, `blog-site/nginx.conf`
- `.github/workflows/build-images.yaml`
- NEW `tests/server/terminal.test.js`, `tests/server/routes.test.js`
- NEW `deploy/kp-k8s-dev/` (README + proposed manifests — the real
  `~/Kodepull/Repositories/kp-k8s-dev` checkout has uncommitted WIP and is
  read-only for this workstream)

## 1. Terminal namespace allowlist (TDD)

- Env `TERMINAL_NAMESPACE_ALLOWLIST`, comma-separated, default
  `web-development,monitoring`. Read per-request (testable, negligible cost).
- `-n <ns>` outside the allowlist → same friendly-error shape as other
  blocked input: `Error: namespace '<ns>' is not accessible from this
  terminal.` + the allowed list. No cluster info leaked.
- `kubectl get namespaces` output filtered to allowlisted namespaces.
- `kubectl get nodes` formatter drops the VERSION column; `k8sClient.getNodes`
  stops returning `version`/`os`/`arch` (kubelet version + OS image are
  CVE-targeting recon).
- Default namespace = first allowlist entry (falls back to `web-development`).

Tests (`tests/server/terminal.test.js`, k8sClient mocked with `vi.mock` so no
cluster/kubeconfig is touched):
allowed ns passes · disallowed ns rejected (friendly, no leak) · ns listing
filtered · nodes output has no VERSION/OS column · custom allowlist env
respected · blocked verbs still blocked · secrets still denied · 200-char cap ·
non-kubectl → command not found.

## 2. Route handling (supertest against exported app)

- Refactor `server/index.js` → `export default app`; `app.listen` only when
  the file is the entrypoint (`process.argv[1] === fileURLToPath(import.meta.url)`),
  so importing in tests doesn't bind a port.
- Catch-all becomes an allowlist: `/`, `/terminal`, `/es`, `/es/terminal`
  serve the SPA (prerendered `<route>/index.html` if it exists, else
  `dist/index.html`). Anything else that isn't a real static file → **404**
  (index.html body with 404 status, so humans still get the app shell and
  crawlers get the right code — audit §5 soft-404 fix).
- `express.static` unchanged: real files (`robots.txt`, hashed assets,
  `sitemap.xml` once another workstream adds it) still serve.

Tests (`tests/server/routes.test.js`): `/`→200 html · `/terminal`, `/es`,
`/es/terminal` → 200 · `/bogus`, `/wp-admin` → 404 · `/robots.txt` → 200 ·
`/api/health` → 200 JSON. Prod-mode suite (dynamic import with
`NODE_ENV=production`): CSP has no `unsafe-eval` (keeps `unsafe-inline`) ·
`/api/health` carries no RateLimit headers (exempt) · `/api/*` does ·
terminal limiter buckets keyed by `CF-Connecting-IP` (31st request from one
CF IP → 429; different CF IP → still 200).

## 3. HTTP hardening (`server/index.js`)

- CSP `script-src`: drop `'unsafe-eval'` (Vite prod build doesn't need it);
  keep `'unsafe-inline'` for the theme bootstrap.
- Static: `immutable: true` alongside the existing 1y max-age (§3 Low).
- Rate limiters: `keyGenerator` prefers `CF-Connecting-IP` (Cloudflare sets it
  authoritatively at the edge; `trust proxy` hop-count guessing through
  tunnel+Envoy is what made `req.ip` unreliable), fallback `req.ip`. Use
  express-rate-limit v7.5's `ipKeyGenerator` helper for IPv6 correctness.
- **Exempt `GET /api/health` from rate limiting** — k8s probes were burning
  the 100/15min budget; this is the root cause of the TCP-probe workaround in
  the kp-k8s-dev WIP. Health route is registered before the limiter mounts.
- `k8sClient.js`: wrap `loadFromCluster()` in try/catch so a prod-mode import
  outside a cluster degrades instead of crashing at module load (also makes
  prod-mode supertest possible).

## 4. Dockerfiles + nginx

Portfolio: `USER node`, `PORT=8080`, `EXPOSE 8080`, healthcheck :8080,
`COPY --chown=node:node` so /app is readable (no write needed — logger is
stdout-only).

Blog: base `nginxinc/nginx-unprivileged:1-alpine` (runs as uid 101, listens
8080). nginx.conf rewritten for unprivileged: `pid /tmp/nginx.pid` + temp
paths under /tmp (required for readOnlyRootFilesystem later), `listen 8080`,
`server_tokens off`, security headers (CSP for static Docusaurus: self +
inline + Google Fonts + data: images; HSTS 1y includeSubDomains; nosniff;
XFO DENY; Referrer-Policy strict-origin-when-cross-origin — repeated in
locations that set Cache-Control, since nginx `add_header` inheritance is
all-or-nothing per level). Soft-404 fix: `try_files $uri $uri/ $uri.html =404`
+ `error_page 404 /404.html`. Cache split (§3 Med): `/assets/` 1y immutable
(hashed); images `max-age=86400, stale-while-revalidate=604800` (OG cards /
logos are replaced in place); HTML no-cache. Keep gzip + `/healthz`.

## 5. CI

Pin every action to a full commit SHA (verified against the GitHub API
2026-07-04, both via the major tag and the specific release tag):

| Action | Version | SHA |
|---|---|---|
| actions/checkout | v4.3.1 | `34e114876b0b11c390a56381ad16ebd13914f8d5` |
| actions/setup-node | v4.4.0 | `49933ea5288caeca8642d1e84afbd3f7d6820020` |
| dorny/paths-filter | v3.0.3 | `d1c1ffe0248fe513906c8e24db8ea791d46f8590` |
| docker/setup-buildx-action | v3.12.0 | `8d2750c68a42422c14e847fe6c8ac0403b4cbd6f` |
| docker/login-action | v3.7.0 | `c94ce9fb468520275223c153574b00df6fe4bcc9` |
| docker/metadata-action | v5.10.0 | `c299e40c65443455700f0fdfc63efafe5b349051` |
| docker/build-push-action | v6.19.2 | `10e90e3645eae34f1e60eeb005ba3a3d33f178e8` |

Add a gate to the portfolio job before the image build: setup-node 24 +
`npm ci` + `npm test` + `npm run i18n:check`.

## 6. deploy/kp-k8s-dev/ (staged manifests)

Proposed copies of the web-development namespace manifests with:
- containerPort/probe ports/PORT env → 8080 (service `targetPort: http` is a
  named port, so services keep `port: 80` and follow automatically)
- pod+container securityContext: runAsNonRoot, allowPrivilegeEscalation
  false, drop ALL, readOnlyRootFilesystem + emptyDir /tmp, seccomp
  RuntimeDefault
- portfolio liveness probe **reverted to httpGet /api/health** (the in-app
  rate-limit exemption removes the reason for the TCP workaround)
- blog: `automountServiceAccountToken: false`
- NEW `portfolio-rbac.yaml`: dedicated `portfolio-terminal` SA; namespaced
  read-only Roles (pods/deployments/services get+list) in `web-development`
  and `monitoring` only; minimal ClusterRole for namespaces+nodes list — the
  in-code allowlist and the RBAC scope now say the same thing.
- README: per-change rationale + the ship-together constraint (8080 images
  and these manifests must deploy in the same window).

## 7. Verification

- `npx vitest run tests/server` all green
- `node --check` on the three server files
- `kubectl apply --dry-run=client -f deploy/kp-k8s-dev/` (fallback: YAML parse)
