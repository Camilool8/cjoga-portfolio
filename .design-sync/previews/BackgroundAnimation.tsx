// Authored preview — the full-viewport particle canvas that sits behind the page
// (position: fixed, z-0, opacity 0.6). Context copy sits above the field.
import { BackgroundAnimation } from "cjoga-portfolio";

export const Default = () => (
  <div style={{ minHeight: "100vh", background: "var(--bg-void)", position: "relative", overflow: "hidden", boxSizing: "border-box" }}>
    <BackgroundAnimation />
    <div style={{ position: "relative", zIndex: 1, padding: 40, fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-secondary)" }}>
      Animated particle network — rendered behind all page content.
    </div>
  </div>
);
