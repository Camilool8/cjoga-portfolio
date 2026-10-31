import React, { startTransition } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { captureDeferredHeights } from "./utils/deferredMount";
import { markSnapshot } from "./utils/heroEntrance";
import "./styles/global.css";
import "./utils/i18n.js";

// The first render is a transition, so React builds the page in small
// slices instead of one long task; the prerendered HTML stays on screen
// until the result is ready, and taps in the meantime are not blocked.
// The hero resumes its entrance over the snapshot (utils/heroEntrance).
const rootEl = document.getElementById("root");
markSnapshot(rootEl);
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
