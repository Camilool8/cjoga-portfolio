# cjoga.cloud — Portfolio & Blog

A full-stack portfolio and blog platform built with React, Express, and Supabase. Deployed on a self-hosted K3s cluster with Traefik ingress.

**Live site**: [cjoga.cloud](https://cjoga.cloud)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend | Express.js, Helmet, rate limiting, compression |
| Database | Supabase (PostgreSQL) |
| Internationalization | i18next (English / Spanish) |
| PDF Generation | @react-pdf/renderer |
| Blog Rendering | marked + DOMPurify + Prism syntax highlighting |
| Infrastructure | Docker (multi-stage), Kubernetes (K3s), Traefik |

## Features

- **Dark / Light theme** with system preference detection
- **Bilingual** — full English and Spanish support via i18next
- **Integrated blog** — Markdown-based posts with search, pagination, table of contents, tags, and related posts
- **Admin panel** — Authenticated CRUD for blog management (Supabase Auth + JWT)
- **Print-ready CV** — PDF generation from portfolio data
- **Responsive** — Mobile-first design across all viewports
- **Animated UI** — Scroll progress, background animation, cursor glow, section transitions

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── Admin/              # Dashboard, PostEditor, LoginPage, ProtectedRoute
│   │   ├── Blog/               # BlogPage, BlogPost, BlogList, BlogSearch, TableOfContents
│   │   ├── Terminal/            # Interactive terminal component
│   │   ├── Utils/              # SimpleMarkdownRenderer
│   │   ├── Hero.jsx            # Landing section
│   │   ├── About.jsx           # Bio section
│   │   ├── Experience.jsx      # Work history
│   │   ├── Projects.jsx        # Project showcase
│   │   ├── Certifications.jsx  # Professional certifications
│   │   ├── Contact.jsx         # Contact form / links
│   │   └── ...                 # Header, Footer, NavigationBar, BackgroundAnimation, etc.
│   ├── hooks/
│   │   └── useSystemTheme.js
│   ├── utils/
│   │   └── i18n.js
│   ├── data.js                 # Static data (links, icons, metadata)
│   ├── App.jsx
│   └── main.jsx
├── server/
│   └── index.js                # Express API + static serving
├── public/
│   └── locales/{en,es}/        # Translation files
├── kubernetes/
│   └── portfolio.yaml          # Deployment, Service, IngressRoute
├── Dockerfile                  # Multi-stage build
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 24+
- npm

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=<your-supabase-project-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
PORT=3001
NODE_ENV=development
```

### Development

```bash
# Install dependencies
npm install

# Start the Vite dev server (port 3000)
npm run dev

# Start the Express API server (port 3001)
npm run server:dev
```

### Production Build

```bash
# Build the frontend
npm run build

# Start the production server
npm run start:prod
```

### Docker

```bash
# Build
docker build -t cjoga/portfolio:latest .

# Run
docker run -p 80:80 --env-file .env cjoga/portfolio:latest
```

The multi-stage Dockerfile builds the React frontend, then bundles it with the Express server into a minimal Node.js Alpine image serving on port 80.

### Kubernetes

```bash
kubectl apply -f kubernetes/portfolio.yaml
```

Deploys with 2 replicas, a ClusterIP service, and a Traefik IngressRoute for `cjoga.cloud`.

## Routes

| Path | Description |
|------|------------|
| `/` | Portfolio — Hero, About, Experience, Projects, Certifications, Contact |
| `/blog` | Blog listing with search and pagination |
| `/blog/:slug` | Individual post with TOC and related posts |
| `/admin/login` | Admin authentication |
| `/admin/dashboard` | Blog post management (protected) |
| `/admin/posts/new` | Create post (protected) |
| `/admin/posts/edit/:id` | Edit post (protected) |

## Author

**Jose Camilo Joga Guerrero** — DevOps & Cloud Engineer

- [LinkedIn](https://www.linkedin.com/in/cjoga)
- [GitHub](https://github.com/Camilool8)
- [josejoga.opx@gmail.com](mailto:josejoga.opx@gmail.com)
