# CV & Experience Refresh — Design

**Date:** 2026-05-19
**Status:** Approved (pending spec review)

## Goal

Bring the portfolio's Experience section, Projects section, professional
summary, and the CV-PDF in line with the detailed, accurate engagement
narratives in the `blog-site/` handbook. Keep all public-facing copy
**concise** — the blog is where depth lives; the site and CV give the
brief version and let the reader go deeper.

All copy is bilingual: every change lands in both
`public/locales/en/translation.json` and
`public/locales/es/translation.json`.

## Constraints

- **No end-client names** in any public content — "a banking
  institution", "a retailer", never the customer. Only employers are
  named.
- Concise: 4–5 tight bullets per role; one or two sentences per project.
- The site Experience section and the CV-PDF read the **same**
  `experience.*` translation keys — one edit updates both.
- The CV summary reads `hero.description`; the CV Key Projects read
  `projects.cicd`, `projects.iac`, `projects.monitoring` — no CV
  component change is needed for those, they refresh automatically.

## Files touched

- `public/locales/en/translation.json`
- `public/locales/es/translation.json`
- `src/components/Experience.jsx` — add `kodepull` to `companyKeys`
  and `COMPANY_META`
- `src/components/Projects.jsx` — refresh per-card icons/colors to
  match new tech (exact `react-icons` imports decided in implementation)
- `src/components/ProfessionalPDFCV.jsx` — add a 4th job block for
  `kodepull`, ordered `inspyr → kodepull → flBetances → arctiq`
- `blog-site/docs/engineering/work/kodepull.mdx` — trim to role,
  daily operations, and company background

No `npm run brand:og` re-run: no doc is added or renamed (the
`kodepull` slug is unchanged), so its OG card stays valid.

---

## 1. Experience — 4 roles, reverse-chronological by start date

Order: **INSPYR (Mar 2025) → KODEPULL (2025) → FL Betances (Jun 2024) →
Arctiq (Jul 2022)**.

`Experience.jsx`:
- `companyKeys = ["inspyr", "kodepull", "flBetances", "arctiq"]`
- `COMPANY_META.kodepull = { initial: "K", color: "#7c3aed" }`

`ProfessionalPDFCV.jsx`: add a `kodepull` job block in the same order.

### INSPYR Global Solutions

- **title** `DevOps Engineer` / `Ingeniero DevOps`
- **company** `INSPYR Global Solutions` (both)
- **period** `March 2025 - Present` / `Marzo 2025 - Presente`

**responsibilities (EN):**
1. Operate a multi-region Azure platform of 300+ services on AKS, with releases driven by Azure DevOps pipelines and PowerShell.
2. Led consolidation of every alert and dashboard into a single alerts-as-code repository and GitOps release pipeline spanning all environments and regions.
3. Maintain and extend the Bicep infrastructure platform, shipping new services through what-if and release pipelines.
4. Enabled managed data infrastructure for developer teams — Azure Synapse and Databricks with Unity Catalog governance, deployed entirely as code.
5. Drive an in-flight migration of AKS clusters onto Cilium and replace manual incident remediation with self-healing automation.

**responsibilities (ES):**
1. Operar una plataforma Azure multi-región de más de 300 servicios sobre AKS, con despliegues gestionados por pipelines de Azure DevOps y PowerShell.
2. Lideré la consolidación de todas las alertas y dashboards en un único repositorio de alertas como código y un pipeline de despliegue GitOps que abarca todos los entornos y regiones.
3. Mantener y extender la plataforma de infraestructura en Bicep, desplegando nuevos servicios mediante pipelines de what-if y de release.
4. Habilité infraestructura de datos gestionada para equipos de desarrollo — Azure Synapse y Databricks con gobernanza vía Unity Catalog, desplegados íntegramente como código.
5. Impulsar una migración en curso de clusters de AKS hacia Cilium y reemplazar la remediación manual de incidentes con automatización de auto-recuperación.

### KODEPULL SRL (new entry)

- **title** `Co-founder & CTO` / `Cofundador y CTO`
- **company** `KODEPULL SRL` (both)
- **period** `2025 - Present` / `2025 - Presente`

**responsibilities (EN):**
1. Co-founded the company in 2025 — it delivers enterprise-grade engineering to businesses without enterprise budgets.
2. Own the entire technical side as CTO: architecture, infrastructure design, platform and vendor decisions, and the quality bar every project ships under.
3. Lead hands-on engineering and technical delivery across web, custom software, cloud, and mobile work.
4. Scale specialist engineers, designers, and partners onto each engagement based on what the work actually needs.
5. Partner with the CEO on technical strategy, keeping delivery mapped to real business outcomes.

**responsibilities (ES):**
1. Cofundé la empresa en 2025 — ofrece ingeniería de nivel empresarial a negocios sin presupuesto de gran empresa.
2. Dirijo todo el lado técnico como CTO: arquitectura, diseño de infraestructura, decisiones de plataforma y proveedores, y el estándar de calidad con el que se entrega cada proyecto.
3. Liderar la ingeniería práctica y la entrega técnica en proyectos de web, software a medida, nube y móvil.
4. Incorporar ingenieros, diseñadores y socios especialistas a cada proyecto según lo que el trabajo realmente requiere.
5. Colaborar con el CEO en la estrategia técnica, manteniendo la entrega alineada con resultados de negocio reales.

### FL Betances & Asociados

- **title** `DevOps Engineer` / `Ingeniero DevOps`
  *(corrected from "DevOps Intermediate Engineer" / "Ingeniero DevOps Intermedio")*
- **company** `FL Betances & Asociados` (both)
- **period** `June 2024 - December 2025` / `Junio 2024 - Diciembre 2025`

**responsibilities (EN):**
1. Embedded in a banking institution's core DevOps team, supporting 50+ engineering teams and a continuous automation backlog.
2. Maintained and extended an in-house deployment framework on Azure DevOps — YAML templates that detect project type, target environment, and required policy checks.
3. Ran nightly deployment operations across all teams, tracing failed deploys through ArgoCD and AKS to the policy or template at fault.
4. Built Power Automate flows for the approval, notification, and ticket-lifecycle processes around DevOps work.
5. Led an internal Terraform module library that let teams self-provision cloud resources within bank policy; handed off near-complete at contract end.

**responsibilities (ES):**
1. Integrado en el equipo central de DevOps de una institución bancaria, dando soporte a más de 50 equipos de ingeniería y a un backlog continuo de automatización.
2. Mantuve y extendí un framework de despliegue interno sobre Azure DevOps — plantillas YAML que detectan el tipo de proyecto, el entorno destino y las verificaciones de política requeridas.
3. Operé los despliegues nocturnos de todos los equipos, rastreando los despliegues fallidos a través de ArgoCD y AKS hasta la política o plantilla causante.
4. Construí flujos en Power Automate para los procesos de aprobación, notificación y ciclo de vida de tickets en torno al trabajo de DevOps.
5. Lideré una librería interna de módulos de Terraform que permitió a los equipos autoaprovisionar recursos en la nube dentro de la política del banco; entregada casi completa al finalizar el contrato.

### Arctiq

- **title** `DevOps Consultant` / `Consultor DevOps`
- **company** `Arctiq` (both)
- **period** `July 2022 - Present` / `Julio 2022 - Presente`

**responsibilities (EN):**
1. Designed and led the migration of 60+ applications from a hand-built Rancher setup to a managed AWS EKS platform — FluxCD, GitLab CI, and Terraform.
2. Consolidated branch-per-team sprawl into per-team namespaces, cutting 5–8× of redundant deployed surface.
3. Rolled out SSO-based access with AWS Identity Center and Entra ID, retiring IAM users in favor of assumed roles and OIDC for pipelines.
4. Built observability from zero — OpenTelemetry instrumentation with Grafana, Loki, and distributed traces across every application.
5. Led Terraform workshops moving dev teams to self-service infrastructure; promoted to local team mentor.

**responsibilities (ES):**
1. Diseñé y lideré la migración de más de 60 aplicaciones desde una instalación de Rancher hecha a mano hacia una plataforma gestionada de AWS EKS — FluxCD, GitLab CI y Terraform.
2. Consolidé la dispersión de "una rama por equipo" en namespaces por equipo, recortando entre 5 y 8 veces la superficie desplegada redundante.
3. Implementé el acceso basado en SSO con AWS Identity Center y Entra ID, retirando los usuarios IAM en favor de roles asumidos y OIDC para los pipelines.
4. Construí observabilidad desde cero — instrumentación con OpenTelemetry y Grafana, Loki y trazas distribuidas en cada aplicación.
5. Impartí talleres de Terraform para llevar a los equipos de desarrollo a la infraestructura autogestionada; ascendido a mentor del equipo local.

---

## 2. Professional summary

`hero.description` — drives the hero section **and** the CV's
PROFESSIONAL SUMMARY block.

**EN:** I'm a DevOps & Cloud Engineer who builds and runs Kubernetes
platforms on AWS and Azure. My work centers on Infrastructure as Code,
GitOps delivery, and observability — turning sprawling,
manually-managed environments into automated, self-service platforms
teams can run themselves.

**ES:** Soy Ingeniero DevOps y Cloud que construye y opera plataformas
de Kubernetes sobre AWS y Azure. Mi trabajo se centra en la
Infraestructura como Código, la entrega GitOps y la observabilidad —
convirtiendo entornos dispersos y gestionados a mano en plataformas
automatizadas y autogestionadas que los equipos pueden operar por sí
mismos.

### About paragraphs (site only)

`about.paragraph1` **EN:** Hello! I'm Jose Camilo (please call me
Camilo), a Computer Science Engineer drawn to DevOps and cloud since
the start of my career. I build efficient, scalable, automated
infrastructure — and I care about the platform being something teams
can actually run themselves.

`about.paragraph1` **ES:** ¡Hola! Soy Jose Camilo (llámame Camilo),
Ingeniero en Ciencias de la Computación atraído por DevOps y la nube
desde el inicio de mi carrera. Construyo infraestructura eficiente,
escalable y automatizada — y me importa que la plataforma sea algo que
los propios equipos puedan operar.

`about.paragraph2` **EN:** I've taken environments from
manually-managed servers and console-clicked clusters to managed
Kubernetes platforms on AWS and Azure, with GitOps delivery,
Infrastructure as Code, and observability built in. The part I enjoy
most is the consolidation work — collapsing sprawl into something
simple and self-service.

`about.paragraph2` **ES:** He llevado entornos desde servidores
gestionados a mano y clusters configurados clic a clic hasta
plataformas de Kubernetes gestionadas sobre AWS y Azure, con entrega
GitOps, Infraestructura como Código y observabilidad integradas. Lo que
más disfruto es el trabajo de consolidación — reducir la dispersión a
algo simple y autogestionado.

---

## 3. Projects — refresh all 6 cards

The 6 `projects.*` keys keep their slugs (`cicd`, `iac`, `monitoring`,
`infrastructure`, `portal`, `containerization`) so neither component
needs key changes — only content and, in `Projects.jsx`, the per-card
`color`/`accent`/`icons`. The CV's Key Projects section automatically
shows `cicd`, `iac`, `monitoring`.

### `cicd` — EKS Platform Migration

- **tech:** `["AWS EKS", "FluxCD", "GitLab CI", "Terraform"]`
- **title EN:** EKS Platform Migration — **ES:** Migración de Plataforma a EKS
- **desc EN:** Designed and led the migration of 60+ applications from a hand-built Rancher setup to a managed AWS EKS platform, with FluxCD for GitOps delivery and Terraform for the cloud underneath.
- **desc ES:** Diseñé y lideré la migración de más de 60 aplicaciones desde una instalación de Rancher hecha a mano hacia una plataforma gestionada de AWS EKS, con FluxCD para la entrega GitOps y Terraform para la nube subyacente.

### `iac` — Multi-Cloud Infrastructure as Code

- **tech:** `["Terraform", "Bicep", "AWS", "Azure"]`
- **title EN:** Multi-Cloud Infrastructure as Code — **ES:** Infraestructura como Código Multi-Nube
- **desc EN:** Modular Terraform and Bicep platforms for AWS and Azure — networking, compute, storage, and security — with a plan or what-if check running on every change.
- **desc ES:** Plataformas modulares de Terraform y Bicep para AWS y Azure — redes, cómputo, almacenamiento y seguridad — con una verificación de plan o what-if que se ejecuta en cada cambio.

### `monitoring` — Observability from Zero

- **tech:** `["OpenTelemetry", "Grafana", "Loki", "Prometheus"]`
- **title EN:** Observability from Zero — **ES:** Observabilidad desde Cero
- **desc EN:** Built observability for a platform that started with none — OpenTelemetry instrumentation feeding Grafana, Loki, and distributed traces, with dashboards and alerts on every application.
- **desc ES:** Construí la observabilidad de una plataforma que partía de nada — instrumentación con OpenTelemetry alimentando Grafana, Loki y trazas distribuidas, con dashboards y alertas en cada aplicación.

### `infrastructure` — Alerts-as-Code Pipeline

- **tech:** `["Azure", "Azure DevOps", "Grafana", "GitOps"]`
- **title EN:** Alerts-as-Code Pipeline — **ES:** Pipeline de Alertas como Código
- **desc EN:** Consolidated every alert and dashboard into a single repository and a GitOps release pipeline that deploys and reconciles them across all environments, regions, and severities.
- **desc ES:** Consolidé todas las alertas y dashboards en un único repositorio y un pipeline de despliegue GitOps que las despliega y reconcilia en todos los entornos, regiones y niveles de severidad.

### `portal` — Self-Service Infrastructure Portal

- **tech:** `["Vue.js", ".NET", "ArgoCD", "AKS"]`
- **title EN:** Self-Service Infrastructure Portal — **ES:** Portal de Infraestructura Autogestionada
- **desc EN:** A Vue.js and .NET portal that lets developers self-provision repositories, manage permissions, and request infrastructure through approved templates and guardrails instead of tickets.
- **desc ES:** Un portal en Vue.js y .NET que permite a los desarrolladores autoaprovisionar repositorios, gestionar permisos y solicitar infraestructura mediante plantillas y guardarraíles aprobados en lugar de tickets.

### `containerization` — Distributed Kubernetes Homelab

- **tech:** `["K3s", "Longhorn", "OpenBao", "Envoy"]`
- **title EN:** Distributed Kubernetes Homelab — **ES:** Homelab Distribuido de Kubernetes
- **desc EN:** A multi-node K3s cluster on personal hardware running GitOps delivery, observability, and secrets management behind an Envoy Gateway and Cloudflare Tunnel — it hosts this very site.
- **desc ES:** Un cluster K3s multi-nodo sobre hardware propio que ejecuta entrega GitOps, observabilidad y gestión de secretos detrás de un Envoy Gateway y un Cloudflare Tunnel — aloja este mismo sitio.

### `Projects.jsx` visual identity

Per card, the `color`/`accent`/`icons` are updated to match the new
tech. Suggested mapping (final `react-icons` imports verified during
implementation; fall back to a related icon if a specific one is
absent):

| key | color | icons (primary, side, side) |
|---|---|---|
| `cicd` | `#ff9900` (AWS) | `FaAws`, `SiKubernetes`, `SiGitlab` |
| `iac` | `#7f4dff` (unchanged) | `SiTerraform`, `FaAws`, `FaMicrosoft` |
| `monitoring` | `#f46800` (Grafana) | `SiOpentelemetry`, `SiGrafana`, `SiPrometheus` |
| `infrastructure` | `#0078d4` (Azure) | `SiMicrosoftazure`/`FaMicrosoft`, `SiGrafana`, `SiArgo` |
| `portal` | `#41b883` (unchanged) | `FaVuejs`, `SiDotnet`, `SiArgo` |
| `containerization` | `#ffc61c` (K3s) | `SiKubernetes`, `SiCloudflare`, `FaServer` |

---

## 4. Blog — trim `kodepull.mdx`

`blog-site/docs/engineering/work/kodepull.mdx` is reduced to Camilo's
participation, daily operations, and company background:

- **Keep:** frontmatter, the `# KODEPULL SRL` header, the role/company
  metadata block, **What we build** (company background), **My role**
  (participation + daily operations), the `TechStackGrid`, and
  `AuthorCard`.
- **Remove:** the entire **## Selected work** section and its three
  case-study subsections (UnicoWraps, Tutorias Universitarias, Bank
  DevOps Portal).

Frontmatter slug is unchanged, so the existing OG card remains valid.

---

## Verification

- `npm run lint` passes.
- `npm run build` succeeds (no missing `react-icons` imports).
- `cd blog-site && npm run build` succeeds (kodepull.mdx still valid MDX).
- Both EN and ES `translation.json` remain valid JSON with matching
  key structure (4 experience entries each, 6 project entries each).
- Manual check: Experience section renders 4 cards in order; the CV-PDF
  download renders 4 job blocks and 3 refreshed Key Projects.

## Out of scope

- No new doc pages; no `brand:og` run.
- KODEPULL client project case studies are not surfaced on the site or
  CV (per the "role only" decision).
- Skills, certifications, and contact sections unchanged.
