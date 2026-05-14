import React from 'react';
import styles from './styles.module.css';

// Registry of tech tools we use across the work + lab pages.
// Keyed by friendly name. Each entry maps to a simple-icons CDN slug + brand
// hex, OR to { textOnly: true } when no clean vendor logo is available.
// Brand hex is hard-coded so logos render with the vendor color, not the
// text-inherited color.
//
// To add a new tool: pick the slug from https://simpleicons.org/ — and
// confirm the hex matches the slug page. If simple-icons doesn't carry it,
// set { textOnly: true } and the tile renders as a mono-cased chip.
const TECH = {
  // Cloud / infra
  AWS: { slug: 'amazonwebservices', hex: 'FF9900' },
  EKS: { slug: 'amazoneks', hex: 'F90' },
  Azure: { slug: 'microsoftazure', hex: '0078D4' },
  AKS: { slug: 'kubernetes', hex: '326CE5' },
  Kubernetes: { slug: 'kubernetes', hex: '326CE5' },
  K3s: { slug: 'kubernetes', hex: '326CE5' },
  Proxmox: { slug: 'proxmox', hex: 'E57000' },
  Cloudflare: { slug: 'cloudflare', hex: 'F38020' },
  Tailscale: { slug: 'tailscale', hex: '242424' },
  "Let's Encrypt": { slug: 'letsencrypt', hex: '003A70' },

  // IaC / config
  Terraform: { slug: 'terraform', hex: '7B42BC' },
  Ansible: { slug: 'ansible', hex: 'EE0000' },
  Bicep: { textOnly: true },

  // GitOps + CI
  FluxCD: { slug: 'flux', hex: '5468FF' },
  ArgoCD: { slug: 'argo', hex: 'EF7B4D' },
  GitLab: { slug: 'gitlab', hex: 'FC6D26' },
  'GitLab CI': { slug: 'gitlab', hex: 'FC6D26' },
  GitHub: { slug: 'github', hex: 'F0F0F0' },
  'Azure DevOps': { slug: 'azuredevops', hex: '0078D7' },

  // Networking / ingress / mesh
  Envoy: { slug: 'envoyproxy', hex: 'AC6199' },
  Cilium: { slug: 'cilium', hex: 'F8C517' },

  // Storage / secrets / TLS
  Longhorn: { textOnly: true },
  OpenBao: { textOnly: true },
  Vault: { slug: 'vault', hex: 'FFEC6E' },
  'External Secrets': { textOnly: true },
  'cert-manager': { textOnly: true },
  'AWS Secrets Manager': { slug: 'amazonwebservices', hex: 'FF9900' },
  'Key Vault': { slug: 'microsoftazure', hex: '0078D4' },

  // Observability
  Grafana: { slug: 'grafana', hex: 'F46800' },
  Loki: { slug: 'grafana', hex: 'F46800' },
  OpenTelemetry: { slug: 'opentelemetry', hex: 'F5A800' },
  Prometheus: { slug: 'prometheus', hex: 'E6522C' },

  // Identity
  'Entra ID': { slug: 'microsoftazure', hex: '0078D4' },
  'AWS Identity Center': { slug: 'amazonwebservices', hex: 'FF9900' },

  // Data
  Databricks: { slug: 'databricks', hex: 'FF3621' },
  Synapse: { slug: 'microsoftazure', hex: '0078D4' },

  // Languages / runtimes
  PowerShell: { slug: 'powershell', hex: '5391FE' },
  '.NET': { slug: 'dotnet', hex: '512BD4' },
  'Vue.js': { slug: 'vuedotjs', hex: '4FC08D' },
  'Three.js': { slug: 'threedotjs', hex: 'F0F0F0' },
  WordPress: { slug: 'wordpress', hex: '21759B' },

  // Other
  'Power Automate': { textOnly: true },
  KubeCost: { textOnly: true },
  Karpenter: { textOnly: true },
};

function TechTile({ name, href }) {
  const entry = TECH[name];
  const Wrapper = href ? 'a' : 'div';
  const wrapperProps = href
    ? { href, target: '_blank', rel: 'noopener noreferrer' }
    : {};

  if (!entry || entry.textOnly) {
    return (
      <Wrapper className={styles.tile} {...wrapperProps}>
        <span className={styles.textChip} aria-hidden="true">
          {name?.slice(0, 2).toUpperCase()}
        </span>
        <span className={styles.label}>{name}</span>
      </Wrapper>
    );
  }

  return (
    <Wrapper className={styles.tile} {...wrapperProps}>
      <img
        className={styles.logo}
        src={`https://cdn.simpleicons.org/${entry.slug}/${entry.hex}`}
        alt=""
        loading="lazy"
      />
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
