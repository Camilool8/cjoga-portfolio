// Authored preview — the animated accent divider between sections. Opacity and
// scale are driven by scroll position, peaking when centered in the viewport, so
// it is placed mid-card here to read.
import { SectionDivider } from "cjoga-portfolio";

export const Default = () => (
  <div style={{ minHeight: "100vh", background: "var(--bg-void)", position: "relative", boxSizing: "border-box" }}>
    <div style={{ height: "38vh" }} />
    <SectionDivider />
  </div>
);
