// Authored preview — the fixed left/right rails (social links + vertical lines)
// shown on wide (xl+) viewports. The rails fade in 2s after load via a CSS
// animation, so a static screenshot does not capture them; context copy stands
// in. Best seen live on a desktop-width viewport.
import { SideElements } from "cjoga-portfolio";

export const Default = () => (
  <div style={{ minHeight: "100vh", background: "var(--bg-void)", position: "relative", boxSizing: "border-box" }}>
    <SideElements />
    <div style={{ padding: 40, fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-secondary)" }}>
      Fixed left / right rails (GitHub · LinkedIn · email + vertical lines), shown
      on xl+ viewports. They fade in 2s after load — best seen live.
    </div>
  </div>
);
