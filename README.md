# cjoga.cloud

The portfolio and the handbook, in one repo. Two sites, two images,
one source of truth.

| Site | Tech | Domain |
|---|---|---|
| **Portfolio** | React + Vite + Express | [cjoga.cloud](https://cjoga.cloud) |
| **Handbook** | Docusaurus (static) | [blog.cjoga.cloud](https://blog.cjoga.cloud) |

Both run on a self-hosted K3s cluster behind Envoy Gateway and a
Cloudflare Tunnel. See the lab overview at
[blog.cjoga.cloud/engineering/lab/overview](https://blog.cjoga.cloud/engineering/lab/overview).

---

## What's in the repo

```
.
├── src/                            # Portfolio React app (Vite)
├── server/                         # Portfolio Express server (terminal API)
├── public/locales/{en,es}/         # i18n for the portfolio
├── Dockerfile                      # cjoga/portfolio image
├── .github/workflows/
│   └── build-images.yaml           # CI builds both images on push to main
├── blog-site/                      # Docusaurus handbook
│   ├── docs/                       # MDX content (me/, engineering/, learn/)
│   ├── src/                        # Custom components (CertBadge, CourseCard, …)
│   ├── nginx.conf                  # Runtime nginx config
│   └── Dockerfile                  # cjoga/blog image
└── STYLE.md                        # Writing & design tone for the site
```

K8s manifests live in a separate repo and are not included here.

## Tech stack

**Portfolio**
- React 18 + Vite + Tailwind CSS + Framer Motion
- Express + Helmet + compression + rate limiting (`server/`)
- `@kubernetes/client-node` for the live terminal endpoint
- i18next (English / Spanish)
- `@react-pdf/renderer` for the print-CV
- Multi-stage Docker → `node:24-alpine` runtime

**Handbook**
- Docusaurus 3 + MDX + `@docusaurus/theme-mermaid`
- `yet-another-react-lightbox` for diagram zoom (auto-applied via theme swizzle)
- Built once, served by `nginx:alpine` — no server runtime
- Multi-stage Docker → `nginx:alpine` runtime

## Getting started

### Prerequisites

- Node 24+ (portfolio) / Node 25+ (handbook)
- npm
- Docker (optional, for image builds)

### Portfolio

```bash
npm install
npm run dev          # Vite on :3000, proxies /api → :3001
npm run server:dev   # Express on :3001 (separate terminal)
```

Production build:

```bash
npm run build        # → dist/
npm start            # serves dist/ + /api/* on port 80
```

Environment variables (optional, only the server-side ones are used):

```env
PORT=3001
NODE_ENV=development
```

### Handbook

```bash
cd blog-site
npm install
npm run dev          # Docusaurus on :3000
npm run build        # → build/ (static)
npm run serve        # serve the built output locally
```

## Build & deploy

### Docker (local)

```bash
# Portfolio
docker build --platform linux/amd64 -t cjoga/portfolio:latest . --push

# Handbook
docker build --platform linux/amd64 -t cjoga/blog:latest blog-site --push
```

### CI (GitHub Actions)

`.github/workflows/build-images.yaml` builds and pushes both images
to Docker Hub on every push to `main`, using path filters so a
doc-only commit doesn't rebuild the unaffected image. Tags applied:
`latest` (main only), `sha-<short>`, branch name.

Required secrets in repo settings:

| Secret | Value |
|---|---|
| `DOCKERHUB_USERNAME` | `cjoga` |
| `DOCKERHUB_TOKEN` | Docker Hub access token (Read & Write) |

Manual rebuild (e.g. base-image security refresh) is available via
the Actions UI as `workflow_dispatch`.

## Routes

### Portfolio (`cjoga.cloud`)

| Path | Description |
|---|---|
| `/` | One-page portfolio — Hero, About, Experience, Projects, Certifications, Handbook callout, Terminal promo, Contact |
| `/terminal` | Live read-only terminal connected to the K3s cluster |

### Handbook (`blog.cjoga.cloud`)

| Path | Description |
|---|---|
| `/` | Audience-paths landing |
| `/me/*` | Personal — who I am, opinions, learning + tools, credentials |
| `/engineering/lab/*` | The K3s lab — overview + tips and gotchas |
| `/engineering/work/*` | Work engagements |
| `/learn/*` | Cert guides |

## Writing tone

Site content is written against the rubric in [`STYLE.md`](./STYLE.md):
declarative, active, concrete. No filler, no client names, no
on-call clichés. Memoir voice is reserved for `/me/who-i-am`.

## Author

**Jose Camilo Joga Guerrero** — DevOps & Cloud Engineer

- [LinkedIn](https://www.linkedin.com/in/cjoga)
- [GitHub](https://github.com/Camilool8)
- [josejoga.opx@gmail.com](mailto:josejoga.opx@gmail.com)
