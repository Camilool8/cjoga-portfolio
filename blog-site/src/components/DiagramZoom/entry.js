// Where a diagram that is wider than its view opens: the inline card
// (clientModules/mermaidZoom.js, a sideways scroll) and the lightbox on
// touch (DiagramZoom, a zoom to a readable size).
//
// The diagrams flow top to bottom, so the start of the flow is its top
// rank of nodes: both show that rank whole, as near centred as it goes.
// A box cut at the leading edge reads as a broken label ("cale / DNS
// split"), while one cut at the far edge says "more this way".
//
// Everything is in one horizontal axis, in the view's units: the
// content runs from 0 to `max + view`, `left`/`right` are the top rank's
// outer edges, and boxes are [left, right] spans. Each returns the view's
// left edge, from 0 to `max`.
const INSET = 24;
const GAP = 8;

// Positions that keep the top rank whole, or null when it can't fit.
function rankRange({left, right, view, max}) {
  const lo = Math.max(0, right + INSET - view);
  const hi = Math.min(max, left - INSET);
  return lo > hi ? null : [lo, hi];
}

// The card: never with its left edge through a node or subgraph frame
// (`boxes`); when no position does both, it opens at the diagram's left
// edge, where the end fade shows the rest is further on.
export function entryLeft({left, right, boxes, view, max}) {
  const range = rankRange({left, right, view, max});
  if (!range) return 0;
  const [lo, hi] = range;
  // The left edge may sit at or past a box's right side, or a little
  // before its left side, never inside it.
  const clear = (x) => boxes.every(([l, r]) => x <= l - GAP || x >= r);
  const centred = (left + right) / 2 - view / 2;
  const candidates = [Math.min(hi, Math.max(lo, centred)), lo, hi];
  boxes.forEach(([l, r]) => candidates.push(l - GAP, r));
  const best = candidates
    .filter((x) => x >= lo && x <= hi && clear(x))
    .sort((a, b) => Math.abs(a - centred) - Math.abs(b - centred))[0];
  return best === undefined ? 0 : best;
}

// The lightbox: zoomed to read, a diagram is often wider than the screen
// at every position, and a subgraph frame wider than the screen is cut
// wherever it sits; so the top rank is kept whole (when it fits), and
// among those positions the one that cuts the fewest nodes (`nodes`),
// a cut at the left edge counting double, then the one nearest centred.
// A rank too wide for the screen opens at the diagram's left edge.
export function openingLeft({left, right, nodes, view, max}) {
  const range = rankRange({left, right, view, max});
  if (!range) return 0;
  const [lo, hi] = range;
  // A node wider than the screen is cut wherever it sits.
  const fits = nodes.filter(([l, r]) => r - l <= view);
  // An edge cuts a node it runs through, or one it leaves no air beside.
  const leftCuts = (x) => fits.filter(([l, r]) => x > l - GAP && x < r).length;
  const rightCuts = (x) => fits.filter(([l, r]) => x > l && x < r + GAP).length;
  const cost = (x) => 2 * leftCuts(x) + rightCuts(x + view);
  const centred = (left + right) / 2 - view / 2;
  const candidates = [Math.min(hi, Math.max(lo, centred)), lo, hi];
  fits.forEach(([l, r]) => {
    candidates.push(l - GAP, r, l - view, r + GAP - view);
  });
  return candidates
    .filter((x) => x >= lo && x <= hi)
    .map((x) => [x, cost(x), Math.abs(x - centred)])
    .sort((a, b) => a[1] - b[1] || a[2] - b[2])[0][0];
}
