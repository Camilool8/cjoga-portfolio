// Authored preview — the index-page section grid.
import { SectionCardGrid, SectionCard } from "blog-site";

export const Default = () => (
  <SectionCardGrid>
    <SectionCard href="#" monogram="L" iconColor="#326CE5" title="The Lab" description="The K3s cluster behind cjoga.cloud." />
    <SectionCard href="#" monogram="E" iconColor="#64ffda" title="Engineering" description="Deep dives on infra and platform work." />
    <SectionCard href="#" monogram="M" iconColor="#38bdf8" title="Me" description="Who I am and what I'm building." />
  </SectionCardGrid>
);
