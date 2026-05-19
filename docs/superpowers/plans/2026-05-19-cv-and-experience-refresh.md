# CV & Experience Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the portfolio's Experience section, Projects section, professional summary, and CV-PDF with the accurate engagement narratives in `blog-site/`, in both English and Spanish.

**Architecture:** Most content lives in i18n JSON (`public/locales/{en,es}/translation.json`) shared by React components and the PDF CV. Three components need structural edits: `Experience.jsx` and `ProfessionalPDFCV.jsx` gain a fourth role (KODEPULL); `Projects.jsx` gets refreshed per-card icons/colors. One blog doc (`kodepull.mdx`) is trimmed.

**Tech Stack:** React 18 + Vite, react-i18next, `@react-pdf/renderer`, react-icons, Docusaurus 3 (blog).

**Spec:** `docs/superpowers/specs/2026-05-19-cv-and-experience-refresh-design.md`

**Note on TDD:** This codebase has no unit-test runner. Verification per task is JSON validity (`node -e`), `npm run lint`, and production builds. Tasks follow: edit → verify → commit.

---

## File Structure

- `public/locales/en/translation.json` — English copy (Task 1)
- `public/locales/es/translation.json` — Spanish copy (Task 2)
- `src/components/Experience.jsx` — add `kodepull` role (Task 3)
- `src/components/ProfessionalPDFCV.jsx` — add `kodepull` job block (Task 4)
- `src/components/Projects.jsx` — refresh icons/colors (Task 5)
- `blog-site/docs/engineering/work/kodepull.mdx` — trim to role + background (Task 6)
- Final full-build verification (Task 7)

---

## Task 1: English translation.json

**Files:**
- Modify: `public/locales/en/translation.json`

- [ ] **Step 1: Replace the entire `experience` object**

Replace the whole `"experience": { ... }` object with:

```json
"experience": {
  "title": "Experience",
  "heading": "Where I've worked.",
  "active": "Active",
  "past": "Past",
  "inspyr": {
    "title": "DevOps Engineer",
    "company": "INSPYR Global Solutions",
    "period": "March 2025 - Present",
    "responsibilities": [
      "Operate a multi-region Azure platform of 300+ services on AKS, with releases driven by Azure DevOps pipelines and PowerShell",
      "Led consolidation of every alert and dashboard into a single alerts-as-code repository and GitOps release pipeline spanning all environments and regions",
      "Maintain and extend the Bicep infrastructure platform, shipping new services through what-if and release pipelines",
      "Enabled managed data infrastructure for developer teams — Azure Synapse and Databricks with Unity Catalog governance, deployed entirely as code",
      "Drive an in-flight migration of AKS clusters onto Cilium and replace manual incident remediation with self-healing automation"
    ]
  },
  "kodepull": {
    "title": "Co-founder & CTO",
    "company": "KODEPULL SRL",
    "period": "2025 - Present",
    "responsibilities": [
      "Co-founded the company in 2025 — it delivers enterprise-grade engineering to businesses without enterprise budgets",
      "Own the entire technical side as CTO: architecture, infrastructure design, platform and vendor decisions, and the quality bar every project ships under",
      "Lead hands-on engineering and technical delivery across web, custom software, cloud, and mobile work",
      "Scale specialist engineers, designers, and partners onto each engagement based on what the work actually needs",
      "Partner with the CEO on technical strategy, keeping delivery mapped to real business outcomes"
    ]
  },
  "flBetances": {
    "title": "DevOps Engineer",
    "company": "FL Betances & Asociados",
    "period": "June 2024 - December 2025",
    "responsibilities": [
      "Embedded in a banking institution's core DevOps team, supporting 50+ engineering teams and a continuous automation backlog",
      "Maintained and extended an in-house deployment framework on Azure DevOps — YAML templates that detect project type, target environment, and required policy checks",
      "Ran nightly deployment operations across all teams, tracing failed deploys through ArgoCD and AKS to the policy or template at fault",
      "Built Power Automate flows for the approval, notification, and ticket-lifecycle processes around DevOps work",
      "Led an internal Terraform module library that let teams self-provision cloud resources within bank policy; handed off near-complete at contract end"
    ]
  },
  "arctiq": {
    "title": "DevOps Consultant",
    "company": "Arctiq",
    "period": "July 2022 - Present",
    "responsibilities": [
      "Designed and led the migration of 60+ applications from a hand-built Rancher setup to a managed AWS EKS platform — FluxCD, GitLab CI, and Terraform",
      "Consolidated branch-per-team sprawl into per-team namespaces, cutting 5–8× of redundant deployed surface",
      "Rolled out SSO-based access with AWS Identity Center and Entra ID, retiring IAM users in favor of assumed roles and OIDC for pipelines",
      "Built observability from zero — OpenTelemetry instrumentation with Grafana, Loki, and distributed traces across every application",
      "Led Terraform workshops moving dev teams to self-service infrastructure; promoted to local team mentor"
    ]
  }
}
```

- [ ] **Step 2: Replace `hero.description`**

Inside the `hero` object, set `description` to:

```
I'm a DevOps & Cloud Engineer who builds and runs Kubernetes platforms on AWS and Azure. My work centers on Infrastructure as Code, GitOps delivery, and observability — turning sprawling, manually-managed environments into automated, self-service platforms teams can run themselves.
```

- [ ] **Step 3: Replace `about.paragraph1` and `about.paragraph2`**

Inside the `about` object, set:

```
"paragraph1": "Hello! I'm Jose Camilo (please call me Camilo), a Computer Science Engineer drawn to DevOps and cloud since the start of my career. I build efficient, scalable, automated infrastructure — and I care about the platform being something teams can actually run themselves.",
"paragraph2": "I've taken environments from manually-managed servers and console-clicked clusters to managed Kubernetes platforms on AWS and Azure, with GitOps delivery, Infrastructure as Code, and observability built in. The part I enjoy most is the consolidation work — collapsing sprawl into something simple and self-service."
```

- [ ] **Step 4: Replace the entire `projects` object**

Replace the whole `"projects": { ... }` object with:

```json
"projects": {
  "title": "Projects",
  "heading": "Things I've built.",
  "cicd": {
    "title": "EKS Platform Migration",
    "description": "Designed and led the migration of 60+ applications from a hand-built Rancher setup to a managed AWS EKS platform, with FluxCD for GitOps delivery and Terraform for the cloud underneath.",
    "tech": ["AWS EKS", "FluxCD", "GitLab CI", "Terraform"]
  },
  "iac": {
    "title": "Multi-Cloud Infrastructure as Code",
    "description": "Modular Terraform and Bicep platforms for AWS and Azure — networking, compute, storage, and security — with a plan or what-if check running on every change.",
    "tech": ["Terraform", "Bicep", "AWS", "Azure"]
  },
  "monitoring": {
    "title": "Observability from Zero",
    "description": "Built observability for a platform that started with none — OpenTelemetry instrumentation feeding Grafana, Loki, and distributed traces, with dashboards and alerts on every application.",
    "tech": ["OpenTelemetry", "Grafana", "Loki", "Prometheus"]
  },
  "infrastructure": {
    "title": "Alerts-as-Code Pipeline",
    "description": "Consolidated every alert and dashboard into a single repository and a GitOps release pipeline that deploys and reconciles them across all environments, regions, and severities.",
    "tech": ["Azure", "Azure DevOps", "Grafana", "GitOps"]
  },
  "portal": {
    "title": "Self-Service Infrastructure Portal",
    "description": "A Vue.js and .NET portal that lets developers self-provision repositories, manage permissions, and request infrastructure through approved templates and guardrails instead of tickets.",
    "tech": ["Vue.js", ".NET", "ArgoCD", "AKS"]
  },
  "containerization": {
    "title": "Distributed Kubernetes Homelab",
    "description": "A multi-node K3s cluster on personal hardware running GitOps delivery, observability, and secrets management behind an Envoy Gateway and Cloudflare Tunnel — it hosts this very site.",
    "tech": ["K3s", "Longhorn", "OpenBao", "Envoy"]
  }
}
```

- [ ] **Step 5: Verify JSON is valid**

Run: `node -e "JSON.parse(require('fs').readFileSync('public/locales/en/translation.json','utf8')); console.log('valid')"`
Expected: prints `valid`

- [ ] **Step 6: Commit**

```bash
git add public/locales/en/translation.json
git commit -m "feat(i18n): refresh English experience, summary, and projects copy"
```

---

## Task 2: Spanish translation.json

**Files:**
- Modify: `public/locales/es/translation.json`

- [ ] **Step 1: Replace the entire `experience` object**

Replace the whole `"experience": { ... }` object with:

```json
"experience": {
  "title": "Experiencia",
  "heading": "Dónde he trabajado.",
  "active": "Activo",
  "past": "Pasado",
  "inspyr": {
    "title": "Ingeniero DevOps",
    "company": "INSPYR Global Solutions",
    "period": "Marzo 2025 - Presente",
    "responsibilities": [
      "Operar una plataforma Azure multi-región de más de 300 servicios sobre AKS, con despliegues gestionados por pipelines de Azure DevOps y PowerShell",
      "Lideré la consolidación de todas las alertas y dashboards en un único repositorio de alertas como código y un pipeline de despliegue GitOps que abarca todos los entornos y regiones",
      "Mantener y extender la plataforma de infraestructura en Bicep, desplegando nuevos servicios mediante pipelines de what-if y de release",
      "Habilité infraestructura de datos gestionada para equipos de desarrollo — Azure Synapse y Databricks con gobernanza vía Unity Catalog, desplegados íntegramente como código",
      "Impulsar una migración en curso de clusters de AKS hacia Cilium y reemplazar la remediación manual de incidentes con automatización de auto-recuperación"
    ]
  },
  "kodepull": {
    "title": "Cofundador y CTO",
    "company": "KODEPULL SRL",
    "period": "2025 - Presente",
    "responsibilities": [
      "Cofundé la empresa en 2025 — ofrece ingeniería de nivel empresarial a negocios sin presupuesto de gran empresa",
      "Dirijo todo el lado técnico como CTO: arquitectura, diseño de infraestructura, decisiones de plataforma y proveedores, y el estándar de calidad con el que se entrega cada proyecto",
      "Liderar la ingeniería práctica y la entrega técnica en proyectos de web, software a medida, nube y móvil",
      "Incorporar ingenieros, diseñadores y socios especialistas a cada proyecto según lo que el trabajo realmente requiere",
      "Colaborar con el CEO en la estrategia técnica, manteniendo la entrega alineada con resultados de negocio reales"
    ]
  },
  "flBetances": {
    "title": "Ingeniero DevOps",
    "company": "FL Betances & Asociados",
    "period": "Junio 2024 - Diciembre 2025",
    "responsibilities": [
      "Integrado en el equipo central de DevOps de una institución bancaria, dando soporte a más de 50 equipos de ingeniería y a un backlog continuo de automatización",
      "Mantuve y extendí un framework de despliegue interno sobre Azure DevOps — plantillas YAML que detectan el tipo de proyecto, el entorno destino y las verificaciones de política requeridas",
      "Operé los despliegues nocturnos de todos los equipos, rastreando los despliegues fallidos a través de ArgoCD y AKS hasta la política o plantilla causante",
      "Construí flujos en Power Automate para los procesos de aprobación, notificación y ciclo de vida de tickets en torno al trabajo de DevOps",
      "Lideré una librería interna de módulos de Terraform que permitió a los equipos autoaprovisionar recursos en la nube dentro de la política del banco; entregada casi completa al finalizar el contrato"
    ]
  },
  "arctiq": {
    "title": "Consultor DevOps",
    "company": "Arctiq",
    "period": "Julio 2022 - Presente",
    "responsibilities": [
      "Diseñé y lideré la migración de más de 60 aplicaciones desde una instalación de Rancher hecha a mano hacia una plataforma gestionada de AWS EKS — FluxCD, GitLab CI y Terraform",
      "Consolidé la dispersión de \"una rama por equipo\" en namespaces por equipo, recortando entre 5 y 8 veces la superficie desplegada redundante",
      "Implementé el acceso basado en SSO con AWS Identity Center y Entra ID, retirando los usuarios IAM en favor de roles asumidos y OIDC para los pipelines",
      "Construí observabilidad desde cero — instrumentación con OpenTelemetry y Grafana, Loki y trazas distribuidas en cada aplicación",
      "Impartí talleres de Terraform para llevar a los equipos de desarrollo a la infraestructura autogestionada; ascendido a mentor del equipo local"
    ]
  }
}
```

- [ ] **Step 2: Replace `hero.description`**

Inside the `hero` object, set `description` to:

```
Soy Ingeniero DevOps y Cloud que construye y opera plataformas de Kubernetes sobre AWS y Azure. Mi trabajo se centra en la Infraestructura como Código, la entrega GitOps y la observabilidad — convirtiendo entornos dispersos y gestionados a mano en plataformas automatizadas y autogestionadas que los equipos pueden operar por sí mismos.
```

- [ ] **Step 3: Replace `about.paragraph1` and `about.paragraph2`**

Inside the `about` object, set:

```
"paragraph1": "¡Hola! Soy Jose Camilo (llámame Camilo), Ingeniero en Ciencias de la Computación atraído por DevOps y la nube desde el inicio de mi carrera. Construyo infraestructura eficiente, escalable y automatizada — y me importa que la plataforma sea algo que los propios equipos puedan operar.",
"paragraph2": "He llevado entornos desde servidores gestionados a mano y clusters configurados clic a clic hasta plataformas de Kubernetes gestionadas sobre AWS y Azure, con entrega GitOps, Infraestructura como Código y observabilidad integradas. Lo que más disfruto es el trabajo de consolidación — reducir la dispersión a algo simple y autogestionado."
```

- [ ] **Step 4: Replace the entire `projects` object**

Replace the whole `"projects": { ... }` object with:

```json
"projects": {
  "title": "Proyectos",
  "heading": "Cosas que he construido.",
  "cicd": {
    "title": "Migración de Plataforma a EKS",
    "description": "Diseñé y lideré la migración de más de 60 aplicaciones desde una instalación de Rancher hecha a mano hacia una plataforma gestionada de AWS EKS, con FluxCD para la entrega GitOps y Terraform para la nube subyacente.",
    "tech": ["AWS EKS", "FluxCD", "GitLab CI", "Terraform"]
  },
  "iac": {
    "title": "Infraestructura como Código Multi-Nube",
    "description": "Plataformas modulares de Terraform y Bicep para AWS y Azure — redes, cómputo, almacenamiento y seguridad — con una verificación de plan o what-if que se ejecuta en cada cambio.",
    "tech": ["Terraform", "Bicep", "AWS", "Azure"]
  },
  "monitoring": {
    "title": "Observabilidad desde Cero",
    "description": "Construí la observabilidad de una plataforma que partía de nada — instrumentación con OpenTelemetry alimentando Grafana, Loki y trazas distribuidas, con dashboards y alertas en cada aplicación.",
    "tech": ["OpenTelemetry", "Grafana", "Loki", "Prometheus"]
  },
  "infrastructure": {
    "title": "Pipeline de Alertas como Código",
    "description": "Consolidé todas las alertas y dashboards en un único repositorio y un pipeline de despliegue GitOps que las despliega y reconcilia en todos los entornos, regiones y niveles de severidad.",
    "tech": ["Azure", "Azure DevOps", "Grafana", "GitOps"]
  },
  "portal": {
    "title": "Portal de Infraestructura Autogestionada",
    "description": "Un portal en Vue.js y .NET que permite a los desarrolladores autoaprovisionar repositorios, gestionar permisos y solicitar infraestructura mediante plantillas y guardarraíles aprobados en lugar de tickets.",
    "tech": ["Vue.js", ".NET", "ArgoCD", "AKS"]
  },
  "containerization": {
    "title": "Homelab Distribuido de Kubernetes",
    "description": "Un cluster K3s multi-nodo sobre hardware propio que ejecuta entrega GitOps, observabilidad y gestión de secretos detrás de un Envoy Gateway y un Cloudflare Tunnel — aloja este mismo sitio.",
    "tech": ["K3s", "Longhorn", "OpenBao", "Envoy"]
  }
}
```

**Note:** Keep the existing Spanish values for `projects.title` and `projects.heading` if they already differ from the above — check the file first and preserve the current translations of those two label keys; only the six project objects' content must change.

- [ ] **Step 5: Verify JSON is valid**

Run: `node -e "JSON.parse(require('fs').readFileSync('public/locales/es/translation.json','utf8')); console.log('valid')"`
Expected: prints `valid`

- [ ] **Step 6: Commit**

```bash
git add public/locales/es/translation.json
git commit -m "feat(i18n): refresh Spanish experience, summary, and projects copy"
```

---

## Task 3: Experience.jsx — add KODEPULL role

**Files:**
- Modify: `src/components/Experience.jsx:13-17` (COMPANY_META)
- Modify: `src/components/Experience.jsx:30` (companyKeys)

- [ ] **Step 1: Add `kodepull` to `COMPANY_META`**

Replace the `COMPANY_META` constant:

```jsx
const COMPANY_META = {
  inspyr: { initial: "I", color: "#2563eb" },
  kodepull: { initial: "K", color: "#7c3aed" },
  flBetances: { initial: "F", color: "#d97706" },
  arctiq: { initial: "A", color: "#10b981" },
};
```

- [ ] **Step 2: Add `kodepull` to `companyKeys`**

Replace the `companyKeys` line inside the `Experience` function:

```jsx
  const companyKeys = ["inspyr", "kodepull", "flBetances", "arctiq"];
```

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/components/Experience.jsx
git commit -m "feat(portfolio): add KODEPULL role to experience timeline"
```

---

## Task 4: ProfessionalPDFCV.jsx — add KODEPULL job block

**Files:**
- Modify: `src/components/ProfessionalPDFCV.jsx` (insert between the `inspyr` job block and the `flBetances` job block — after the closing `</View>` of the inspyr `jobEntry`, around line 254)

- [ ] **Step 1: Insert the `kodepull` job block**

In the `PROFESSIONAL EXPERIENCE` section, the job blocks currently appear in the order `inspyr`, `flBetances`, `arctiq`. Insert a new `kodepull` block immediately **after** the `inspyr` `<View style={styles.jobEntry}>...</View>` and **before** the `flBetances` block, so the final order is `inspyr`, `kodepull`, `flBetances`, `arctiq`:

```jsx
          <View style={styles.jobEntry}>
            <Text style={styles.jobTitle}>
              {t("experience.kodepull.title")},{" "}
              {t("experience.kodepull.company")}
            </Text>
            <Text style={styles.jobPeriod}>
              {t("experience.kodepull.period")}
            </Text>
            <View style={styles.jobResponsibilities}>
              {t("experience.kodepull.responsibilities", {
                returnObjects: true,
              }).map((item, index) => (
                <Text key={index} style={styles.jobResponsibility}>
                  • {item}
                </Text>
              ))}
            </View>
          </View>
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/ProfessionalPDFCV.jsx
git commit -m "feat(portfolio): add KODEPULL job block to CV-PDF"
```

---

## Task 5: Projects.jsx — refresh icons and colors

**Files:**
- Modify: `src/components/Projects.jsx:3-15` (imports)
- Modify: `src/components/Projects.jsx:26-63` (projects array)

- [ ] **Step 1: Replace the icon imports**

Replace lines 3–15 (the two `react-icons` import statements) with:

```jsx
import { FaAws, FaMicrosoft, FaVuejs, FaServer } from "react-icons/fa";
import {
  SiGitlab,
  SiKubernetes,
  SiTerraform,
  SiGrafana,
  SiPrometheus,
  SiOpentelemetry,
  SiArgo,
  SiDotnet,
  SiCloudflare,
} from "react-icons/si";
```

- [ ] **Step 2: Replace the `projects` array**

Replace the `const projects = [ ... ];` array (lines 26–63) with:

```jsx
const projects = [
  {
    key: "cicd",
    color: "#ff9900",
    accent: "#ffc266",
    icons: [FaAws, SiGitlab, SiKubernetes],
  },
  {
    key: "iac",
    color: "#7f4dff",
    accent: "#b08aff",
    icons: [SiTerraform, FaAws, FaMicrosoft],
  },
  {
    key: "monitoring",
    color: "#f46800",
    accent: "#f99d5c",
    icons: [SiGrafana, SiOpentelemetry, SiPrometheus],
  },
  {
    key: "infrastructure",
    color: "#0078d4",
    accent: "#5fb0ec",
    icons: [FaMicrosoft, SiGrafana, SiArgo],
  },
  {
    key: "portal",
    color: "#41b883",
    accent: "#7ed4a6",
    icons: [FaVuejs, SiDotnet, SiArgo],
  },
  {
    key: "containerization",
    color: "#ffc61c",
    accent: "#ffdd73",
    icons: [SiKubernetes, SiCloudflare, FaServer],
  },
];
```

- [ ] **Step 3: Verify the icons resolve and lint passes**

Run: `npm run lint`
Expected: no errors (no unused imports, no undefined identifiers)

- [ ] **Step 4: Verify the build compiles (catches a missing react-icons export)**

Run: `npm run build`
Expected: build succeeds. If any `Si*` icon name is not exported by the installed `react-icons` version, the build fails with an export error — in that case substitute the closest available icon (e.g. `SiArgo` → `SiArgocd` if the package renamed it; `SiOpentelemetry` → `SiOpentelemetry`/`SiOpenTelemetry`) and re-run.

- [ ] **Step 5: Commit**

```bash
git add src/components/Projects.jsx
git commit -m "feat(portfolio): refresh project card icons and colors"
```

---

## Task 6: Trim kodepull.mdx blog doc

**Files:**
- Modify: `blog-site/docs/engineering/work/kodepull.mdx`

- [ ] **Step 1: Remove the "Selected work" section**

Delete the entire `## Selected work` section — from the line `## Selected work` through the end of the `### Bank DevOps Portal` subsection — so that the `## My role` section (with its `TechStackGrid`) is immediately followed by the `import AuthorCard` line. The file's final lines must read:

```mdx
<TechStackGrid
  caption="Tech we ship with"
  items={[
    'Next.js',
    'React',
    'Vue.js',
    'Three.js',
    '.NET',
    'Python',
    'iOS',
    'Android',
    'AWS',
    'Azure',
    'GCP',
    'Kubernetes',
    'Terraform',
    'Ansible',
    'GitLab',
    'Azure DevOps',
    'ArgoCD',
    'WordPress',
  ]}
/>

import AuthorCard from '@site/src/components/AuthorCard';

<AuthorCard />
```

Keep everything above the `## Selected work` line unchanged (frontmatter, `# KODEPULL SRL`, metadata block, `## What we build`, `## My role`, `TechStackGrid`).

- [ ] **Step 2: Verify the blog builds**

Run: `cd blog-site && npm run build`
Expected: build succeeds, no MDX errors. Return to repo root afterward: `cd ..`

- [ ] **Step 3: Commit**

```bash
git add blog-site/docs/engineering/work/kodepull.mdx
git commit -m "docs(blog): trim kodepull page to role and company background"
```

---

## Task 7: Full-project verification

**Files:** none (verification only)

- [ ] **Step 1: Lint the portfolio**

Run: `npm run lint`
Expected: no errors

- [ ] **Step 2: Build the portfolio**

Run: `npm run build`
Expected: build succeeds, `dist/` produced

- [ ] **Step 3: Build the blog**

Run: `cd blog-site && npm run build && cd ..`
Expected: build succeeds

- [ ] **Step 4: Confirm both translation files are structurally parallel**

Run:
```bash
node -e "
const en = require('./public/locales/en/translation.json');
const es = require('./public/locales/es/translation.json');
const expEn = Object.keys(en.experience).sort().join(',');
const expEs = Object.keys(es.experience).sort().join(',');
const projEn = Object.keys(en.projects).sort().join(',');
const projEs = Object.keys(es.projects).sort().join(',');
console.log('experience keys match:', expEn === expEs, expEn);
console.log('projects keys match:', projEn === projEs, projEn);
"
```
Expected: both lines print `true`; experience keys include `inspyr,kodepull,flBetances,arctiq` (plus `active,company`-style labels), projects keys include all six project slugs.

- [ ] **Step 5: Manual visual check (optional, if a dev server is available)**

Run `npm run dev`, open the site, and confirm: the Experience section shows 4 cards in order INSPYR → KODEPULL → FL Betances → Arctiq with the violet KODEPULL node; the Projects section shows the 6 refreshed cards; the CV-PDF download renders 4 job blocks and the 3 refreshed Key Projects (EKS Platform Migration, Multi-Cloud IaC, Observability from Zero). Repeat with the language toggle set to Spanish.

---

## Self-Review

**Spec coverage:**
- Experience 4 roles + bullets (EN/ES) → Tasks 1, 2
- Role order + KODEPULL timeline node → Task 3
- CV 4th job block → Task 4
- Professional summary + About paragraphs → Tasks 1, 2
- Projects 6 cards refresh (EN/ES + icons/colors) → Tasks 1, 2, 5
- kodepull.mdx trim → Task 6
- Verification (lint, both builds, JSON parity) → Task 7
All spec sections covered.

**Placeholder scan:** No TBD/TODO; all copy and code blocks are complete. Task 5 Step 4 names concrete fallback icons rather than leaving it open-ended.

**Type/key consistency:** The translation key `kodepull` is introduced in Task 1/2 and consumed identically in Task 3 (`companyKeys`, `COMPANY_META`) and Task 4 (`t("experience.kodepull.*")`). The six `projects` slugs (`cicd`, `iac`, `monitoring`, `infrastructure`, `portal`, `containerization`) are unchanged from the existing file, so `Projects.jsx` and `ProfessionalPDFCV.jsx` key references stay valid. The CV's Key Projects keys (`cicd`, `iac`, `monitoring`) map to the three CV-worthy projects as intended.
