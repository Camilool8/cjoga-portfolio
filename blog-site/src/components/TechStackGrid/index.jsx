import React, { useId } from 'react';
import { FaAws, FaMicrosoft, FaRedhat } from 'react-icons/fa';
import {
  SiKubernetes,
  SiTerraform,
  SiAnsible,
  SiFlux,
  SiArgo,
  SiGitlab,
  SiGithub,
  SiEnvoyproxy,
  SiCilium,
  SiVault,
  SiGrafana,
  SiPrometheus,
  SiOpentelemetry,
  SiDatabricks,
  SiDotnet,
  SiVuedotjs,
  SiThreedotjs,
  SiWordpress,
  SiCloudflare,
  SiTailscale,
  SiLetsencrypt,
  SiProxmox,
  SiNutanix,
  SiNextdotjs,
  SiReact,
  SiPython,
  SiGooglecloud,
  SiIos,
  SiAndroid,
  SiClaude,
  SiGithubcopilot,
  SiAnthropic,
  SiWarp,
  SiArc,
  SiDocker,
  SiLens,
  SiVmware,
  SiKeepassxc,
  SiNeovim,
  SiOpenai,
  SiWindsurf,
  SiGooglegemini,
  SiVagrant,
  SiVirtualbox,
  SiGnubash,
  SiPodman,
  SiGo,
  SiHelm,
  SiTypescript,
} from 'react-icons/si';
import {
  VscAzure,
  VscAzureDevops,
  VscTerminalPowershell,
  VscVscode,
  VscTerminal,
} from 'react-icons/vsc';
import styles from './styles.module.css';

// simple-icons marks (CC0) that react-icons doesn't ship yet. Inline, so
// they take a color like every other mark instead of an <img> locked to its
// brand fill, and the page makes no third-party request for them.
function simpleIcon(title, d) {
  function Mark(props) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" focusable="false" {...props}>
        <path d={d} />
      </svg>
    );
  }
  Mark.displayName = `Si${title}`;
  return Mark;
}

const SiLonghorn = simpleIcon(
  'Longhorn',
  'M21.46 2.172H2.54A2.55 2.55 0 0 0 0 4.712v14.575a2.55 2.55 0 0 0 2.54 2.54h18.92a2.55 2.55 0 0 0 2.54-2.54V4.713a2.55 2.55 0 0 0-2.54-2.54m.427 5.138-.31 2.1a1.24 1.24 0 0 1-.98 1.032l-5.024 1.003-.002.015-.787 4.306a2.474 2.474 0 0 1-2.467 2.34h-.634a2.474 2.474 0 0 1-2.468-2.355l-.697-4.288-5.115-1.021a1.24 1.24 0 0 1-.98-1.032l-.31-2.1a1.235 1.235 0 0 1 2.445-.36L4.74 8.19 12 9.639l7.26-1.45.182-1.24a1.235 1.235 0 0 1 2.445.36M12 12.134a1.2 1.2 0 0 1-.242-.024l-.653-.13.562 3.457a1 1 0 0 1 .016.198h.634a1.2 1.2 0 0 1 .02-.222l.63-3.448-.725.145a1.2 1.2 0 0 1-.242.024',
);

const SiOpenbao = simpleIcon(
  'Openbao',
  'M11.997 4.631a3 3 0 0 0-.309.02c-3.277.098-6.427 1.737-8.084 4.74a8.2 8.2 0 0 0-.99 3.117C.922 13.256 0 14.185 0 15.142c0 1.12 1.264 2.196 3.515 2.989 2.25.793 5.302 1.238 8.485 1.238s6.235-.445 8.485-1.238S24 16.263 24 15.14c0-.956-.922-1.885-2.614-2.633a8.2 8.2 0 0 0-.99-3.117c-1.657-3.003-4.807-4.642-8.084-4.74a3 3 0 0 0-.315-.02m.9 2.09.037.02c.354.198.687.488.737.547.317.38.74 1.09.74 1.473a.896.896 0 0 0 1.793 0 3.24 3.24 0 0 0-.322-1.39 7.2 7.2 0 0 1 2.945 2.886c.676 1.226.902 2.634.75 3.605-.077.486-.244.847-.419 1.046s-.32.278-.622.278H5.464c-.301 0-.447-.079-.622-.278-.175-.2-.342-.56-.419-1.046-.152-.97.074-2.38.75-3.605A7.2 7.2 0 0 1 8.118 7.37a3.24 3.24 0 0 0-.322 1.39.896.896 0 0 0 1.792 0c0-.382.424-1.093.741-1.473a3.7 3.7 0 0 1 .775-.567v2.04a.896.896 0 1 0 1.792 0zm2.141 3.523a1.38 1.38 0 0 0-1.138.61c-.21.309-.278.562.151.827.28.173.605.11.795.016.124-.06.17-.107.387-.007.439.203.695.193.948-.017.284-.236.236-.58.023-.83-.306-.359-.72-.591-1.166-.599m-6.797.017c-.445.007-.86.24-1.167.6-.213.25-.26.593.024.829.253.21.51.22.948.017.217-.1.263-.053.386.007.191.093.516.156.796-.016.429-.265.36-.519.15-.827a1.38 1.38 0 0 0-1.137-.61',
);

// Brand colors are drawn for white paper, so some vanish on one of the two
// grounds: Helm's navy at night, React's cyan in daylight. Keep each hue but
// lift it toward white (dark) or deepen it toward black (light) until the
// mark clears 3:1 against both the page and the hovered tile surface.
const GROUNDS = {
  dark: ['#06080d', '#111827'],
  light: ['#f3f6fa', '#ffffff'],
};

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

function luminance(hex) {
  const [r, g, b] = rgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function mix(a, b, t) {
  const to = rgb(b);
  return `#${rgb(a)
    .map((v, i) => Math.round(v + (to[i] - v) * t).toString(16).padStart(2, '0'))
    .join('')}`;
}

const legibleCache = new Map();

function legible(hex, theme) {
  const key = `${hex}/${theme}`;
  if (!legibleCache.has(key)) {
    const toward = theme === 'dark' ? '#ffffff' : '#000000';
    let out = toward;
    for (let step = 0; step <= 20; step += 1) {
      const c = mix(hex, toward, step / 20);
      if (GROUNDS[theme].every((g) => contrast(c, g) >= 3)) {
        out = c;
        break;
      }
    }
    legibleCache.set(key, out);
  }
  return legibleCache.get(key);
}

// Tool registry — three render shapes:
//   1. { Icon, color }          — react-icons SVG component
//   2. { image }                — <img src>: a locally hosted SVG/PNG
//   3. { textOnly: true }       — no mark, the label alone (last resort)
//
// Mirrors the react-icons sets the portfolio uses where coverage exists.
// Tools without react-icons coverage use an inlined simple-icons path, a
// locally hosted SVG/PNG from each project's repo, or a brand-colored FA
// fallback.
const TECH = {
  // Cloud / compute
  AWS: { Icon: FaAws, color: '#FF9900' },
  EKS: { Icon: FaAws, color: '#FF9900' },
  'AWS Secrets Manager': { Icon: FaAws, color: '#FF9900' },
  'AWS Identity Center': { Icon: FaAws, color: '#FF9900' },
  Azure: { Icon: VscAzure, color: '#0078D4' },
  AKS: { Icon: SiKubernetes, color: '#326CE5' },
  Kubernetes: { Icon: SiKubernetes, color: '#326CE5' },
  K3s: { Icon: SiKubernetes, color: '#326CE5' },
  kind: { Icon: SiKubernetes, color: '#326CE5' },
  Helm: { Icon: SiHelm, color: '#0F1689' },
  'Entra ID': { Icon: FaMicrosoft, color: '#0078D4' },
  'Key Vault': { Icon: VscAzure, color: '#0078D4' },
  Synapse: { Icon: VscAzure, color: '#0078D4' },
  Proxmox: { Icon: SiProxmox, color: '#E57000' },
  Nutanix: { Icon: SiNutanix, color: '#7855FA' },
  // Spectro Cloud's mark and Palette's, from their official artwork
  // (spectrocloud/librarium, spectrocloud.com); the Palette file keeps
  // only the mark, without the wordmark.
  'Spectro Cloud': { image: '/img/logos/spectrocloud-mark.svg' },
  Palette: { image: '/img/logos/palette-mark.svg' },
  Cloudflare: { Icon: SiCloudflare, color: '#F38020' },
  Tailscale: { Icon: SiTailscale, color: null },
  "Let's Encrypt": { Icon: SiLetsencrypt, color: '#003A70' },

  // IaC / config
  Terraform: { Icon: SiTerraform, color: '#7B42BC' },
  Ansible: { Icon: SiAnsible, color: '#EE0000' },
  Bicep: { image: '/img/logos/azure-bicep.svg' },

  // GitOps + CI
  FluxCD: { Icon: SiFlux, color: '#5468FF' },
  ArgoCD: { Icon: SiArgo, color: '#EF7B4D' },
  GitLab: { Icon: SiGitlab, color: '#FC6D26' },
  'GitLab CI': { Icon: SiGitlab, color: '#FC6D26' },
  GitHub: { Icon: SiGithub, color: null },
  'Azure DevOps': { Icon: VscAzureDevops, color: '#0078D7' },

  // Networking
  Envoy: { Icon: SiEnvoyproxy, color: '#AC6199' },
  Cilium: { Icon: SiCilium, color: '#F8C517' },

  // Storage / secrets / TLS
  Longhorn: { Icon: SiLonghorn, color: '#5F224B' },
  OpenBao: { Icon: SiOpenbao, color: '#336D5C' },
  Vault: { Icon: SiVault, color: '#FFEC6E' },
  'External Secrets': { image: '/img/logos/external-secrets.svg' },
  'cert-manager': { image: '/img/logos/cert-manager.svg' },

  // Observability
  Grafana: { Icon: SiGrafana, color: '#F46800' },
  Loki: { Icon: SiGrafana, color: '#F46800' },
  OpenTelemetry: { Icon: SiOpentelemetry, color: '#F5A800' },
  Prometheus: { Icon: SiPrometheus, color: '#E6522C' },

  // Data
  Databricks: { Icon: SiDatabricks, color: '#FF3621' },

  // Languages / runtimes / frameworks
  PowerShell: { Icon: VscTerminalPowershell, color: '#5391FE' },
  '.NET': { Icon: SiDotnet, color: '#512BD4' },
  Go: { Icon: SiGo, color: '#00ADD8' },
  TypeScript: { Icon: SiTypescript, color: '#3178C6' },
  'Vue.js': { Icon: SiVuedotjs, color: '#4FC08D' },
  React: { Icon: SiReact, color: '#61DAFB' },
  'Next.js': { Icon: SiNextdotjs, color: null },
  Python: { Icon: SiPython, color: '#3776AB' },
  'Three.js': { Icon: SiThreedotjs, color: null },
  WordPress: { Icon: SiWordpress, color: '#21759B' },

  // Other clouds
  GCP: { Icon: SiGooglecloud, color: '#4285F4' },

  // Mobile
  iOS: { Icon: SiIos, color: null },
  Android: { Icon: SiAndroid, color: '#3DDC84' },

  // AI tooling
  Claude: { Icon: SiClaude, color: '#D97757' },
  'Claude Code': { Icon: SiClaude, color: '#D97757' },
  'Claude for Teams': { Icon: SiClaude, color: '#D97757' },
  'GitHub Copilot': { Icon: SiGithubcopilot, color: null },
  Anthropic: { Icon: SiAnthropic, color: '#D97757' },
  Gemini: { Icon: SiGooglegemini, color: '#4285F4' },
  'GPT Codex': { Icon: SiOpenai, color: null },
  Codex: { Icon: SiOpenai, color: null },
  Windsurf: { Icon: SiWindsurf, color: null },
  Cursor: { image: '/img/logos/cursor.svg', mono: true },
  Antigravity: { textOnly: true },
  'Google Antigravity': { textOnly: true },
  'Kiro Code': { textOnly: true },

  // Terminal & editor
  Warp: { Icon: SiWarp, color: '#01A4FF' },
  'Windows Terminal': { Icon: VscTerminal, color: null },
  'VS Code': { Icon: VscVscode, color: '#007ACC' },

  // Containers / VMs / cluster tooling
  Docker: { Icon: SiDocker, color: '#2496ED' },
  Podman: { Icon: SiPodman, color: '#892CA0' },
  OrbStack: { textOnly: true },
  kubectl: { Icon: SiKubernetes, color: '#326CE5' },
  k3s: { Icon: SiKubernetes, color: '#326CE5' },
  Lens: { Icon: SiLens, color: '#3D90CE' },
  'VMware Fusion': { Icon: SiVmware, color: '#607078' },

  // Browser + utilities
  Arc: { Icon: SiArc, color: '#FCBFBD' },
  KeePassXC: { Icon: SiKeepassxc, color: '#7BAC2A' },
  NeoVim: { Icon: SiNeovim, color: '#57A143' },
  Neovim: { Icon: SiNeovim, color: '#57A143' },

  // Other
  'Power Automate': { Icon: FaMicrosoft, color: '#0066FF' },
  KubeCost: { Icon: SiKubernetes, color: '#326CE5' },
  Karpenter: { Icon: FaAws, color: '#FF9900' },

  // Diagrams as code (official D2 mark, self-hosted from terrastruct/d2)
  D2: { image: '/img/logos/d2.png' },

  // Lab / certification tooling
  Vagrant: { Icon: SiVagrant, color: '#1868F2' },
  VirtualBox: { Icon: SiVirtualbox, color: '#183A61' },
  RHEL: { Icon: FaRedhat, color: '#EE0000' },
  'Red Hat': { Icon: FaRedhat, color: '#EE0000' },
  Bash: { Icon: SiGnubash, color: '#4EAA25' },
};

// The mark a tool draws (its icon component or image), so neighbours
// that share one can be told apart from neighbours that don't. A tool
// with no mark has no key and never joins a run.
function markOf(name) {
  const entry = TECH[name];
  if (!entry || entry.textOnly) {
    return null;
  }
  return entry.Icon ?? entry.image;
}

// In the inline line, consecutive unlinked tools with the same mark
// (AWS, EKS; Grafana, Loki) form a run: the mark is drawn once for the
// run, not once per name. Linked tools stay on their own: each is its own
// target.
function runs(items) {
  const out = [];
  for (const item of items) {
    const prev = out[out.length - 1];
    const mark = item.href ? null : markOf(item.name);
    if (prev && mark && prev.mark === mark) {
      prev.items.push(item);
    } else {
      out.push({ mark, items: [item] });
    }
  }
  return out;
}

function Glyph({ name, inline = false }) {
  const entry = TECH[name];
  const box = inline ? 16 : 22;

  if (!entry || entry.textOnly) {
    // No mark: an empty slot of the mark's size keeps the label in line
    // with its neighbours'. (A two-letter monogram here fell below the
    // 12px text floor.)
    return (
      <span
        className={styles.imgWrap}
        style={{ width: box, height: box }}
        aria-hidden="true"
      />
    );
  }

  if (entry.image) {
    const size = inline ? box : entry.size ?? box;
    if (entry.mono) {
      // Monochrome SVGs (e.g. Cursor) render as a CSS mask so they
      // inherit theme color instead of being locked to black.
      return (
        <span
          className={styles.imgWrap}
          style={{ width: box, height: box }}
          aria-hidden="true"
        >
          <span
            className={styles.maskLogo}
            style={{
              width: size,
              height: size,
              WebkitMaskImage: `url(${entry.image})`,
              maskImage: `url(${entry.image})`,
            }}
          />
        </span>
      );
    }
    return (
      <span
        className={styles.imgWrap}
        style={{ width: box, height: box }}
        aria-hidden="true"
      >
        <img
          className={styles.logo}
          src={entry.image}
          width={size}
          height={size}
          style={{ width: size, height: size }}
          alt=""
          loading="lazy"
        />
      </span>
    );
  }

  const { Icon, color } = entry;
  // Both themes' colors ride as custom properties; the stylesheet picks
  // one by [data-theme], so the server render needs no theme to be right.
  return (
    <Icon
      className={styles.logo}
      style={
        color
          ? {
              '--mark-dark': legible(color, 'dark'),
              '--mark-light': legible(color, 'light'),
            }
          : undefined
      }
      aria-hidden="true"
    />
  );
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// `retired: "2026-05"` (or a full day) reads "May 2026": a month is as
// precise as a stack note needs. Parsed by hand, so no time zone can
// move it into the previous month. `retired: true` gives no date.
function retiredWhen(retired) {
  const match = /^(\d{4})-(\d{2})/.exec(String(retired));
  if (!match) {
    return null;
  }
  return {
    dateTime: `${match[1]}-${match[2]}`,
    text: `${MONTHS[Number(match[2]) - 1]} ${match[1]}`,
  };
}

// "Retired May 2026" under a tool the page lists but no longer runs. The
// hidden comma makes the name read "Longhorn, Retired May 2026".
function RetiredNote({ retired, className }) {
  const when = retiredWhen(retired);
  return (
    <span className={className}>
      <span className={styles.visuallyHidden}>, </span>
      Retired
      {when && (
        <>
          {' '}
          <time dateTime={when.dateTime}>{when.text}</time>
        </>
      )}
    </span>
  );
}

// A tile is a cell of its own, so it always draws its mark: a cell
// without one reads as a missing logo, not as part of a run.
function TechTile({ name, href, retired }) {
  const Wrapper = href ? 'a' : 'div';
  const wrapperProps = href
    ? { href, target: '_blank', rel: 'noopener noreferrer' }
    : {};
  return (
    <Wrapper
      className={`${styles.tile} ${retired ? styles.retired : ''}`}
      {...wrapperProps}
    >
      <Glyph name={name} />
      {retired ? (
        <span className={styles.tileText}>
          <span className={styles.label}>{name}</span>
          <RetiredNote retired={retired} className={styles.retiredNote} />
        </span>
      ) : (
        <span className={styles.label}>{name}</span>
      )}
    </Wrapper>
  );
}

// Props:
//   items: array of strings (looked up in TECH) OR objects { name, href }
//   caption: optional short label rendered above the grid
//   compact: tighter tile sizing for inline use
//   inline: one wrapped line of small labelled marks, no tiles. For pages
//     where the story leads and the stack is a reference, not a feature.
//   An item may carry `retired: "YYYY-MM"` (or `true`): a tool the page
//     still names but no longer runs. It leaves the stack's list and
//     follows it, muted, with "Retired <Month YYYY>" under its name, so the
//     caption ("The stack") only counts what runs today.
export default function TechStackGrid({
  items = [],
  caption,
  compact = false,
  inline = false,
}) {
  const listId = useId();
  const all = items.map((it) => (typeof it === 'string' ? { name: it } : it));
  const normalized = all.filter((it) => !it.retired);
  const retired = all.filter((it) => it.retired);

  if (inline) {
    // A run is one unbreakable mark followed by its names; the wrapper is
    // presentational, so each name is still its own item in the list.
    return (
      <div className={styles.line}>
        {caption && <span className={styles.lineCaption}>{caption}</span>}
        <div
          className={styles.lineList}
          role="list"
          aria-label={caption || undefined}
        >
          {runs(normalized).map(({ items: run }) => {
            const [first] = run;
            if (first.href) {
              return (
                <div key={first.name} role="listitem" className={styles.lineItem}>
                  <a
                    className={styles.mark}
                    href={first.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Glyph name={first.name} inline />
                    <span className={styles.label}>{first.name}</span>
                  </a>
                </div>
              );
            }
            return (
              <div key={first.name} role="none" className={`${styles.lineItem} ${styles.mark}`}>
                <Glyph name={first.name} inline />
                <span role="none" className={styles.runNames}>
                  {run.map((item) => (
                    <span key={item.name} role="listitem" className={styles.label}>
                      {item.name}
                    </span>
                  ))}
                </span>
              </div>
            );
          })}
        </div>
        {retired.length > 0 && (
          <div className={styles.lineList} role="list" aria-label="Retired">
            {retired.map((item) => (
              <div
                key={item.name}
                role="listitem"
                className={`${styles.lineItem} ${styles.mark} ${styles.retired}`}
              >
                <Glyph name={item.name} inline />
                <span className={styles.label}>{item.name}</span>
                <RetiredNote retired={item.retired} className={styles.retiredNote} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const gridClass = `${styles.grid} ${compact ? styles.compact : ''}`;
  return (
    <div className={styles.wrap}>
      {caption && (
        <div className={styles.caption} id={listId}>
          {caption}
        </div>
      )}
      <div
        className={gridClass}
        role="list"
        aria-labelledby={caption ? listId : undefined}
      >
        {normalized.map((item) => (
          <div key={item.name} role="listitem">
            <TechTile {...item} />
          </div>
        ))}
      </div>
      {/* Retired tools close the grid on a row of their own, outside the
          stack's list: each tile already says it is retired, so the list
          needs no visible heading, only a name. */}
      {retired.length > 0 && (
        <div
          className={`${gridClass} ${styles.retiredGrid}`}
          role="list"
          aria-label="Retired"
        >
          {retired.map((item) => (
            <div key={item.name} role="listitem">
              <TechTile {...item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
