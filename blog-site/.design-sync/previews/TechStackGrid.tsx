// Authored preview — icon grid of the stack. Item names resolve to brand icons.
import { TechStackGrid } from "blog-site";

export const Default = () => (
  <TechStackGrid
    caption="The cjoga.cloud stack"
    items={["Kubernetes", "Terraform", "Ansible", "ArgoCD", "Vault", "Grafana", "Prometheus", "Envoy", "Cilium", "Cloudflare", "Proxmox", "GitLab"]}
  />
);

export const Compact = () => (
  <TechStackGrid compact items={["Kubernetes", "Terraform", "ArgoCD", "Grafana", "Cloudflare"]} />
);
