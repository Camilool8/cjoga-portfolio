// @ts-check
import { themes as prismThemes } from "prism-react-renderer";

// Mermaid renders to static SVG at build time (rehype-mermaid, img-svg
// strategy) — no mermaid runtime ships to the client. Diagrams are drawn
// once with the dark phosphor brand theme; a CSS card behind each diagram
// keeps them legible on the light theme (see DiagramZoom/styles.module.css).
const mermaidConfig = {
  theme: "base",
  // SVGs inside <img> can't load web fonts, so JetBrains Mono is out of
  // reach here. Use a deterministic system mono stack so build-time text
  // metrics match what viewers render.
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSize: 15,
  themeVariables: {
    background: "transparent",
    // Node fills
    primaryColor: "#1a2332",
    primaryTextColor: "#e2e8f0",
    primaryBorderColor: "#64ffda",
    // Secondary fills (edge labels, alt shapes)
    secondaryColor: "#111827",
    secondaryTextColor: "#cbd5e1",
    secondaryBorderColor: "#38bdf8",
    // Tertiary fills (alt nodes)
    tertiaryColor: "#1f2937",
    tertiaryTextColor: "#fbbf24",
    tertiaryBorderColor: "#f59e0b",
    // Lines + arrows
    lineColor: "#94a3b8",
    textColor: "#cbd5e1",
    // Misc
    mainBkg: "#1a2332",
    nodeBorder: "#64ffda",
    titleColor: "#e2e8f0",
    clusterBkg: "#0e1626",
    clusterBorder: "#334155",
    edgeLabelBackground: "#0b0f1a",
    fontSize: "15px",
  },
  flowchart: { useMaxWidth: true, htmlLabels: true, curve: "basis", padding: 16 },
  sequence: { useMaxWidth: true, mirrorActors: false, messageFontSize: 14, actorFontSize: 14 },
  gantt: { useMaxWidth: true, fontSize: 13 },
};

// rehype-mermaid maps a diagram's accTitle to the img *title* attribute and
// accDescr to *alt* (via mermaid-isomorphic's aria lookups). Docs carry an
// accTitle per fence, so promote title → alt for accessibility and drop the
// redundant tooltip. We ALSO wrap each diagram in its zoom container at BUILD
// time (`div.mermaid-zoom-wrap`) so the wrapper ships in the static HTML: the
// client module then only attaches listeners and an absolutely-positioned
// affordance, avoiding the layout shift a runtime wrap would cause.
function rehypeMermaidImgAlt() {
  /** @param {any} n */
  const isMermaidImg = (n) =>
    n &&
    n.type === "element" &&
    n.tagName === "img" &&
    typeof n.properties?.id === "string" &&
    n.properties.id.startsWith("mermaid");

  /** @param {any} img */
  const wrapDiagram = (img) => {
    if (!img.properties.alt && img.properties.title) {
      img.properties.alt = img.properties.title;
    }
    delete img.properties.title;
    img.properties.className = ["mermaid-diagram"];
    const alt =
      typeof img.properties.alt === "string" ? img.properties.alt : "Diagram";
    return {
      type: "element",
      tagName: "div",
      properties: {
        className: ["mermaid-zoom-wrap"],
        role: "button",
        tabIndex: 0,
        "aria-label": `${alt} — open in zoom view`,
      },
      children: [img],
    };
  };

  /** @param {any} node */
  const visit = (node) => {
    if (!Array.isArray(node.children)) return;
    for (let i = 0; i < node.children.length; i += 1) {
      const child = node.children[i];
      if (isMermaidImg(child)) {
        node.children[i] = wrapDiagram(child);
      } else {
        visit(child);
      }
    }
  };
  return (/** @type {any} */ tree) => visit(tree);
}

// Async config so rehype-mermaid (ESM-only) can be loaded lazily. jiti —
// Docusaurus' config loader — can't evaluate it itself (its interpreter
// trips on `import.meta.resolve` inside mermaid-isomorphic, and its VM
// sandbox has no dynamic-import callback), so the module is pulled in
// through a *native* createRequire: Node ≥22 supports require() of ESM,
// and that path bypasses jiti's transform entirely.
import { createRequire } from "node:module";
const requireNative = createRequire(import.meta.url);

/** @returns {Promise<import('@docusaurus/types').Config>} */
export default async function createConfigAsync() {
  const { default: rehypeMermaid } = requireNative("rehype-mermaid");

  /** @type {import('@docusaurus/types').Config} */
  const config = {
  title: "cjoga.cloud",
  tagline: "Camilo's handbook — opinions, the lab, and cert guides.",
  favicon: "img/logo.svg",

  trailingSlash: false,

  headTags: [
    // Brand icons & manifest. Docusaurus emits the primary favicon from
    // the top-level `favicon` field (logo.svg). Additional formats and
    // manifest links are appended here.
    {
      tagName: "link",
      attributes: { rel: "apple-touch-icon", href: "/img/apple-touch-icon.png" },
    },
    {
      tagName: "link",
      attributes: { rel: "manifest", href: "/manifest.webmanifest" },
    },
    {
      tagName: "meta",
      attributes: { name: "theme-color", content: "#06080d" },
    },
    {
      tagName: "meta",
      attributes: { name: "color-scheme", content: "dark light" },
    },
    // Sister-site discovery — helps Google associate the two properties.
    {
      tagName: "link",
      attributes: { rel: "me", href: "https://cjoga.cloud/" },
    },
    // Web fonts: self-hosted latin variable fonts (static/fonts/) declared
    // via @font-face in custom.css. Preloading all three means they arrive
    // before first paint — this is what keeps font-swap CLS at ~0, so keep
    // the preloads if the font files ever move.
    {
      tagName: "link",
      attributes: {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: "/fonts/syne-latin-var.woff2",
        crossorigin: "anonymous",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: "/fonts/outfit-latin-var.woff2",
        crossorigin: "anonymous",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: "/fonts/jetbrains-mono-latin-var.woff2",
        crossorigin: "anonymous",
      },
    },
  ],

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
    hooks: {
      onBrokenMarkdownLinks: "throw",
    },
  },

  // Binds click-to-zoom onto the statically rendered mermaid <img>s
  // (and rebinds on client-side route changes).
  clientModules: ["./src/clientModules/mermaidZoom.js"],

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: "docs",
          routeBasePath: "/",
          sidebarPath: "./sidebars.js",
          rehypePlugins: [
            [
              rehypeMermaid,
              {
                strategy: "img-svg",
                mermaidConfig,
                // In the Docker builder the env points at the apk-installed
                // chromium; locally it's unset and playwright resolves its
                // own cached browser.
                launchOptions: {
                  executablePath:
                    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
                },
              },
            ],
            rehypeMermaidImgAlt,
          ],
          // Visible dates come from the DocItem/Content swizzle (frontmatter
          // date + last_update.date); the DocItem/Footer swizzle renders null,
          // so showLastUpdateTime adds no UI. It must stay ON: the sitemap's
          // `lastmod` only reads frontmatter last_update through this flag,
          // and the Docker build has no .git for the git fallback (it warns
          // there for docs without frontmatter dates — harmless).
          showLastUpdateAuthor: false,
          showLastUpdateTime: true,
          breadcrumbs: true,
          editUrl: undefined,
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
        sitemap: {
          changefreq: "weekly",
          priority: 0.5,
          filename: "sitemap.xml",
          ignorePatterns: ["/tags/**", "/search/**"],
          // Emit <lastmod> from each doc's `last_update` frontmatter.
          lastmod: "date",
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
      // Default social card. Per-page overrides via MDX frontmatter `image`.
      image: "img/og-default.png",
      metadata: [
        { name: "author", content: "Jose Camilo Joga Guerrero" },
        {
          name: "description",
          content:
            "Camilo's handbook — opinions, lab notes, and cert guides from a working DevOps engineer.",
        },
        {
          name: "keywords",
          content:
            "DevOps, Kubernetes, K3s, Terraform, AWS, RHCSA, RHCE, homelab, GitOps, OpenBao, Vault, Longhorn",
        },
        { name: "robots", content: "index, follow, max-image-preview:large" },
        { name: "twitter:card", content: "summary_large_image" },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "blog.cjoga.cloud" },
        { property: "og:locale", content: "en_US" },
      ],
      colorMode: {
        defaultMode: "dark",
        respectPrefersColorScheme: true,
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
        logo: {
          alt: "cjoga.cloud mark",
          src: "img/logo.svg",
          width: 28,
          height: 28,
        },
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
              { to: "/learn/rhce", label: "RHCE (EX294) guide" },
              { to: "/learn/ckad", label: "CKAD guide" },
              { to: "/learn/kubestronaut-sim", label: "kubestronaut-sim" },
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

  return config;
}
