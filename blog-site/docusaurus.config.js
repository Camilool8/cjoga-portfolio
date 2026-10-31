// @ts-check

// Mermaid renders to static SVG at build time (rehype-mermaid, img-svg
// strategy) — no mermaid runtime ships to the client. Each diagram is drawn
// twice, once per colour mode, from the brand tokens; rehypeMermaidDiagrams
// (below) ships both and CSS shows the one that matches [data-theme], so the
// diagram follows the site's toggle rather than only the OS setting.
//
// SVGs inside <img> can't load web fonts, so Mona Sans is out of reach
// here. Labels are sized at build time, in the build's browser, and drawn
// later with the viewer's fonts, so the stack is the Arial metric family:
// the same faces the site's "Mona Sans Fallback" scales to Mona Sans, and
// one of them is on every desktop OS (Arial, Helvetica, Liberation Sans /
// Arimo on Linux, FreeSans in the Alpine build image). Labels are prose,
// not code, so no mono. A face that runs wider (a Linux box without any
// of these) spills past its box rather than being cut off.
const mermaidBase = {
  theme: "base",
  fontFamily:
    'Arial, Helvetica, "Liberation Sans", Arimo, FreeSans, "Nimbus Sans", sans-serif',
  fontSize: 15,
  // Mermaid lowercases type selectors and the SVG is XML (case-sensitive),
  // so the label boxes (foreignObject) are reached through their groups.
  themeCSS: ".label > *, .cluster-label > * { overflow: visible; }",
  flowchart: { useMaxWidth: true, htmlLabels: true, curve: "basis", padding: 16 },
  sequence: { useMaxWidth: true, mirrorActors: false, messageFontSize: 14, actorFontSize: 14 },
  gantt: { useMaxWidth: true, fontSize: 13 },
};

// Light ("daylight from orbit"): white nodes on the tinted ground, teal
// rims, slate lines.
const mermaidLight = {
  ...mermaidBase,
  themeVariables: {
    background: "transparent",
    primaryColor: "#ffffff",
    primaryTextColor: "#0f172a",
    primaryBorderColor: "#0e7490",
    secondaryColor: "#edf1f7",
    secondaryTextColor: "#334155",
    secondaryBorderColor: "#0369a1",
    tertiaryColor: "#e7ecf3",
    tertiaryTextColor: "#b45309",
    tertiaryBorderColor: "#b45309",
    lineColor: "#64748b",
    textColor: "#334155",
    mainBkg: "#ffffff",
    nodeBorder: "#0e7490",
    titleColor: "#0f172a",
    clusterBkg: "#edf1f7",
    clusterBorder: "#cbd5e1",
    edgeLabelBackground: "#f3f6fa",
    fontSize: "15px",
  },
};

// Dark: the night palette — bulkhead nodes, mint rims.
const mermaidDark = {
  ...mermaidBase,
  themeVariables: {
    background: "transparent",
    primaryColor: "#1a2332",
    primaryTextColor: "#e2e8f0",
    primaryBorderColor: "#64ffda",
    secondaryColor: "#111827",
    secondaryTextColor: "#cbd5e1",
    secondaryBorderColor: "#38bdf8",
    tertiaryColor: "#1f2937",
    tertiaryTextColor: "#fbbf24",
    tertiaryBorderColor: "#f59e0b",
    lineColor: "#94a3b8",
    textColor: "#cbd5e1",
    mainBkg: "#1a2332",
    nodeBorder: "#64ffda",
    titleColor: "#e2e8f0",
    clusterBkg: "#0e1626",
    clusterBorder: "#334155",
    edgeLabelBackground: "#0b0f1a",
    fontSize: "15px",
  },
};

// Prism theme from the brand tokens. Values are CSS variables, so one
// theme serves both colour modes and follows scripts/brand/tokens.css:
// comments in the tertiary tone, keywords and functions in sky, strings
// in the accent, numbers and booleans in amber, the rest in ink.
//
// Shell is the exception. Prism marks a command as a keyword, builtin or
// function only when its name is on a list ("enable" and "hostname" are,
// "restart" isn't), so its colour landed on commands by coincidence.
// In shell the command words stay ink; colour is kept for what the reader
// changes or must notice: comments, strings, flags (--now), variables
// ($HOME, FOO=) and, in the sheets, the painted <placeholders>.
const SHELL = ["bash", "sh", "shell", "zsh"];
const prismTokenTheme = {
  plain: { color: "var(--text-primary)", backgroundColor: "var(--bg-surface)" },
  styles: [
    { types: ["comment", "prolog", "doctype", "cdata"], style: { color: "var(--text-tertiary)", fontStyle: "normal" } },
    { types: ["punctuation", "operator", "entity", "url"], style: { color: "var(--text-secondary)" } },
    { types: ["property", "tag", "constant", "symbol", "deleted", "atrule", "keyword", "function", "class-name"], style: { color: "var(--accent-secondary)" } },
    { types: ["selector", "attr-name", "string", "char", "builtin", "inserted", "attr-value"], style: { color: "var(--accent-ink)" } },
    { types: ["boolean", "number", "regex", "important", "variable"], style: { color: "var(--accent-warm)" } },
    // After the rules above, so these win for shell. A token's alias
    // applies after its type (builtin → class-name, environment →
    // constant), so both are named.
    { types: ["keyword", "builtin", "class-name", "function", "function-name"], languages: SHELL, style: { color: "var(--text-primary)" } },
    { types: ["environment", "constant"], languages: SHELL, style: { color: "var(--accent-warm)" } },
  ],
};

// rehype-mermaid's `dark` option emits <picture><source media="(prefers-
// color-scheme: dark)" srcset=…><img …></picture>. The site's theme is a
// [data-theme] toggle, not the OS setting, so each <picture> becomes two
// <img>s (light and dark) that CSS switches on [data-theme].
//
// rehype-mermaid maps a diagram's accTitle to the img *title* attribute and
// accDescr to *alt*. Docs carry an accTitle per fence, so title is promoted
// to alt and the tooltip dropped. Each diagram is wrapped in its zoom
// container at BUILD time (`div.mermaid-zoom-wrap`) so the wrapper ships in
// the static HTML: the client module only attaches listeners and an
// absolutely-positioned affordance, with no layout shift. The wrapper
// carries the diagram's natural width (--diagram-w) so CSS can keep labels
// readable instead of always shrinking the diagram to the column.
function rehypeMermaidDiagrams() {
  /** @param {any} n */
  const isMermaidImg = (n) =>
    n &&
    n.type === "element" &&
    n.tagName === "img" &&
    typeof n.properties?.id === "string" &&
    n.properties.id.startsWith("mermaid");

  /** @param {any} n */
  const isMermaidPicture = (n) =>
    n &&
    n.type === "element" &&
    n.tagName === "picture" &&
    Array.isArray(n.children) &&
    n.children.some(isMermaidImg);

  /** @param {any} img */
  const altOf = (img) => {
    if (!img.properties.alt && img.properties.title) {
      img.properties.alt = img.properties.title;
    }
    delete img.properties.title;
    return typeof img.properties.alt === "string" ? img.properties.alt : "Diagram";
  };

  /** @param {any} lightImg @param {any} [darkImg] */
  const wrap = (lightImg, darkImg) => {
    const alt = altOf(lightImg);
    lightImg.properties.className = darkImg
      ? ["mermaid-diagram", "mermaid-diagram--light"]
      : ["mermaid-diagram"];
    const children = [lightImg];
    if (darkImg) {
      darkImg.properties.alt = alt;
      darkImg.properties.className = ["mermaid-diagram", "mermaid-diagram--dark"];
      children.push(darkImg);
    }
    const width = Math.round(Number(lightImg.properties.width) || 0);
    return {
      type: "element",
      tagName: "div",
      properties: {
        className: ["mermaid-zoom-wrap"],
        role: "button",
        tabIndex: 0,
        "aria-label": `${alt} — open in zoom view`,
        ...(width ? { style: `--diagram-w: ${width}px` } : {}),
      },
      children,
    };
  };

  /** @param {any} picture */
  const fromPicture = (picture) => {
    const img = picture.children.find(isMermaidImg);
    const source = picture.children.find(
      (/** @type {any} */ c) => c.type === "element" && c.tagName === "source",
    );
    if (!source) return wrap(img);
    const darkImg = {
      type: "element",
      tagName: "img",
      properties: {
        id: source.properties.id,
        src: source.properties.srcSet ?? source.properties.srcset,
        width: source.properties.width,
        height: source.properties.height,
      },
      children: [],
    };
    return wrap(img, darkImg);
  };

  /** @param {any} node */
  const visit = (node) => {
    if (!Array.isArray(node.children)) return;
    for (let i = 0; i < node.children.length; i += 1) {
      const child = node.children[i];
      if (isMermaidPicture(child)) {
        node.children[i] = fromPicture(child);
      } else if (isMermaidImg(child)) {
        node.children[i] = wrap(child);
      } else {
        visit(child);
      }
    }
  };
  return (/** @type {any} */ tree) => visit(tree);
}

// Reading time for the dateline: prose words at 230 wpm, computed from
// the source at build time (imports, JSX tags, link targets and diagram
// fences don't count). Exposed as front matter `reading_time` (minutes).
/** @param {string} content */
function readingMinutes(content) {
  const prose = content
    .replace(/```mermaid[\s\S]*?```/g, " ")
    .replace(/^(import|export)\s.*$/gm, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\]\([^)]*\)/g, "]")
    .replace(/[#*_`>|{}[\]-]/g, " ");
  const words = prose.split(/\s+/).filter((w) => /\w/.test(w)).length;
  return Math.max(1, Math.round(words / 230));
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
  const { default: remarkSmartypants } = requireNative("remark-smartypants");

  /** @type {import('@docusaurus/types').Config} */
  const config = {
  // Tab titles read "Page | Camilo's handbook", so the handbook never
  // shares a tab or search-result suffix with the portfolio (cjoga.cloud).
  // The bar's wordmark is themeConfig.navbar.title, below.
  title: "Camilo's handbook",
  tagline: "Camilo's handbook — opinions, the K3s cluster, and cert guides.",
  // The build's date, for notes that depend on a page's age (DocItem/
  // Content: a time-bound page over a quarter old). Fixed once per build,
  // so server HTML and client agree; BUILD_DATE pins it (tests, reruns).
  customFields: {
    buildDate: process.env.BUILD_DATE || new Date().toISOString().slice(0, 10),
  },
  favicon: "img/logo.svg",

  trailingSlash: false,

  headTags: [
    // The reader's code-wrap choices (src/clientModules/codeBlocks.js),
    // one for sheet blocks and one for the rest, applied before first
    // paint so a block on the first screen never re-wraps after load. A
    // choice stored under the old single key counts for the rest.
    {
      tagName: "script",
      attributes: {},
      innerHTML:
        "try{var s=localStorage,d=document.documentElement,k='handbook:code-wrap',v=function(x){return x==='on'||x==='off'?x:null},a=v(s.getItem(k+':sheet')),b=v(s.getItem(k+':prose'))||v(s.getItem(k));if(a)d.setAttribute('data-code-wrap-sheet',a);if(b)d.setAttribute('data-code-wrap-prose',b)}catch(e){}",
    },
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
    // The Atom feed of dated pages (plugins/docs-feed.js), for feed
    // readers that discover it from any page.
    {
      tagName: "link",
      attributes: {
        rel: "alternate",
        type: "application/atom+xml",
        title: "Camilo's handbook",
        href: "https://blog.cjoga.cloud/atom.xml",
      },
    },
    // Web fonts: self-hosted variable fonts (static/fonts/) declared via
    // @font-face in custom.css. Only Mona Sans latin is preloaded: every
    // page sets text in it above the fold. JetBrains Mono is for code,
    // which most first screens don't have, so it loads on demand.
    // The href must be the exact URL the @font-face requests: custom.css
    // marks those url()s webpackIgnore so the bundler keeps /fonts/… as
    // written instead of emitting a hashed copy under /assets/fonts/. If
    // the two ever differ, the font downloads twice and the console warns
    // "preloaded but not used". The metric-matched fallback face keeps
    // the swap free of layout shift either way.
    {
      tagName: "link",
      attributes: {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: "/fonts/mona-sans-latin.woff2",
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
    parseFrontMatter: async (params) => {
      const result = await params.defaultParseFrontMatter(params);
      result.frontMatter.reading_time = readingMinutes(result.content);
      return result;
    },
    hooks: {
      onBrokenMarkdownLinks: "throw",
    },
  },

  // Binds click-to-zoom onto the statically rendered mermaid <img>s
  // (and rebinds on client-side route changes).
  clientModules: [
    "./src/clientModules/mermaidZoom.js",
    "./src/clientModules/codeBlocks.js",
    "./src/clientModules/dropdownKeys.js",
  ],

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: "docs",
          routeBasePath: "/",
          sidebarPath: "./sidebars.js",
          // Typographer's quotes in prose: "…" and it's become “…” and
          // it’s, so body copy matches the pull quotes. Only text nodes
          // change; code, inline code, JSX attributes, link targets and
          // front matter never reach it. Dashes and ellipses stay as
          // written.
          remarkPlugins: [[remarkSmartypants, { dashes: false, ellipses: false }]],
          rehypePlugins: [
            [
              rehypeMermaid,
              {
                strategy: "img-svg",
                mermaidConfig: mermaidLight,
                dark: mermaidDark,
                // In the Docker builder the env points at the apk-installed
                // chromium; locally it's unset and playwright resolves its
                // own cached browser.
                launchOptions: {
                  executablePath:
                    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
                },
              },
            ],
            rehypeMermaidDiagrams,
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

  // Offline search: the index is built at compile time and served with the
  // site, so no third-party service sees a query.
  themes: [
    [
      "@easyops-cn/docusaurus-search-local",
      {
        hashed: true,
        indexDocs: true,
        indexBlog: false,
        indexPages: false,
        docsRouteBasePath: "/",
        language: ["en"],
        highlightSearchTermsOnTargetPage: false,
        // Hits the dropdown asks for. It shows 8 rows (ROW_LIMIT in
        // src/theme/SearchBar); the margin lets ranking and grouping by page
        // still fill them. The worker fills this budget index by index
        // (titles, headings, descriptions, tags, then text), so it is large
        // enough to reach every page's tags and the text under them: at 24,
        // "kubernetes" ran out inside the tags and kubestronaut-sim's was
        // never read, so ranking could not see the page was tagged.
        searchResultLimits: 60,
        searchBarShortcutHint: true,
        // Section index pages list their articles; indexed, each listing
        // answered the same queries as the article it links to. The hubs
        // stay findable by their title and intro. Chrome inside the
        // article stays out too: the phone "On this page" toggle, and a
        // guide's jump to its sheet, which repeats the sheet's own H2.
        ignoreCssSelectors: [
          ".section-index-list",
          ".domain-sheet nav",
          ".domain-sheet-back",
          ".theme-doc-toc-mobile",
          'a[href="#domain-sheet-index"]',
          ".domain-sheet-shorthand",
        ],
      },
    ],
  ],

  plugins: [
    "./plugins/doc-dates.js",
    "./plugins/docs-feed.js",
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
        { name: "author", content: "José Camilo Joga Guerrero" },
        {
          name: "description",
          content:
            "Camilo's handbook — opinions, K3s cluster notes, and cert guides from a working Platform & DevOps Engineer.",
        },
        {
          name: "keywords",
          content:
            "DevOps, Kubernetes, K3s, CKAD, CKA, Kubestronaut, Terraform, AWS, RHCSA, RHCE, homelab, KodePull, GitOps, OpenBao, Vault",
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
        // Below 997px the bar slides away while reading down and comes
        // back on a scroll up; desktop keeps it (custom.css, "Table of
        // contents").
        hideOnScroll: true,
        logo: {
          alt: "cjoga.cloud mark",
          src: "img/logo.svg",
          width: 28,
          height: 28,
        },
        items: [
          // Index-level items only: each dropdown names a section's pages
          // or indexes, and the index pages and sidebar list the rest
          // (individual opinions, tips, engagements). Labels are the docs'
          // own titles, so menu and sidebar name each page the same way.
          // (Plain `to` links, not `type: "doc"`: a doc item labels itself
          // with its id and lights up anywhere in its sidebar.)
          //
          // Each dropdown opens with the section's index page, labelled with
          // its title like every other item ("Engineering", not "Overview",
          // which read as a twin of "Cluster overview" right below it).
          // The parent label links there too, but Enter on it only toggles
          // the menu and on touch screens the caret reads as "open a menu",
          // so keyboard and touch readers need this item to reach the index. Its regex keeps it active on the index
          // alone (a bare `to` would match every page in the section).
          //
          // Reader order, as on the landing: Learn (the primary readers),
          // then Engineering, then Me.
          {
            type: "dropdown",
            to: "/learn",
            activeBasePath: "/learn",
            label: "Learn",
            position: "left",
            items: [
              {
                to: "/learn",
                label: "Learn",
                activeBaseRegex: "^/learn/?$",
                className: "dropdown-overview-link",
              },
              { to: "/learn/rhcsa", label: "RHCSA (EX200) guide" },
              { to: "/learn/rhce", label: "RHCE (EX294) guide" },
              { to: "/learn/ckad", label: "CKAD guide" },
              // The doc's own title, as everywhere else; what it is (an exam
              // simulator) is said on the Learn hub and in the guide.
              { to: "/learn/kubestronaut-sim", label: "kubestronaut-sim" },
            ],
          },
          {
            type: "dropdown",
            to: "/engineering",
            activeBasePath: "/engineering",
            label: "Engineering",
            position: "left",
            items: [
              {
                to: "/engineering",
                label: "Engineering",
                activeBaseRegex: "^/engineering/?$",
                className: "dropdown-overview-link",
              },
              { to: "/engineering/lab/overview", label: "Cluster overview" },
              { to: "/engineering/lab/tips-and-gotchas", label: "Tips and gotchas" },
              { to: "/engineering/work", label: "Work" },
            ],
          },
          {
            type: "dropdown",
            to: "/me",
            activeBasePath: "/me",
            label: "Me",
            position: "left",
            items: [
              {
                to: "/me",
                label: "Me",
                activeBaseRegex: "^/me/?$",
                className: "dropdown-overview-link",
              },
              { to: "/me/who-i-am", label: "Who I am" },
              { to: "/me/now", label: "Now" },
              { to: "/me/opinions", label: "Opinions" },
              { to: "/me/reading-and-tools", label: "Learning and tools" },
              { to: "/me/credentials", label: "Credentials" },
            ],
          },
          { type: "search", position: "right" },
          {
            href: "https://cjoga.cloud",
            label: "Portfolio",
            position: "right",
            className: "navbar-portfolio-link",
            // One product: the portfolio opens in place, like a section.
            target: "_self",
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
          // Reader order, as on the landing: learners first.
          { label: "Learn", to: "/learn" },
          { label: "Engineering", to: "/engineering" },
          { label: "Me", to: "/me" },
          { label: "Portfolio", href: "https://cjoga.cloud", target: "_self" },
          // The CV is generated on the portfolio; #contact is the section
          // that holds its "Download CV" button (and the email beside it).
          { label: "CV on cjoga.cloud", href: "https://cjoga.cloud/#contact", target: "_self" },
          { label: "GitHub", href: "https://github.com/Camilool8" },
          { label: "LinkedIn", href: "https://www.linkedin.com/in/cjoga" },
          { label: "Email", href: "mailto:josejoga.opx@gmail.com" },
          // The Atom feed (plugins/docs-feed.js). A static file on this
          // site, not a route, and not an external link: plain HTML keeps
          // the router and the external-link mark off it.
          {
            html: '<a class="footer__link-item" href="/atom.xml" type="application/atom+xml">Feed</a>',
          },
        ],
        copyright: `© ${new Date().getFullYear()} José Camilo Joga Guerrero · handbook built with Docusaurus.`,
      },
      prism: {
        theme: prismTokenTheme,
        darkTheme: prismTokenTheme,
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
