// Authored preview — vertical timeline with entries.
import { Timeline, TimelineEntry } from "blog-site";

export const Default = () => (
  <Timeline caption="The short version">
    <TimelineEntry year="2002" title="Born in Santo Domingo" />
    <TimelineEntry year="Jul 2022" title="Joined Shadow-Soft (now Arctiq)" emphasis>
      First full-time DevOps consulting role.
    </TimelineEntry>
    <TimelineEntry year="2024" title="Earned RHCSA + RHCE" />
    <TimelineEntry year="2026" title="Earned KCNA + Terraform Associate" emphasis />
  </Timeline>
);
