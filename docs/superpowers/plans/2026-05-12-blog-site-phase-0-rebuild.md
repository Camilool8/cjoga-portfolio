# Blog-site Phase 0 Rebuild — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tear out the AI-generated placeholder content in `blog-site/`, scaffold the new audience-first information architecture (`/me`, `/engineering`, `/learn`) with empty skeleton pages, update Docusaurus config and the React landing page to match, prune dead code/dependencies, and add a Dockerfile — leaving the site buildable and deployable but with no real prose content yet.

**Architecture:** Pure structural pass. No content writing. Skeleton MDX files (frontmatter + heading scaffold + an HTML comment placeholder for the body) so the site builds cleanly under `onBrokenLinks: throw`. Real content lands in Phase 1+ during interview sessions, one page per commit.

**Tech Stack:** Docusaurus 3.10.1 + MDX, React 19, `@docusaurus/preset-classic` (handles sitemap + blog opt-out), `@docusaurus/theme-mermaid`, `@docusaurus/plugin-ideal-image`, `nginx:alpine` for the runtime image. Node 20.

**Reference spec:** [`docs/superpowers/specs/2026-05-12-blog-site-handbook-rebuild-design.md`](../specs/2026-05-12-blog-site-handbook-rebuild-design.md)

**Working directory for every command in this plan:** `blog-site/` (run `cd /Users/cjoga/web-development/cjoga-portfolio/blog-site` first if you've drifted out).

**Branch:** All work happens on `feature/blog-site-handbook-rebuild` (branched from `main`).

---

## Task 0: Commit blog-site/ baseline

**Why:** `blog-site/` is currently untracked in the parent `cjoga-portfolio` repo. Without a tracked baseline, the deletions in Task 1 produce empty commits (you can't `git rm` files that were never tracked). Committing the AI-placeholder state first gives every later task a meaningful diff and preserves history of the rebuild.

**Files:** every file under `blog-site/` (except what `.gitignore` already excludes: `node_modules/`, `build/`, `.docusaurus/`, env files).

- [ ] **Step 1: Verify the gitignore covers junk before staging**

```bash
cd /Users/cjoga/web-development/cjoga-portfolio
cat blog-site/.gitignore
```

Expected: `/node_modules`, `/build`, `.docusaurus`, `.cache-loader`, `.DS_Store`, env files all listed.

- [ ] **Step 2: Confirm we're on the feature branch**

```bash
git branch --show-current
```

Expected output: `feature/blog-site-handbook-rebuild`

- [ ] **Step 3: Stage blog-site/ explicitly (avoid sweeping in unrelated changes)**

```bash
git add blog-site/
git status --short blog-site/ | head -20
```

Expected: `A  blog-site/<various files>` for every file under blog-site/ that isn't gitignored. `node_modules/`, `build/`, `.docusaurus/` must NOT appear.

- [ ] **Step 4: Verify nothing ignored snuck in**

```bash
git status --short blog-site/ | grep -E 'node_modules|build/|\.docusaurus' && echo "PROBLEM" || echo "clean"
```

Expected output: `clean`

- [ ] **Step 5: Commit the baseline**

```bash
git commit -m "chore(blog-site): commit Docusaurus baseline (AI-placeholder state)

Captures the current blog-site/ as-is so the upcoming rebuild has a
tracked starting point. Everything under docs/ is AI-generated
placeholder content and will be torn out in the next commits per
docs/superpowers/plans/2026-05-12-blog-site-phase-0-rebuild.md.

Spec: docs/superpowers/specs/2026-05-12-blog-site-handbook-rebuild-design.md"
```

- [ ] **Step 6: Verify the baseline commit landed**

```bash
git log --oneline -3
git status --short blog-site/
```

Expected: top commit is the baseline. `git status --short blog-site/` shows no entries (everything tracked, nothing dirty).

---

## File Structure

### Files DELETED

```
blog-site/docs/about/_category_.json
blog-site/docs/about/who-i-am.mdx
blog-site/docs/about/opinions.mdx
blog-site/docs/homelab/_category_.json
blog-site/docs/homelab/overview.mdx
blog-site/docs/homelab/networking.mdx
blog-site/docs/homelab/kubernetes.mdx
blog-site/docs/homelab/deployment.mdx
blog-site/docs/homelab/hardware.mdx
blog-site/docs/homelab/distributed.mdx
blog-site/docs/work/_category_.json
blog-site/docs/work/index.mdx
blog-site/docs/certifications/_category_.json
blog-site/docs/certifications/overview.mdx
blog-site/docs/certifications/kubestronaut.mdx
blog-site/scripts/migrate-from-supabase.mjs
blog-site/static/img/undraw_docusaurus_mountain.svg
blog-site/static/img/undraw_docusaurus_react.svg
blog-site/static/img/undraw_docusaurus_tree.svg
blog-site/static/img/docusaurus.png
blog-site/static/img/docusaurus-social-card.jpg
blog-site/static/img/blog/             (if it exists — held migrated post covers)
blog-site/scripts/                     (folder, after the migration script is gone)
```

### Files CREATED

```
# Doc category files (5)
blog-site/docs/me/_category_.json
blog-site/docs/engineering/_category_.json
blog-site/docs/engineering/lab/_category_.json
blog-site/docs/engineering/work/_category_.json
blog-site/docs/learn/_category_.json

# /me skeletons (5 files)
blog-site/docs/me/who-i-am.mdx
blog-site/docs/me/opinions/index.mdx
blog-site/docs/me/now.mdx
blog-site/docs/me/reading-and-tools.mdx
blog-site/docs/me/credentials.mdx

# /engineering/lab skeletons (2 files at Phase 0; more added in Phase 1+)
blog-site/docs/engineering/lab/overview.mdx
blog-site/docs/engineering/lab/tips-and-gotchas/index.mdx

# /engineering/work skeletons (4 files)
blog-site/docs/engineering/work/inspyr-global-solutions.mdx
blog-site/docs/engineering/work/arctiq.mdx
blog-site/docs/engineering/work/fl-betances.mdx
blog-site/docs/engineering/work/kodepull.mdx

# /learn skeletons (2 files)
blog-site/docs/learn/index.mdx
blog-site/docs/learn/rhcsa.mdx

# Container build
blog-site/Dockerfile
blog-site/.dockerignore
blog-site/nginx.conf
```

### Files MODIFIED

```
blog-site/sidebars.js                          (3 sidebars instead of 4)
blog-site/docusaurus.config.js                 (navbar, footer, tagline, onBrokenLinks)
blog-site/src/pages/index.js                   (SECTIONS array + landing copy)
blog-site/src/components/AuthorCard/index.js   (bio sentence; user provides facts)
blog-site/package.json                         (remove 4 deps)
blog-site/package-lock.json                    (regenerated by npm install)
```

---

## Task 1: Delete the placeholder doc tree

**Why:** All 11 placeholder MDX files plus their 4 `_category_.json` files are AI hallucinations (e.g. claiming "3-node K3s grew to 7 nodes across four ISPs", "Tailscale mesh", etc.) that contradict the real homelab. Burning them clean prevents any of those false claims from drifting into the rebuild.

**Files:**
- Delete: `blog-site/docs/about/` (entire folder)
- Delete: `blog-site/docs/homelab/` (entire folder)
- Delete: `blog-site/docs/work/` (entire folder)
- Delete: `blog-site/docs/certifications/` (entire folder)

- [ ] **Step 1: Confirm the working directory and current files**

```bash
cd /Users/cjoga/web-development/cjoga-portfolio/blog-site
ls docs/
```

Expected output:
```
about
certifications
homelab
work
```

- [ ] **Step 2: Delete the four old top-level doc folders**

```bash
rm -rf docs/about docs/homelab docs/work docs/certifications
```

- [ ] **Step 3: Verify docs/ is now empty**

```bash
ls docs/
```

Expected output: (no output — directory is empty)

- [ ] **Step 4: Verify build fails (no docs left for the existing sidebars to autogenerate from)**

```bash
npm run build 2>&1 | tail -20
```

Expected: build fails with an error about missing `about`, `homelab`, `work`, or `certifications` dirName in sidebars. **This failure is expected** — sidebars.js still references the old folders. We fix it in Task 6.

- [ ] **Step 5: Commit**

```bash
git add -A docs/
git commit -m "chore(blog-site): delete AI-placeholder docs (about/homelab/work/certifications)

These pages were never real content — they contained hallucinated facts
about the cluster shape, networking stack, and certifications. Burned
clean ahead of the audience-first rebuild (/me, /engineering, /learn).

Spec: docs/superpowers/specs/2026-05-12-blog-site-handbook-rebuild-design.md"
```

---

## Task 2: Remove the dead Supabase migration script and its dependencies

**Why:** `scripts/migrate-from-supabase.mjs` was a one-off to pull homelab blog posts from Supabase into a Docusaurus `blog/` folder. The spec decided: **no blog, docs only**. The script is dead code, and four packages exist only to support it (`@supabase/supabase-js`, `dotenv`, `slugify`, `turndown`).

**Files:**
- Delete: `blog-site/scripts/migrate-from-supabase.mjs`
- Delete: `blog-site/scripts/` (folder, after the script)
- Modify: `blog-site/package.json` — remove 4 entries from `dependencies`
- Regenerate: `blog-site/package-lock.json` (via `npm install`)

- [ ] **Step 1: Delete the migration script and its folder**

```bash
rm scripts/migrate-from-supabase.mjs
rmdir scripts
ls -d scripts 2>&1
```

Expected output: `ls: scripts: No such file or directory`

- [ ] **Step 2: Open `package.json` and remove the four dead dependencies**

Edit `blog-site/package.json`. In the `dependencies` block, remove these four lines (keep the trailing-comma syntax of neighbors valid):

```diff
   "dependencies": {
     "@docusaurus/core": "3.10.1",
     "@docusaurus/faster": "3.10.1",
     "@docusaurus/plugin-ideal-image": "^3.10.1",
     "@docusaurus/preset-classic": "3.10.1",
     "@docusaurus/theme-mermaid": "^3.10.1",
     "@mdx-js/react": "^3.0.0",
-    "@supabase/supabase-js": "^2.105.4",
     "clsx": "^2.0.0",
-    "dotenv": "^17.4.2",
     "prism-react-renderer": "^2.3.0",
     "react": "^19.0.0",
     "react-dom": "^19.0.0",
-    "slugify": "^1.6.9",
-    "turndown": "^7.2.4"
   },
```

Final `dependencies` block:

```json
  "dependencies": {
    "@docusaurus/core": "3.10.1",
    "@docusaurus/faster": "3.10.1",
    "@docusaurus/plugin-ideal-image": "^3.10.1",
    "@docusaurus/preset-classic": "3.10.1",
    "@docusaurus/theme-mermaid": "^3.10.1",
    "@mdx-js/react": "^3.0.0",
    "clsx": "^2.0.0",
    "prism-react-renderer": "^2.3.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
```

- [ ] **Step 3: Reinstall to regenerate the lockfile**

```bash
npm install
```

Expected: completes without error. Lockfile is rewritten without the four packages.

- [ ] **Step 4: Verify the removed packages no longer appear in the lockfile**

```bash
grep -E '"(@supabase/supabase-js|dotenv|slugify|turndown)":' package-lock.json | head
```

Expected output: (no output)

- [ ] **Step 5: Commit**

```bash
git add -A scripts package.json package-lock.json
git commit -m "chore(blog-site): remove dead Supabase migration script and its deps

The migration script existed to pull old homelab blog posts from
Supabase into a Docusaurus blog/ folder. The spec decided this site
is docs-only, so the script is dead code. Drops four packages
(@supabase/supabase-js, dotenv, slugify, turndown) that only the
script used."
```

---

## Task 3: Remove unused default Docusaurus illustrations

**Why:** The three `undraw_docusaurus_*.svg` files, `docusaurus.png`, and `docusaurus-social-card.jpg` are leftover defaults from `npx create-docusaurus`. They aren't referenced anywhere in our customized site (verified by grep before deletion). `static/img/blog/` would have held migrated post covers — gone with the migration script.

**Files:**
- Delete: `blog-site/static/img/undraw_docusaurus_mountain.svg`
- Delete: `blog-site/static/img/undraw_docusaurus_react.svg`
- Delete: `blog-site/static/img/undraw_docusaurus_tree.svg`
- Delete: `blog-site/static/img/docusaurus.png`
- Delete: `blog-site/static/img/docusaurus-social-card.jpg`
- Delete: `blog-site/static/img/blog/` (if it exists)

- [ ] **Step 1: Verify none of these assets are referenced in our code**

```bash
grep -RIn --include='*.{js,jsx,ts,tsx,mdx,md,css,json}' \
  -e 'undraw_docusaurus' \
  -e 'docusaurus.png' \
  -e 'docusaurus-social-card' \
  src/ docs/ docusaurus.config.js sidebars.js 2>/dev/null
```

Expected output: (no output — none referenced)

If anything is matched, **stop and report it** — the file is in use and the plan needs to change before deleting.

- [ ] **Step 2: Delete the default illustrations and any leftover blog images**

```bash
rm -f static/img/undraw_docusaurus_mountain.svg \
      static/img/undraw_docusaurus_react.svg \
      static/img/undraw_docusaurus_tree.svg \
      static/img/docusaurus.png \
      static/img/docusaurus-social-card.jpg
rm -rf static/img/blog
```

- [ ] **Step 3: Verify what's left in `static/img/`**

```bash
ls static/img/
```

Expected output:
```
apple-touch-icon.png
favicon.ico
logo.svg
og-image.webp
```

- [ ] **Step 4: Commit**

```bash
git add -A static/img/
git commit -m "chore(blog-site): drop unused default Docusaurus illustrations

These assets shipped with create-docusaurus and were never referenced
by our customized landing or any of our (now-deleted) docs."
```

---

## Task 4: Scaffold the new doc folders with `_category_.json` files

**Why:** Docusaurus uses `_category_.json` per folder to set sidebar labels, order, and the auto-generated category landing page. We need five of them: `me`, `engineering`, `engineering/lab`, `engineering/work`, `learn`. Following the format we already used in the placeholders (with `generated-index` links so each section has a clean landing URL).

**Files:**
- Create: `blog-site/docs/me/_category_.json`
- Create: `blog-site/docs/engineering/_category_.json`
- Create: `blog-site/docs/engineering/lab/_category_.json`
- Create: `blog-site/docs/engineering/work/_category_.json`
- Create: `blog-site/docs/learn/_category_.json`

- [ ] **Step 1: Create folder tree**

```bash
mkdir -p docs/me/opinions \
         docs/engineering/lab/tips-and-gotchas \
         docs/engineering/work \
         docs/learn
```

- [ ] **Step 2: Write `docs/me/_category_.json`**

```json
{
  "label": "Me",
  "position": 1,
  "collapsible": true,
  "collapsed": false,
  "link": {
    "type": "generated-index",
    "title": "Me",
    "description": "Who I am, what I'm doing now, what I read, and what I've earned.",
    "slug": "/me",
    "keywords": ["about", "bio", "opinions", "credentials"]
  }
}
```

- [ ] **Step 3: Write `docs/engineering/_category_.json`**

```json
{
  "label": "Engineering",
  "position": 2,
  "collapsible": true,
  "collapsed": false,
  "link": {
    "type": "generated-index",
    "title": "Engineering",
    "description": "The K3s homelab and the consulting work that pays for it.",
    "slug": "/engineering",
    "keywords": ["engineering", "homelab", "work", "devops", "kubernetes"]
  }
}
```

- [ ] **Step 4: Write `docs/engineering/lab/_category_.json`**

```json
{
  "label": "Lab",
  "position": 1,
  "collapsible": true,
  "collapsed": false,
  "link": {
    "type": "generated-index",
    "title": "Homelab",
    "description": "The K3s cluster behind cjoga.cloud — what runs on it, how it's wired, and the things that broke.",
    "slug": "/engineering/lab",
    "keywords": ["homelab", "kubernetes", "k3s", "envoy", "cloudflared"]
  }
}
```

- [ ] **Step 5: Write `docs/engineering/work/_category_.json`**

```json
{
  "label": "Work",
  "position": 2,
  "collapsible": true,
  "collapsed": false,
  "link": {
    "type": "generated-index",
    "title": "Work",
    "description": "Engagements past and present — described by employer, never by client.",
    "slug": "/engineering/work",
    "keywords": ["work", "consulting", "career", "devops"]
  }
}
```

- [ ] **Step 6: Write `docs/learn/_category_.json`**

```json
{
  "label": "Learn",
  "position": 3,
  "collapsible": true,
  "collapsed": false,
  "link": {
    "type": "generated-index",
    "title": "Learn",
    "description": "Curated certification guides — one per cert I think is worth your time.",
    "slug": "/learn",
    "keywords": ["learn", "certifications", "study guide", "rhcsa", "linux"]
  }
}
```

- [ ] **Step 7: Commit**

```bash
git add -A docs/
git commit -m "chore(blog-site): scaffold /me, /engineering, /learn category metadata

Adds the five _category_.json files that define the new sidebar
structure. Each section has a generated-index landing page with a
clean slug. No MDX pages yet — they come in the next tasks."
```

---

## Task 5: Create skeleton MDX files for `/me`

**Why:** Every page in Section 4 of the spec needs to exist as a skeleton MDX before sidebars.js can autogenerate against the new tree without errors. Skeletons have **real frontmatter** (so they're indexable and have descriptions for social previews) and **a heading scaffold** (so they match the spec's per-page outline), but the body is a single HTML comment placeholder. **Do not write prose** — that's the Phase 1+ interview job, one page per session.

**Files:**
- Create: `blog-site/docs/me/who-i-am.mdx`
- Create: `blog-site/docs/me/opinions/index.mdx`
- Create: `blog-site/docs/me/now.mdx`
- Create: `blog-site/docs/me/reading-and-tools.mdx`
- Create: `blog-site/docs/me/credentials.mdx`

- [ ] **Step 1: Write `docs/me/who-i-am.mdx`**

```mdx
---
sidebar_position: 1
title: Who I am
description: The origin story — where I'm from, how I got into DevOps, what drives me, and how I work.
slug: /me/who-i-am
keywords: [about, bio, origin, dominican republic, devops]
---

# Who I am

{/* Body to be filled during Phase 1 interview pass. Do not write prose here. */}

## Where I'm from

## How I got into DevOps

## What drives me

## How I work

## How to reach me

import AuthorCard from '@site/src/components/AuthorCard';

<AuthorCard />
```

- [ ] **Step 2: Write `docs/me/opinions/index.mdx`**

This is the section index for opinions/essays. Individual essays are added one-per-MDX during Phase 1+.

```mdx
---
sidebar_position: 2
title: Opinions
description: Strong takes on the things I work with — tools, practices, and the parts of DevOps I think are wrong.
slug: /me/opinions
keywords: [opinions, essays, devops, tools]
---

# Opinions

{/* Section landing. Individual essays land as sibling MDX files in this folder. */}

This is where I write things I actually believe — not hedge-everything corporate posts, just the takes I'd defend in a code review.

{/* List of essays will be filled here as they're written (Phase 1+). */}
```

- [ ] **Step 3: Write `docs/me/now.mdx`**

```mdx
---
sidebar_position: 3
title: Now
description: What I'm doing, learning, and building right now. Dated; updated occasionally.
slug: /me/now
keywords: [now, current, learning, building]
---

# Now

{/* Body to be filled during Phase 1 interview pass. Top of page = current month. */}

## Right now

## Learning

## Building

## Reading
```

- [ ] **Step 4: Write `docs/me/reading-and-tools.mdx`**

```mdx
---
sidebar_position: 4
title: Reading and tools
description: Books that shaped how I think, the tools I use daily, and the hardware I keep on my desk.
slug: /me/reading-and-tools
keywords: [reading, books, tools, hardware, setup]
---

# Reading and tools

{/* Body to be filled during Phase 1 interview pass. */}

## Books that shaped me

## Daily-driver tools

## Hardware

## Things I tried and dropped

import AuthorCard from '@site/src/components/AuthorCard';

<AuthorCard />
```

- [ ] **Step 5: Write `docs/me/credentials.mdx`**

```mdx
---
sidebar_position: 5
title: Credentials
description: Certifications, education, languages, and recognition — in order earned.
slug: /me/credentials
keywords: [credentials, certifications, education, awards]
---

# Credentials

{/* Body to be filled during Phase 1 interview pass. Certs link out to /learn guides where available. */}

## Certifications

## Education

## Languages

## Recognition

import AuthorCard from '@site/src/components/AuthorCard';

<AuthorCard />
```

- [ ] **Step 6: Verify the file tree**

```bash
find docs/me -type f | sort
```

Expected output:
```
docs/me/_category_.json
docs/me/credentials.mdx
docs/me/now.mdx
docs/me/opinions/index.mdx
docs/me/reading-and-tools.mdx
docs/me/who-i-am.mdx
```

- [ ] **Step 7: Commit**

```bash
git add -A docs/me/
git commit -m "chore(blog-site): scaffold /me skeleton pages

Five skeletons under /me: who-i-am, opinions/index, now,
reading-and-tools, credentials. Frontmatter and heading scaffolds
only — bodies are filled in Phase 1+ interview sessions."
```

---

## Task 6: Create skeleton MDX files for `/engineering/lab`

**Why:** Same skeleton rule as Task 5. The lab section starts with just two files: an overview and a tips-and-gotchas index. Additional lab pages (hardware, network, k3s-cluster, services, observability, gitops) are decided during the Phase 1+ lab interview pass and added as their own files at that time — they do **not** belong in Phase 0.

**Files:**
- Create: `blog-site/docs/engineering/lab/overview.mdx`
- Create: `blog-site/docs/engineering/lab/tips-and-gotchas/index.mdx`

- [ ] **Step 1: Write `docs/engineering/lab/overview.mdx`**

```mdx
---
sidebar_position: 1
title: Lab overview
description: The tour — what I run at home, why, and how the pieces fit together.
slug: /engineering/lab/overview
keywords: [homelab, kubernetes, k3s, cluster, envoy, cloudflared]
---

# Lab overview

{/* Body to be filled during Phase 1 interview pass. Includes a mermaid diagram of the cluster. */}

## What I run

## Why I run it at home

## High-level layout

{/* mermaid diagram goes here */}

## Where to read more

import AuthorCard from '@site/src/components/AuthorCard';

<AuthorCard />
```

- [ ] **Step 2: Write `docs/engineering/lab/tips-and-gotchas/index.mdx`**

```mdx
---
sidebar_position: 2
title: Tips and gotchas
description: Short, lab-specific posts about things that broke and what I'd do differently.
slug: /engineering/lab/tips-and-gotchas
keywords: [homelab, gotchas, tips, debugging, kubernetes]
---

# Tips and gotchas

{/* Section landing. Individual tips land as sibling MDX files. */}

Lab-specific notes from things that broke, took too long to debug, or that I want my future self to find quickly.

{/* List of tips will be filled here as they're written (Phase 1+). */}
```

- [ ] **Step 3: Verify the file tree**

```bash
find docs/engineering/lab -type f | sort
```

Expected output:
```
docs/engineering/lab/_category_.json
docs/engineering/lab/overview.mdx
docs/engineering/lab/tips-and-gotchas/index.mdx
```

- [ ] **Step 4: Commit**

```bash
git add -A docs/engineering/lab/
git commit -m "chore(blog-site): scaffold /engineering/lab skeleton pages

Two skeletons: overview (the tour) and tips-and-gotchas (index).
Additional lab pages (hardware, network, k3s, services, etc.) are
added during the Phase 1+ lab interview pass, not now."
```

---

## Task 7: Create skeleton MDX files for `/engineering/work`

**Why:** Four employer pages: INSPYR Global Solutions (ex-Arroyo Consulting), Arctiq (ex-Shadow-Soft), FL Betances & Asociados, KODEPULL (own company, includes ventures like tutoriasuniversitarias). **No client names** anywhere — the spec's hard rule, repeated in memory. Even the description fields stay generic.

**Files:**
- Create: `blog-site/docs/engineering/work/inspyr-global-solutions.mdx`
- Create: `blog-site/docs/engineering/work/arctiq.mdx`
- Create: `blog-site/docs/engineering/work/fl-betances.mdx`
- Create: `blog-site/docs/engineering/work/kodepull.mdx`

- [ ] **Step 1: Write `docs/engineering/work/inspyr-global-solutions.mdx`**

```mdx
---
sidebar_position: 1
title: INSPYR Global Solutions
description: DevOps engineer at INSPYR Global Solutions (formerly Arroyo Consulting) — the work, the stack, and what I've learned.
slug: /engineering/work/inspyr-global-solutions
keywords: [work, devops, consulting, inspyr, arroyo]
---

# INSPYR Global Solutions

{/* Body to be filled during Phase 1 interview pass. No client names. */}

## Role

## Context and scale

## Tech stack

## What I've built and owned

## What I've learned

import AuthorCard from '@site/src/components/AuthorCard';

<AuthorCard />
```

- [ ] **Step 2: Write `docs/engineering/work/arctiq.mdx`**

```mdx
---
sidebar_position: 2
title: Arctiq
description: DevOps consultant at Arctiq (formerly Shadow-Soft) — the work, the stack, and what I've learned.
slug: /engineering/work/arctiq
keywords: [work, devops, consulting, arctiq, shadow-soft]
---

# Arctiq

{/* Body to be filled during Phase 1 interview pass. No client names. */}

## Role

## Context and scale

## Tech stack

## What I've built and owned

## What I've learned

import AuthorCard from '@site/src/components/AuthorCard';

<AuthorCard />
```

- [ ] **Step 3: Write `docs/engineering/work/fl-betances.mdx`**

```mdx
---
sidebar_position: 3
title: FL Betances & Asociados
description: Previous role at FL Betances & Asociados — the work and what I learned.
slug: /engineering/work/fl-betances
keywords: [work, devops, fl betances]
---

# FL Betances & Asociados

{/* Body to be filled during Phase 1 interview pass. */}

## Role

## Context and scale

## Tech stack

## What I built and owned

## What I learned

import AuthorCard from '@site/src/components/AuthorCard';

<AuthorCard />
```

- [ ] **Step 4: Write `docs/engineering/work/kodepull.mdx`**

```mdx
---
sidebar_position: 4
title: KODEPULL
description: KODEPULL SRL — my own software company in the Dominican Republic. The ventures under it and what I've learned running it.
slug: /engineering/work/kodepull
keywords: [work, kodepull, entrepreneurship, tutoriasuniversitarias, dominican republic]
---

# KODEPULL

{/* Body to be filled during Phase 1 interview pass. */}

## What KODEPULL is

## Why I started it

## Ventures under it

## What I've learned running it

import AuthorCard from '@site/src/components/AuthorCard';

<AuthorCard />
```

- [ ] **Step 5: Verify the file tree**

```bash
find docs/engineering/work -type f | sort
```

Expected output:
```
docs/engineering/work/_category_.json
docs/engineering/work/arctiq.mdx
docs/engineering/work/fl-betances.mdx
docs/engineering/work/inspyr-global-solutions.mdx
docs/engineering/work/kodepull.mdx
```

- [ ] **Step 6: Commit**

```bash
git add -A docs/engineering/work/
git commit -m "chore(blog-site): scaffold /engineering/work skeleton pages

Four employer pages: inspyr-global-solutions, arctiq, fl-betances,
kodepull. No client names anywhere — only employers. KODEPULL page
will cover ventures (tutoriasuniversitarias, etc.) under it."
```

---

## Task 8: Create skeleton MDX files for `/learn`

**Why:** /learn launches with exactly one published guide: RHCSA (EX200). The section index introduces what /learn is and lists available guides. Future cert guides are added one at a time in their own sessions — not as skeletons here.

**Files:**
- Create: `blog-site/docs/learn/index.mdx`
- Create: `blog-site/docs/learn/rhcsa.mdx`

- [ ] **Step 1: Write `docs/learn/index.mdx`**

```mdx
---
sidebar_position: 1
title: Learn
description: Curated certification guides — my experience, my tips, and the runbooks I've built.
slug: /learn
keywords: [learn, certifications, study guide]
---

# Learn

{/* Section landing. Generic intro that survives new guides being added. */}

This section is for anyone studying for a cert I've passed and decided was worth a real guide.

## Why I write these

{/* To be filled during Phase 1 interview pass. */}

## How to use a guide

{/* To be filled during Phase 1 interview pass. */}

## Available guides

- [RHCSA (EX200)](/learn/rhcsa)

## How they're maintained

{/* To be filled during Phase 1 interview pass. */}
```

- [ ] **Step 2: Write `docs/learn/rhcsa.mdx`**

```mdx
---
sidebar_position: 2
title: RHCSA (EX200) guide
description: My honest take on the RHCSA exam — how I studied, what tripped me up, and the runbook I'd hand to a friend.
slug: /learn/rhcsa
keywords: [rhcsa, ex200, red hat, linux, certification, study guide]
---

# RHCSA (EX200) guide

{/* Body to be filled during Phase 1 interview pass. Anchored on github.com/Camilool8/RHCSA-LAB. */}

## What the exam tests

## How I studied

## Prep timeline

## Lab setup

{/* Link out to github.com/Camilool8/RHCSA-LAB */}

## Topic-by-topic notes

## Day-of-exam tips

## What I'd do differently

import AuthorCard from '@site/src/components/AuthorCard';

<AuthorCard />
```

- [ ] **Step 3: Verify the file tree**

```bash
find docs/learn -type f | sort
```

Expected output:
```
docs/learn/_category_.json
docs/learn/index.mdx
docs/learn/rhcsa.mdx
```

- [ ] **Step 4: Commit**

```bash
git add -A docs/learn/
git commit -m "chore(blog-site): scaffold /learn with index + RHCSA placeholder

/learn launches with one cert guide (RHCSA, EX200) anchored on
github.com/Camilool8/RHCSA-LAB. Future cert guides are added one
at a time in their own sessions."
```

---

## Task 9: Update `sidebars.js` for the new structure

**Why:** The current `sidebars.js` references four old dirNames (`about`, `homelab`, `work`, `certifications`) that no longer exist. Build fails until this points to the new `me`, `engineering`, `learn` autogenerated trees.

**Files:**
- Modify: `blog-site/sidebars.js`

- [ ] **Step 1: Replace the entire contents of `sidebars.js`**

```js
// @ts-check
// Each top-level navbar entry has its own sidebar, autogenerated from
// the matching folder under docs/. Order and category labels come from
// _category_.json files inside each folder.

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  me: [{ type: "autogenerated", dirName: "me" }],
  engineering: [{ type: "autogenerated", dirName: "engineering" }],
  learn: [{ type: "autogenerated", dirName: "learn" }],
};

export default sidebars;
```

- [ ] **Step 2: Build (expect a remaining failure in `docusaurus.config.js`)**

```bash
npm run build 2>&1 | tail -25
```

Expected: Build still fails — `docusaurus.config.js`'s navbar references `sidebarId: "about"` (etc.), but those sidebars no longer exist. We fix that in Task 10. **Sidebars autogeneration itself should not be the error**; if it is, re-check Task 5–8 outputs.

- [ ] **Step 3: Commit**

```bash
git add sidebars.js
git commit -m "chore(blog-site): point sidebars at the new /me, /engineering, /learn tree

Three autogenerated sidebars instead of four. Docs autogeneration
walks _category_.json + frontmatter sidebar_position to order pages."
```

---

## Task 10: Update `docusaurus.config.js` — navbar, footer, tagline, broken-links

**Why:** The navbar references the old four sidebar IDs and currently has a `↗` suffix on the Portfolio link that duplicates the existing icon styling. Footer links point at deleted pages. Tagline references the old structure. `onBrokenLinks` is `warn` — should fail the build, not silently survive.

**Files:**
- Modify: `blog-site/docusaurus.config.js`

- [ ] **Step 1: Update the tagline**

Find:
```js
  tagline: "Camilo's handbook — homelab, certifications, and field notes",
```

Replace with:
```js
  tagline: "Camilo's handbook — opinions, the lab, and cert guides.",
```

- [ ] **Step 2: Change `onBrokenLinks` from `warn` to `throw`**

Find:
```js
  onBrokenLinks: "warn",
```

Replace with:
```js
  onBrokenLinks: "throw",
```

Also update the markdown hook just below:

Find:
```js
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
```

Replace with:
```js
    hooks: {
      onBrokenMarkdownLinks: "throw",
    },
```

- [ ] **Step 3: Replace the navbar `items` array**

Find the existing `navbar.items` block (currently four `docSidebar` items + Portfolio + GitHub) and replace with:

```js
        items: [
          {
            type: "docSidebar",
            sidebarId: "me",
            position: "left",
            label: "Me",
          },
          {
            type: "docSidebar",
            sidebarId: "engineering",
            position: "left",
            label: "Engineering",
          },
          {
            type: "docSidebar",
            sidebarId: "learn",
            position: "left",
            label: "Learn",
          },
          {
            href: "https://cjoga.cloud",
            label: "Portfolio",
            position: "right",
            className: "navbar-portfolio-link",
          },
          {
            href: "https://github.com/Camilool8",
            label: "GitHub",
            position: "right",
          },
        ],
```

(Note: the `↗` arrow is removed from the Portfolio label per spec — the `navbar-portfolio-link` class can carry that styling if desired, but the label string itself is clean.)

- [ ] **Step 4: Replace the footer `links` array**

Find the existing `footer.links` block and replace with:

```js
        links: [
          {
            title: "Handbook",
            items: [
              { label: "Me", to: "/me" },
              { label: "Engineering", to: "/engineering" },
              { label: "Learn", to: "/learn" },
            ],
          },
          {
            title: "Camilo",
            items: [
              { label: "Portfolio", href: "https://cjoga.cloud" },
              { label: "GitHub", href: "https://github.com/Camilool8" },
              { label: "LinkedIn", href: "https://www.linkedin.com/in/cjoga" },
              { label: "Email", href: "mailto:josejoga.opx@gmail.com" },
            ],
          },
        ],
```

The copyright line below stays as-is (it uses `new Date().getFullYear()` so it's always current).

- [ ] **Step 5: Build to check config is internally consistent (landing page may still break)**

```bash
npm run build 2>&1 | tail -25
```

Expected: build still fails — `src/pages/index.js` references `/about/who-i-am`, `/homelab/overview`, etc. With `onBrokenLinks: throw` those resolve as broken. We fix that in Task 11.

- [ ] **Step 6: Commit**

```bash
git add docusaurus.config.js
git commit -m "chore(blog-site): update navbar, footer, tagline, broken-link policy

Navbar items become Me / Engineering / Learn. Footer Handbook column
links to the new section landings. Tagline rephrased. onBrokenLinks
is now throw (and onBrokenMarkdownLinks) so a broken link fails the
build instead of silently shipping."
```

---

## Task 11: Update the React landing page (`src/pages/index.js`)

**Why:** The landing's `SECTIONS` array points to deleted routes (`/about/who-i-am`, `/homelab/overview`, `/work`, `/certifications/overview`) and the copy describes the old four-section structure. Per the spec, the landing keeps its visual styling but is rewritten as an audience-first "start here" index ("If you're hiring / If you're studying / If you're curious"). The "Available guides" list under "If you're studying" must include `/learn/rhcsa` as the only entry at launch.

**Files:**
- Modify: `blog-site/src/pages/index.js`

- [ ] **Step 1: Replace the entire contents of `src/pages/index.js`**

```jsx
// Landing for blog.cjoga.cloud. Audience-first "start here" index:
// hiring managers, learners, and homelab-curious readers each see the
// path that's actually useful to them. Keeps the existing styling
// (hero, orbs, typographic rows) intact.

import React from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "./index.module.css";

const PATHS = [
  {
    eyebrow: "If you're hiring",
    rows: [
      { to: "/me/who-i-am", label: "Who I am" },
      { to: "/engineering/work", label: "What I've built" },
    ],
  },
  {
    eyebrow: "If you're studying",
    intro:
      "Honest cert guides — my experience, my tips, and the runbooks I'd hand to a friend.",
    rows: [{ to: "/learn/rhcsa", label: "RHCSA (EX200) guide" }],
  },
  {
    eyebrow: "If you're curious about the lab",
    rows: [{ to: "/engineering/lab/overview", label: "The K3s setup" }],
  },
];

function PathBlock({ path }) {
  return (
    <section className={styles.pathBlock}>
      <div className={styles.eyebrow}>
        <span className={styles.eyebrowDot} aria-hidden="true" />
        {path.eyebrow}
      </div>
      {path.intro ? <p className={styles.pathIntro}>{path.intro}</p> : null}
      <nav className={styles.sections} aria-label={path.eyebrow}>
        {path.rows.map((row) => (
          <Link key={row.to} to={row.to} className={styles.row}>
            <div className={styles.rowLabel}>{row.label}</div>
            <div className={styles.rowArrow} aria-hidden="true">→</div>
          </Link>
        ))}
      </nav>
    </section>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <main className={styles.main}>
        <div className={styles.backdrop} aria-hidden="true">
          <div className={`${styles.orb} ${styles.orbAccent}`} />
          <div className={`${styles.orb} ${styles.orbBlue}`} />
        </div>

        <section className={styles.hero}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            cjoga.cloud / handbook
          </div>
          <h1 className={styles.title}>
            This is where I write things down.
          </h1>
          <p className={styles.lede}>
            A working handbook — opinions, the K3s lab that runs{" "}
            <code>cjoga.cloud</code>, the consulting work that pays the bills,
            and cert guides for the certs I think are worth your time. Nothing
            here is for sale. Read whatever's useful.
          </p>
        </section>

        <div className={styles.paths}>
          {PATHS.map((path) => (
            <PathBlock key={path.eyebrow} path={path} />
          ))}
        </div>

        <footer className={styles.signoff}>
          <p>
            New pages land when they're ready, not on a schedule. If something
            here is wrong, or you want to talk about the work,{" "}
            <Link to="/me/who-i-am#how-to-reach-me" className={styles.signoffLink}>
              email is the right channel
            </Link>
            .
          </p>
        </footer>
      </main>
    </Layout>
  );
}
```

**Note for the executor:** The CSS in `src/pages/index.module.css` already defines `.row`, `.rowLabel`, `.rowArrow`, `.sections`, `.hero`, `.signoff`, `.eyebrow`, etc. We are **reusing those existing classes** — no CSS changes in this task. The added markup (`.pathBlock`, `.pathIntro`, `.paths`) uses classes that don't yet exist in the CSS module; CSS Modules don't error on missing class names, so the build won't fail, but those elements will be unstyled. Style passes happen in Phase 1+ as part of the per-page polish work — Phase 0 prioritizes routing correctness over visual polish for the landing.

- [ ] **Step 2: Run the build (this should now pass — no broken links remain)**

```bash
npm run build 2>&1 | tail -30
```

Expected: build succeeds. Look for `[SUCCESS]` and the "Server-side rendering successful" message. If a broken link error appears, the offending path is listed — typically a stale path missed in this task.

- [ ] **Step 3: Quick smoke check — does the dev server come up?**

```bash
npm start &
DEV_PID=$!
sleep 6
curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:3000/
kill $DEV_PID 2>/dev/null
wait $DEV_PID 2>/dev/null
```

Expected: `200`. (The dev server can take 6+ seconds on a cold start; bump the sleep if needed.)

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.js
git commit -m "feat(blog-site): rewrite landing page as audience-first start-here index

Three reader paths (hiring / studying / curious about the lab) instead
of four equal section rows. The 'If you're studying' block lists
available cert guides — currently just RHCSA — and grows as new guides
ship. Keeps the existing hero + orb backdrop styling."
```

---

## Task 12: Update `AuthorCard` bio (requires user input)

**Why:** The current `AuthorCard` claims a "3-node K3s cluster of repurposed laptops" — the user already flagged this as inaccurate. The real cluster shape needs to come from the user before this commit lands.

**Files:**
- Modify: `blog-site/src/components/AuthorCard/index.js`

- [ ] **Step 1: Pause and ask the user for the current cluster facts**

Before writing any code, ask Camilo:

> "AuthorCard currently says '3-node K3s cluster of repurposed laptops'. What's the real cluster shape today — node count, hardware, anything else you'd want a recruiter or reader to see in a one-sentence bio? Keep it under ~30 words."

Wait for the answer. **Do not invent details.** If Camilo wants to defer this and leave the bio as a TODO, skip the edit and the commit for this task — note the deferral and proceed to Task 13.

- [ ] **Step 2: Replace the bio sentence in `src/components/AuthorCard/index.js`**

Open the file and find this paragraph block:

```jsx
        <p className={styles.bio}>
          DevOps &amp; Cloud Engineer based in the Dominican Republic. I run{" "}
          <code>cjoga.cloud</code> on a 3-node K3s cluster of repurposed
          laptops and write here when I learn something worth sharing.
        </p>
```

Replace the inner sentence with the version Camilo just provided. Keep the surrounding `<p>` and `<code>` styling. Example template (substitute actual facts):

```jsx
        <p className={styles.bio}>
          DevOps &amp; Cloud Engineer based in the Dominican Republic. I run{" "}
          <code>cjoga.cloud</code> on {/* CAMILO'S DICTATED FACTS */}, and
          write here when I learn something worth sharing.
        </p>
```

- [ ] **Step 3: Decide on the RSS link**

The current AuthorCard has an RSS link to `/rss.xml`. The spec defers the RSS decision (default: no feed at launch). Remove the link so we don't ship a 404 from every page.

Find:
```jsx
          <span aria-hidden="true">·</span>
          <Link to="/rss.xml" className={styles.link}>
            RSS
          </Link>
```

Delete those four lines (including the leading separator `·`).

- [ ] **Step 4: Build to confirm nothing broke**

```bash
npm run build 2>&1 | tail -10
```

Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/AuthorCard/index.js
git commit -m "fix(blog-site): correct AuthorCard bio + drop dead RSS link

Bio sentence updated to reflect the real homelab shape (the previous
text claimed '3-node K3s of repurposed laptops' which is no longer
accurate). RSS link removed — there is no feed at launch."
```

---

## Task 13: Add the Dockerfile, nginx config, and `.dockerignore`

**Why:** Per spec Section 7, this repo owns the image build (manifests live in `kp-k8s-dev`). Multi-stage build: `node:20-alpine` builds, `nginx:alpine` serves. Cloudflared terminates TLS upstream, so nginx speaks plain HTTP on 80. Image gets pushed to Docker Hub as `cjoga/blog-site`.

**Files:**
- Create: `blog-site/Dockerfile`
- Create: `blog-site/nginx.conf`
- Create: `blog-site/.dockerignore`

- [ ] **Step 1: Create `blog-site/.dockerignore`**

```
node_modules
build
.docusaurus
.cache-loader
.git
.gitignore
.env*
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
Dockerfile
.dockerignore
README.md
```

- [ ] **Step 2: Create `blog-site/nginx.conf`**

```nginx
worker_processes auto;
events { worker_connections 1024; }

http {
  include       /etc/nginx/mime.types;
  default_type  application/octet-stream;
  sendfile      on;
  tcp_nopush    on;
  tcp_nodelay   on;
  keepalive_timeout 65;

  gzip on;
  gzip_vary on;
  gzip_proxied any;
  gzip_comp_level 6;
  gzip_types
    text/plain
    text/css
    text/xml
    text/javascript
    application/javascript
    application/x-javascript
    application/json
    application/xml
    application/xml+rss
    image/svg+xml;

  server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Cache hashed assets aggressively; Docusaurus fingerprints them.
    location ~* \.(?:js|css|woff2?|ttf|otf|eot|svg|png|jpg|jpeg|gif|webp|ico)$ {
      expires 1y;
      add_header Cache-Control "public, immutable";
      try_files $uri =404;
    }

    # HTML is short-cached so deploys are visible quickly.
    location / {
      add_header Cache-Control "no-cache, must-revalidate";
      try_files $uri $uri/ $uri.html /index.html;
    }

    # Health endpoint for Kubernetes readiness/liveness in kp-k8s-dev.
    location = /healthz {
      access_log off;
      return 200 "ok\n";
      add_header Content-Type text/plain;
    }
  }
}
```

- [ ] **Step 3: Create `blog-site/Dockerfile`**

```dockerfile
# syntax=docker/dockerfile:1.7

# ─── Builder ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps first for better layer caching.
COPY package.json package-lock.json ./
RUN npm ci

# Bring in the rest of the source and build the static site.
COPY . .
RUN npm run build

# ─── Runtime ────────────────────────────────────────────────────────
FROM nginx:alpine AS runtime

# Replace the default nginx config with ours (gzip, caching, healthz).
COPY nginx.conf /etc/nginx/nginx.conf

# Static site output from the builder stage.
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

# nginx:alpine already sets CMD ["nginx", "-g", "daemon off;"] — keep it.
```

- [ ] **Step 4: Build the image locally to verify it works**

```bash
docker build -t blog-site:dev .
```

Expected: build succeeds. The builder stage runs `npm ci` then `npm run build`; the runtime stage copies the output to nginx's web root. Final image is small (~50MB on `nginx:alpine` plus the static site).

- [ ] **Step 5: Smoke-test the running container**

```bash
docker run --rm -d -p 8080:80 --name blog-site-test blog-site:dev
sleep 2
curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:8080/
curl -sS http://localhost:8080/healthz
docker stop blog-site-test
```

Expected output:
```
200
ok
```

- [ ] **Step 6: Commit**

```bash
git add Dockerfile .dockerignore nginx.conf
git commit -m "feat(blog-site): add multi-stage Dockerfile + nginx config

node:20-alpine builds, nginx:alpine serves. Cloudflared terminates
TLS upstream so nginx speaks plain HTTP on 80. Aggressive caching
for hashed assets, no-cache for HTML, and a /healthz endpoint for
the manifests in kp-k8s-dev.

CI (GitHub Actions to build and push to Docker Hub at cjoga/blog-site)
is deferred per spec section 7 — Camilo will share existing build/push
commands and we'll evaluate GH Actions feasibility next."
```

---

## Task 14: Final verification — full build and link check

**Why:** A clean Phase 0 means the whole site builds with `onBrokenLinks: throw`, every skeleton page is reachable through the sidebars, and the landing routes all resolve. This catches anything missed in Tasks 5–11.

**Files:** none (verification only)

- [ ] **Step 1: Clean any cached state and rebuild from scratch**

```bash
rm -rf .docusaurus build node_modules/.cache
npm run build 2>&1 | tail -30
```

Expected: build completes with `[SUCCESS]` and no broken-link errors.

- [ ] **Step 2: Verify every expected route is in the build output**

```bash
ls build/me build/engineering build/engineering/lab build/engineering/work build/learn 2>&1 | head -40
```

Expected (each listing shows `index.html` plus subdirectories for child pages):
```
build/me:
credentials
index.html
now
opinions
reading-and-tools
who-i-am

build/engineering:
index.html
lab
work

build/engineering/lab:
index.html
overview
tips-and-gotchas

build/engineering/work:
arctiq
fl-betances
index.html
inspyr-global-solutions
kodepull

build/learn:
index.html
rhcsa
```

- [ ] **Step 3: Verify the landing renders the three reader paths**

```bash
grep -oE "If you're (hiring|studying|curious about the lab)" build/index.html | sort -u
```

Expected output:
```
If you're curious about the lab
If you're hiring
If you're studying
```

- [ ] **Step 4: Verify the sitemap is generated and lists the new routes**

```bash
test -f build/sitemap.xml && grep -oE "<loc>[^<]+</loc>" build/sitemap.xml | head -20
```

Expected: `sitemap.xml` exists; the listed `<loc>` entries include `/me`, `/me/who-i-am`, `/engineering`, `/engineering/lab/overview`, `/engineering/work/*`, `/learn`, `/learn/rhcsa`, etc. If the file is missing, the classic preset's `sitemap` option is overridden somewhere — re-enable it explicitly in `docusaurus.config.js` under `presets[0][1].sitemap` and rebuild.

- [ ] **Step 5: Confirm git status is clean (everything committed across tasks 1–13)**

```bash
git status --short
```

Expected: no changes related to `blog-site/`. If files appear, commit them with a brief follow-up message before declaring Phase 0 done.

- [ ] **Step 6: Tag the Phase 0 completion in the commit history**

```bash
git log --oneline -15
```

Expected: a clean run of `chore(blog-site)` and `feat(blog-site)` commits from Tasks 1–13, in order, on top of the spec commit (`069af0d`).

**Phase 0 is done.** The handbook builds, deploys (once the image is pushed), and every skeleton page is reachable through the new sidebars. Phase 1+ starts in a separate session: one page per session, real content via interview, one commit per page.
