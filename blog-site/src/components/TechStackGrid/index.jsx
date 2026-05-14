import React from 'react';
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
} from 'react-icons/si';
import {
  VscAzure,
  VscAzureDevops,
  VscTerminalPowershell,
  VscVscode,
  VscTerminal,
} from 'react-icons/vsc';
import styles from './styles.module.css';

// Tool registry — three render shapes:
//   1. { Icon, color }          — react-icons SVG component
//   2. { image }                — <img src>: local path or simple-icons CDN
//   3. { textOnly: true }       — 2-letter monogram chip (last-resort fallback)
//
// Mirrors the react-icons sets the portfolio uses where coverage exists.
// Tools without react-icons coverage use either simple-icons CDN, locally
// hosted SVG/PNG from each project's repo, or a brand-colored FA fallback.
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
  'Entra ID': { Icon: FaMicrosoft, color: '#0078D4' },
  'Key Vault': { Icon: VscAzure, color: '#0078D4' },
  Synapse: { Icon: VscAzure, color: '#0078D4' },
  Proxmox: { Icon: SiProxmox, color: '#E57000' },
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
  Longhorn: { image: 'https://cdn.simpleicons.org/longhorn' },
  OpenBao: { image: 'https://cdn.simpleicons.org/openbao' },
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

  // Lab / certification tooling
  Vagrant: { Icon: SiVagrant, color: '#1868F2' },
  VirtualBox: { Icon: SiVirtualbox, color: '#183A61' },
  RHEL: { Icon: FaRedhat, color: '#EE0000' },
  'Red Hat': { Icon: FaRedhat, color: '#EE0000' },
  Bash: { Icon: SiGnubash, color: '#4EAA25' },
};

function TechTile({ name, href }) {
  const entry = TECH[name];
  const Wrapper = href ? 'a' : 'div';
  const wrapperProps = href
    ? { href, target: '_blank', rel: 'noopener noreferrer' }
    : {};

  let glyph;
  if (!entry || entry.textOnly) {
    glyph = (
      <span className={styles.textChip} aria-hidden="true">
        {name?.slice(0, 2).toUpperCase()}
      </span>
    );
  } else if (entry.image) {
    const size = entry.size ?? 22;
    if (entry.mono) {
      // Monochrome SVGs (e.g. Cursor) render as a CSS mask so they
      // inherit theme color instead of being locked to black.
      glyph = (
        <span
          className={styles.imgWrap}
          style={{ width: 22, height: 22 }}
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
    } else {
      glyph = (
        <span
          className={styles.imgWrap}
          style={{ width: 22, height: 22 }}
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
  } else {
    const { Icon, color } = entry;
    glyph = (
      <Icon
        className={styles.logo}
        style={color ? { color } : undefined}
        aria-hidden="true"
      />
    );
  }

  return (
    <Wrapper className={styles.tile} {...wrapperProps}>
      {glyph}
      <span className={styles.label}>{name}</span>
    </Wrapper>
  );
}

// Props:
//   items: array of strings (looked up in TECH) OR objects { name, href }
//   caption: optional short label rendered above the grid
//   compact: tighter tile sizing for inline use
export default function TechStackGrid({ items = [], caption, compact = false }) {
  const normalized = items.map((it) =>
    typeof it === 'string' ? { name: it } : it,
  );

  return (
    <div className={styles.wrap}>
      {caption && <div className={styles.caption}>{caption}</div>}
      <div
        className={`${styles.grid} ${compact ? styles.compact : ''}`}
        role="list"
      >
        {normalized.map((item) => (
          <div key={item.name} role="listitem">
            <TechTile {...item} />
          </div>
        ))}
      </div>
    </div>
  );
}
