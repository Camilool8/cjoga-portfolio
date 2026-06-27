// Authored preview — the fixed top navigation bar. A full-height dark card so the
// bar (position: fixed) sits at the top edge against the page theme.
import { NavigationBar } from "cjoga-portfolio";

export const Default = () => (
  <div style={{ minHeight: "100vh", background: "var(--bg-void)", position: "relative", boxSizing: "border-box" }}>
    <NavigationBar />
  </div>
);
