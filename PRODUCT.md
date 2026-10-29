# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: hiring managers and engineering leaders filling **Senior or Lead Platform/DevOps** roles, especially teams moving platform work toward AI automation and agentic workflows. They arrive from a CV, LinkedIn or a referral, usually with several candidates open in tabs. They give the page a short first look to decide whether this person operates at enterprise grade, then return to check specifics before an interview.

Secondary audiences (served, not designed for): engineers studying for the same certifications, and peers curious about the homelab. The handbook at blog.cjoga.cloud serves them in depth.

## Product Purpose

cjoga.cloud is José Camilo Joga Guerrero's professional portfolio. It has to convince a hiring manager that Camilo is a senior platform engineer who knows what he is doing: professional and enterprise-grade, without bragging. Success means the visitor downloads the CV (the primary action) and makes contact.

Availability: open to roles that fit the Senior/Lead Platform/DevOps + AI automation direction. Remote is preferred; he is open to relocating.

## Positioning

The site is itself the proof. It runs on a multi-node K3s cluster he built and operates (GitOps, observability, OpenBao secrets, Envoy Gateway, Cloudflare Tunnel), and visitors can inspect that cluster live through a read-only terminal. His enterprise work pairs platform scale (300+ services on multi-region AKS; 60+ applications migrated from Rancher to EKS) with agentic automation already in production: Claude agents embedded in CI/CD, and MCP servers exposing internal tooling.

## Operating Context

- Visitors compare candidates quickly, on desktop at work or on a phone between meetings.
- The print/PDF CV (`@react-pdf/renderer`, `src/styles/print.css`) is a real artifact recruiters forward.
- The site is bilingual: English at `/`, Spanish at `/es`.
- The portfolio links to the handbook (blog.cjoga.cloud) for depth: lab write-ups, opinions, cert guides, and work-engagement pages.

## Capabilities and Constraints

- Stack: React 18 + Vite + Tailwind + Framer Motion SPA, Express server for the terminal API (`server/`), i18next (en/es), prerender script, Docker image deployed to his own cluster.
- The live terminal depends on `/api` being reachable. The UI must stay credible when it isn't.
- The light and dark themes both exist and follow the system setting.
- Brand tokens are synced between the portfolio and the handbook (`npm run tokens:sync`, `tokens:check`, `contrast:check`).

## Brand Commitments

- Writing follows `STYLE.md`: declarative, active and concrete, with no filler, cliché framing ("explore", "dive in") or hedges.
- Never name end clients. Employers can be named: Arctiq, INSPYR Global Solutions, FL Betances & Asociados, KODEPULL.
- Vendor visuals use the real product's logo, CLI output or dashboard, never abstract metaphors.
- Red Hat's official courses are always presented as complements to the lab, never dismissed.
- Name: José Camilo Joga Guerrero, who goes by "Camilo".
- **Owner's direction (2026-10-28):** he likes the current look, including its Brittany Chiang v4 lineage in the first viewport. The goal is to *enhance* it with his own touch, not replace it: keep the overall style, the animations, the space / astronaut / astral theme and the cinematic, sleek feel. Kubestronaut is something he is pursuing right now, not his identity. Don't make it the site's thread or put it in the hero. The hero background should be impactful but subtle: graphics and motion only, with no information in it. Influences come from renowned space-themed sites that he ranks. A full replacement (the "Launch webcast" attempt, stashed as `stash@{0}`) was rejected.

## Evidence on Hand

- Live K3s cluster hosting the site, plus the read-only terminal (`src/components/Terminal/`, `server/routes/terminal.js`).
- 12 certifications, among them CKA, CKAD, KCNA (Kubestronaut path), AWS SA, Terraform Associate, RHCSA, RHCE, Dynatrace and GitLab. The vendor-idiom live tiles are in `src/components/certifications/liveTiles/`.
- Experience with real numbers is in `public/locales/*/translation.json`: INSPYR (300+ services, alerts-as-code, Claude agents in CI/CD), Arctiq (60+ apps to EKS, 5–8× less redundant surface, observability from zero, SOC2 gating), FL Betances (50+ teams), and KodePull (co-founder & CTO).
- Projects: the open-source Kubestronaut exam simulator, plus platform work written up in the handbook.
- Photo: `public/images/camilo.webp`.
- CV PDF: `src/components/ProfessionalPDFCV.jsx`.
- **Absent, do not fabricate:** testimonials, employer logos used as endorsements, uptime figures, traffic numbers, and any metric not already in the copy.

## Product Principles

1. **Prove, don't claim.** A working artifact (the cluster, a tile, a number from a real role) beats an adjective.
2. **Confident, not loud.** Enterprise composure: the work carries the weight, and the page never performs.
3. **A hiring manager's minute.** Role, level, proof and the CV must be legible in the first look; depth is for the second visit.
4. **One product.** Portfolio, terminal, tiles and CV share one voice and one system.
5. **Credible in failure.** Live features degrade into calm, useful states, never into an alarm on the front page.

## Accessibility & Inclusion

WCAG 2.2 AA in both themes and both languages, reduced motion respected, full keyboard and screen-reader paths (the existing skip link, focus handling and `inert` drawer are the floor).
