// Authored preview — a single timeline entry, composed inside its Timeline.
import { Timeline, TimelineEntry } from "blog-site";

export const Default = () => (
  <Timeline>
    <TimelineEntry year="Apr 2022" title="Hired by Shadow-Soft" emphasis>
      Optional short body under the title for extra context.
    </TimelineEntry>
    <TimelineEntry year="2024" title="Red Hat Certified Engineer" />
  </Timeline>
);
