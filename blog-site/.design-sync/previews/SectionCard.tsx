// Authored preview — a single section card, composed inside its grid for layout.
import { SectionCardGrid, SectionCard } from "blog-site";

export const Default = () => (
  <SectionCardGrid>
    <SectionCard
      href="#"
      monogram="K8s"
      iconColor="#326CE5"
      title="The Lab"
      description="A 6-node K3s cluster split across Proxmox and bare metal."
    />
  </SectionCardGrid>
);
