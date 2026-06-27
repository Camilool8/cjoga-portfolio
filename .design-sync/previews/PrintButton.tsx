// Authored preview — the floating "Download CV" button (position: fixed,
// bottom-right). The PDF it generates is Node-only and stubbed here; the styled
// control itself is the card.
import { PrintButton } from "cjoga-portfolio";

export const Default = () => (
  <div style={{ minHeight: "100vh", background: "var(--bg-void)", position: "relative", boxSizing: "border-box" }}>
    <PrintButton />
  </div>
);
