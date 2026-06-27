// Authored preview — the responsive grid of certification badges.
import { CertBadge, CertBadgeGrid } from "blog-site";

export const Default = () => (
  <CertBadgeGrid>
    <CertBadge name="Kubernetes & Cloud Native Associate" issuer="The Linux Foundation" year={2026} status="Active" href="https://www.credly.com/" />
    <CertBadge name="HashiCorp Terraform Associate" issuer="HashiCorp" year={2026} status="Active" />
    <CertBadge name="AWS Solutions Architect – Associate" issuer="Amazon Web Services" year={2025} />
    <CertBadge name="Red Hat Certified Engineer" issuer="Red Hat" year={2024} />
  </CertBadgeGrid>
);
