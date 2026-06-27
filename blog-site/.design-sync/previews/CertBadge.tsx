// Authored preview — a single certification badge. Issuer drives the vendor icon.
import { CertBadge } from "blog-site";

export const WithVerifyLink = () => (
  <CertBadge
    name="AWS Certified Solutions Architect – Associate"
    issuer="Amazon Web Services"
    year={2025}
    status="Active"
    href="https://www.credly.com/"
  />
);

export const WithNote = () => (
  <CertBadge
    name="Red Hat Certified Engineer"
    issuer="Red Hat"
    year={2024}
    note="Earned via the EX294 Ansible automation exam."
  />
);
