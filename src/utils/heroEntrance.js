// The app re-renders over the prerendered snapshot, which replaces its
// DOM; the hero's CSS entrance would replay on the new nodes. --hero-t
// is how far into that entrance the snapshot already is, and the hero's
// delays subtract it, so the new nodes resume where the old ones were.
//
// It has to be measured when React swaps the DOM, not when the bundle
// loads: the first render is a transition and can land hundreds of ms
// later on a phone, and the gap played as a second entrance.

let fromSnapshot = false;

// Called by main.jsx before React replaces the prerendered snapshot.
export function markSnapshot(rootEl) {
  fromSnapshot = !!rootEl.firstElementChild && window.__t0 !== undefined;
}

// Called from the hero's layout effect: after the swap, before paint.
export function resumeHeroEntrance() {
  if (!fromSnapshot) return;
  fromSnapshot = false;
  const elapsed = (performance.now() - window.__t0) / 1000;
  document.documentElement.style.setProperty("--hero-t", `${elapsed.toFixed(3)}s`);
}
