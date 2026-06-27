// Authored preview — the top-edge scroll-progress bar (position: fixed; width
// tracks page scroll). Zero width at the top of the page; best seen live.
import { ScrollProgress } from "cjoga-portfolio";

export const Default = () => (
  <div style={{ minHeight: "100vh", background: "var(--bg-void)", position: "relative", padding: 40, fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-secondary)", boxSizing: "border-box" }}>
    <ScrollProgress />
    Scroll-progress indicator — pinned to the top edge; its width grows as the
    reader scrolls the page.
  </div>
);
