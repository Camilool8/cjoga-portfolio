import React, { startTransition } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { captureDeferredHeights } from "./utils/deferredMount";
import "./styles/global.css";
import "./utils/i18n.js";

// The first render is a transition, so React builds the page in small
// slices instead of one long task; the prerendered HTML stays on screen
// until the result is ready, and taps in the meantime are not blocked.
// The app re-renders over the prerendered snapshot, which replaces its
// DOM; the hero's CSS entrance would replay on the new nodes. --hero-t
// is how far into that entrance the snapshot already is, and the hero's
// delays subtract it, so the new nodes resume where the old ones were.
const rootEl = document.getElementById("root");
if (rootEl.firstElementChild && window.__t0 !== undefined) {
  const elapsed = (performance.now() - window.__t0) / 1000;
  document.documentElement.style.setProperty("--hero-t", `${elapsed.toFixed(3)}s`);
}
captureDeferredHeights(rootEl);
const root = ReactDOM.createRoot(rootEl);
startTransition(() => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});

// Tells the motion safety net in index.html the app is up, so it leaves
// the reveals to the app.
window.__appReady = true;
