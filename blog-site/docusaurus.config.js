// @ts-check
import { themes as prismThemes } from "prism-react-renderer";

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "cjoga.cloud",
  tagline: "Camilo's handbook — opinions, the lab, and cert guides.",
  favicon: "img/favicon.ico",

  future: {
    v4: {
      removeLegacyPostBuildHeadAttribute: true,
      useCssCascadeLayers: true,
      siteStorageNamespacing: true,
      mdx1CompatDisabledByDefault: true,
    },
    faster: {
      swcJsLoader: true,
      swcJsMinimizer: true,
      swcHtmlMinimizer: true,
      lightningCssMinimizer: true,
      rspackBundler: true,
      // Disabled: triggers panics when config or content changes between
      // builds. Trade-off is slightly slower cold starts for stability.
      rspackPersistentCache: false,
      ssgWorkerThreads: true,
      mdxCrossCompilerCache: true,
    },
  },

  url: "https://blog.cjoga.cloud",
  baseUrl: "/",

  organizationName: "Camilool8",
  projectName: "cjoga-portfolio",

  onBrokenLinks: "throw",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  markdown: {
    format: "mdx",
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: "throw",
    },
  },
  themes: ["@docusaurus/theme-mermaid"],

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: "docs",
          routeBasePath: "/",
          sidebarPath: "./sidebars.js",
          showLastUpdateAuthor: false,
          showLastUpdateTime: true,
          breadcrumbs: true,
          editUrl: undefined,
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      }),
    ],
  ],

  plugins: [
    [
      "@docusaurus/plugin-ideal-image",
      {
        quality: 85,
        max: 1280,
        min: 640,
        steps: 3,
        disableInDev: false,
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: "img/social-card.jpg",
      colorMode: {
        defaultMode: "dark",
        respectPrefersColorScheme: true,
      },
      mermaid: {
        // Always render with `base` theme + custom variables so diagrams
        // read clearly against the dark site shell. Branded, not washed out.
        theme: { light: "base", dark: "base" },
        options: {
          fontFamily: "JetBrains Mono, ui-monospace, monospace",
          fontSize: 15,
          themeVariables: {
            // Background of node fills
            primaryColor: "#e0f2fe",
            primaryTextColor: "#0c4a6e",
            primaryBorderColor: "#0284c7",
            // Secondary fills (subgraph backgrounds, edge labels, etc.)
            secondaryColor: "#f1f5f9",
            secondaryTextColor: "#334155",
            secondaryBorderColor: "#94a3b8",
            // Tertiary fills (alt nodes)
            tertiaryColor: "#fef3c7",
            tertiaryTextColor: "#78350f",
            tertiaryBorderColor: "#d97706",
            // Lines + arrows
            lineColor: "#475569",
            textColor: "#0f172a",
            // Misc
            mainBkg: "#ffffff",
            nodeBorder: "#0284c7",
            clusterBkg: "#f8fafc",
            clusterBorder: "#cbd5e1",
            edgeLabelBackground: "#ffffff",
            fontSize: "15px",
          },
          flowchart: { useMaxWidth: true, htmlLabels: true, curve: "basis", padding: 16 },
          sequence: { useMaxWidth: true, mirrorActors: false, messageFontSize: 14, actorFontSize: 14 },
          gantt: { useMaxWidth: true, fontSize: 13 },
        },
      },
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: false,
        },
      },
      navbar: {
        title: "cjoga.cloud",
        hideOnScroll: false,
        items: [
          {
            type: "dropdown",
            to: "/me",
            label: "Me",
            position: "left",
            items: [
              { to: "/me/who-i-am", label: "Who I am" },
              { to: "/me/now", label: "Now" },
              {
                type: "html",
                value: '<div class="navbar-dropdown-section">Opinions</div>',
              },
              {
                to: "/me/opinions/keep-it-stupidly-simple",
                label: "Keep it stupidly simple",
              },
              {
                to: "/me/opinions/devops-title-2026",
                label: "The DevOps title is losing value in 2026",
              },
              {
                to: "/me/opinions/ai-in-devops-power-user",
                label: "AI in DevOps — be a power user",
              },
              {
                to: "/me/opinions/certifications-expire",
                label: "Certifications expire, and that's the point",
              },
              {
                to: "/me/opinions/terraform-over-bicep",
                label: "Why I run Terraform on Azure",
              },
              {
                to: "/me/opinions/openbao-over-vault",
                label: "OpenBao over Vault",
              },
              {
                to: "/me/opinions/self-hosting-privilege",
                label: "Self-hosting is a privilege",
              },
              {
                type: "html",
                value: '<div class="navbar-dropdown-divider"></div>',
              },
              { to: "/me/reading-and-tools", label: "Learning and tools" },
              { to: "/me/credentials", label: "Credentials" },
            ],
          },
          {
            type: "dropdown",
            to: "/engineering",
            label: "Engineering",
            position: "left",
            items: [
              {
                type: "html",
                value: '<div class="navbar-dropdown-section">Lab</div>',
              },
              { to: "/engineering/lab/overview", label: "Overview" },
              {
                to: "/engineering/lab/tips-and-gotchas/longhorn-replicas",
                label: "Longhorn — replica scheduling",
              },
              {
                to: "/engineering/lab/tips-and-gotchas/openbao-auto-unseal",
                label: "OpenBao — static-key auto-unseal",
              },
              {
                type: "html",
                value: '<div class="navbar-dropdown-section">Work</div>',
              },
              { to: "/engineering/work/arctiq", label: "Arctiq" },
              {
                to: "/engineering/work/inspyr-global-solutions",
                label: "INSPYR Global Solutions",
              },
              {
                to: "/engineering/work/fl-betances",
                label: "FL Betances & Asociados",
              },
              { to: "/engineering/work/kodepull", label: "KODEPULL SRL" },
            ],
          },
          {
            type: "dropdown",
            to: "/learn",
            label: "Learn",
            position: "left",
            items: [
              { to: "/learn/rhcsa", label: "RHCSA (EX200) guide" },
            ],
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
      },
      footer: {
        // Simple-mode footer: a flat array of links (no `title` columns)
        // renders as a single centered row separated by middots. Compact,
        // editorial, no "About" / "Resources" headers.
        style: "dark",
        links: [
          { label: "Me", to: "/me" },
          { label: "Engineering", to: "/engineering" },
          { label: "Learn", to: "/learn" },
          { label: "Portfolio", href: "https://cjoga.cloud" },
          { label: "GitHub", href: "https://github.com/Camilool8" },
          { label: "LinkedIn", href: "https://www.linkedin.com/in/cjoga" },
          { label: "Email", href: "mailto:josejoga.opx@gmail.com" },
        ],
        copyright: `© ${new Date().getFullYear()} Jose Camilo Joga Guerrero · handbook built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.oneLight,
        darkTheme: prismThemes.oneDark,
        additionalLanguages: [
          "bash",
          "yaml",
          "docker",
          "hcl",
          "nginx",
          "json",
          "toml",
          "ini",
          "diff",
          "git",
          "powershell",
          "python",
        ],
      },
    }),
};

export default config;
