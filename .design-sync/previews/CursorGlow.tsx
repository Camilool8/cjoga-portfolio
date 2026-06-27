// Authored preview — the accent radial glow that tracks the pointer on desktop
// (position: fixed). Inherently interactive; best seen live.
import { CursorGlow } from "cjoga-portfolio";

export const Default = () => (
  <div style={{ minHeight: "100vh", background: "var(--bg-void)", position: "relative", overflow: "hidden", boxSizing: "border-box" }}>
    <CursorGlow />
    <div style={{ padding: 40, fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-secondary)" }}>
      Pointer-following accent glow (desktop only).
    </div>
  </div>
);
