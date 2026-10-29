import { startTransition } from "react";

// Scheduler behind <DeferredSection>. Projects, Certifications and the
// terminal chapter are the heaviest DOM on the page (live tiles, UI
// shots, a second canvas), all below the fold. Mounted in the first
// commit they made one ~200ms task on a throttled phone. Over a
// prerendered page they mount one at a time once the browser is idle
// instead, each in a placeholder that holds its prerendered height, so
// nothing below moves and a link to #contact or a restored scroll
// position still lands where it should. Without a snapshot (dev, or the
// prerender run itself) they mount immediately.

const DEFERRED_IDS = ["projects", "certifications", "terminal-promo"];
const INTENT = ["scroll", "keydown", "hashchange"];

let heights = null;
let flushed = false;
let scheduled = false;
const queue = [];

const idle = (fn) =>
  window.requestIdleCallback
    ? window.requestIdleCallback(fn, { timeout: 1000 })
    : window.setTimeout(fn, 200);

function pump() {
  scheduled = false;
  const next = queue.shift();
  if (next) startTransition(next);
  if (queue.length) {
    scheduled = true;
    idle(pump);
  }
}

// Any sign the visitor is heading down the page mounts everything now.
function flush() {
  flushed = true;
  INTENT.forEach((e) => window.removeEventListener(e, flush));
  while (queue.length) startTransition(queue.shift());
}

// Called by main.jsx before React replaces the prerendered snapshot.
export function captureDeferredHeights(rootEl) {
  if (!rootEl.firstElementChild || window.location.hash) return;
  heights = {};
  DEFERRED_IDS.forEach((id) => {
    heights[id] = document.getElementById(id)?.offsetHeight || 0;
  });
  INTENT.forEach((e) => window.addEventListener(e, flush, { passive: true }));
}

// The height to hold for `id`, or 0 when it should mount right away.
export function deferredHeight(id) {
  return flushed ? 0 : heights?.[id] || 0;
}

export function scheduleMount(mount) {
  if (flushed) {
    startTransition(mount);
    return;
  }
  queue.push(mount);
  if (!scheduled) {
    scheduled = true;
    idle(pump);
  }
}
