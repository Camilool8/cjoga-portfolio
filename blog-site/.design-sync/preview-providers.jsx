import React from "react";

// Paints the dark brand surface behind every card. The blog defaults to dark
// mode and :root holds the dark palette, but the preview scaffold forces a
// white body background — this wrapper restores the intended theme.
export function PreviewFrame({ children }) {
  return (
    <div style={{ background: "var(--bg-void)", color: "var(--text-primary)", padding: 28 }}>
      {children}
    </div>
  );
}

export default PreviewFrame;
