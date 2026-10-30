// Client module: binds click-to-zoom onto the build-time-rendered mermaid
// diagrams. The zoom wrapper (`div.mermaid-zoom-wrap`, role=button) is emitted
// at BUILD time by the rehypeMermaidDiagrams pass in docusaurus.config.js, so
// this module never restructures the DOM. Here we only: attach the
// absolutely-positioned affordance (out of flow → no shift) and wire
// click/Enter/Space to open a single shared yet-another-react-lightbox host
// (DiagramZoom) mounted outside the app root. The host is dynamically imported
// the first time a page with diagrams is seen. `onRouteDidUpdate` rebinds after
// client-side navigations; already-bound wrappers are skipped via a data
// attribute.

import React from 'react';
import { createRoot } from 'react-dom/client';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
// Static import so the global card/wrap/affordance CSS ships in the main
// stylesheet and applies pre-JS.
import '@site/src/components/DiagramZoom/styles.module.css';
import { entryLeft } from '@site/src/components/DiagramZoom/entry';

// Target natural width for the lightbox slide. The SVG data URI scales
// losslessly, and the upscale makes the lightbox's fit-to-viewport open at
// a meaningful size on desktop and mobile alike.
const TARGET_SLIDE_WIDTH = 2400;

const EXPAND_ICON =
  '<svg viewBox="0 0 448 512" aria-hidden="true" focusable="false">' +
  '<path d="M32 32C14.3 32 0 46.3 0 64v96c0 17.7 14.3 32 32 32s32-14.3 32-32V96h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H64v-64zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32V64c0-17.7-14.3-32-32-32h-96zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v64h-64c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32v-96z"/>' +
  '</svg>';

let openSlide = null;
let pendingSlide = null;
let hostPromise = null;

function ensureHost() {
  if (!hostPromise) {
    hostPromise = import('@site/src/components/DiagramZoom').then(
      ({ default: MermaidZoomHost }) => {
        const container = document.createElement('div');
        container.id = 'mermaid-zoom-host';
        document.body.appendChild(container);
        createRoot(container).render(
          React.createElement(MermaidZoomHost, {
            bind: (setSlide) => {
              openSlide = setSlide;
              if (setSlide && pendingSlide) {
                setSlide(pendingSlide);
                pendingSlide = null;
              }
            },
          }),
        );
      },
    );
  }
  return hostPromise;
}

// The SVG is width=100% with a viewBox, so as an <img> it reports a
// 150px-high placeholder size, and the zoom plugin sizes its pan limits
// from that: it could not pan at all. Give the slide's copy a real pixel
// size.
function sizedSrc(src, width, height) {
  const comma = src.indexOf(',');
  if (!src.startsWith('data:image/svg+xml') || comma < 0) return src;
  const svg = decodeURIComponent(src.slice(comma + 1));
  const sized = svg.replace(
    /^(<svg\b[^>]*?)\swidth=(['"])100%\2/,
    `$1 width='${width}' height='${height}'`,
  );
  return src.slice(0, comma + 1) + encodeURIComponent(sized);
}

function buildSlide(img) {
  // naturalWidth is that placeholder too; the attributes carry the drawn
  // size.
  const drawnWidth =
    parseFloat(img.getAttribute('width')) || img.naturalWidth || 800;
  const drawnHeight =
    parseFloat(img.getAttribute('height')) || img.naturalHeight || 600;
  const height = Math.round(TARGET_SLIDE_WIDTH * (drawnHeight / drawnWidth));
  // Where the flow starts (the middle of its top rank), as a share of the
  // image's width and height: on touch the lightbox opens there, zoomed
  // to read. The rank's edges and every node come along (shares of the
  // width), so the lightbox can keep the rank whole and cut as few nodes
  // as it can (openingLeft).
  const flow = parseFlow(img);
  let start = null;
  if (flow) {
    const [x0, y0, w, h] = flow.viewBox;
    const rank = topRank(flow.nodes);
    const share = (x) => (x - x0) / w;
    start = {
      x: share((rank.left + rank.right) / 2),
      y: (rank.y - y0) / h,
      left: share(rank.left),
      right: share(rank.right),
      nodes: flow.nodes.map(({left, right}) => [share(left), share(right)]),
    };
  }
  return {
    start,
    src: sizedSrc(img.currentSrc || img.src, TARGET_SLIDE_WIDTH, height),
    alt: img.alt || 'Diagram',
    width: TARGET_SLIDE_WIDTH,
    height,
    // Labels are drawn at 15px at this width; the tap-to-read zoom uses it.
    diagramWidth: drawnWidth,
    // The size it had on the page; tap-to-read never lands smaller.
    inlineWidth: img.getBoundingClientRect().width,
  };
}

// A diagram wider than its card scrolls sideways. The edge where part of
// it is hidden fades out (a mask on the images, set in card coordinates
// from the scroll position, so the card's border and ground stay solid),
// and the badge is held in the card's corner while the content scrolls.
function trackOverflow(wrap, visibleImg) {
  let frame = 0;
  const update = () => {
    frame = 0;
    const img = visibleImg();
    const x = wrap.scrollLeft;
    const max = wrap.scrollWidth - wrap.clientWidth;
    const overflows = max > 1;
    wrap.style.setProperty('--mz-scroll', `${x}px`);
    wrap.style.setProperty('--mz-from', `${x - img.offsetLeft}px`);
    wrap.style.setProperty(
      '--mz-to',
      `${x + wrap.clientWidth - img.offsetLeft}px`,
    );
    wrap.toggleAttribute('data-fade-start', overflows && x > 1);
    wrap.toggleAttribute('data-fade-end', overflows && x < max - 1);
  };
  const schedule = () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  };
  wrap.addEventListener('scroll', schedule, { passive: true });
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(schedule).observe(wrap);
  }
  update();
}

// Where a sideways-scrolling diagram opens: the top rank whole, and the
// card's left edge never through a node or subgraph (entryLeft, beside
// the lightbox's own rule); a box cut at the far edge sits under the end
// fade, which says "more this way". The drawn SVG is in the data URI; node
// centres are the sum of the group translates above them. Anything that
// isn't a flowchart opens at its left edge.
const TRANSLATE = /translate\(\s*(-?[\d.e]+)[\s,]+(-?[\d.e]+)/;

function offsetOf(el, svg) {
  let x = 0;
  let y = 0;
  for (let node = el; node && node !== svg; node = node.parentElement) {
    const m = TRANSLATE.exec(node.getAttribute('transform') || '');
    if (m) {
      x += parseFloat(m[1]);
      y += parseFloat(m[2]);
    }
  }
  return {x, y};
}

// The flowchart in an <img>'s SVG data URI: its viewBox, its nodes
// (drawn box edges and centre y) and every box a card edge must not cut
// (nodes and subgraph frames), all in SVG units. Null for anything that
// isn't a flowchart.
function parseFlow(img) {
  const src = img.currentSrc || img.src;
  const comma = src.indexOf(',');
  if (!src.startsWith('data:image/svg+xml') || comma < 0) return null;
  let svg;
  try {
    svg = new DOMParser().parseFromString(
      decodeURIComponent(src.slice(comma + 1)),
      'image/svg+xml',
    ).documentElement;
  } catch {
    return null;
  }
  const viewBox = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
  if (viewBox.length !== 4 || !(viewBox[2] > 0) || !(viewBox[3] > 0)) return null;

  const nodes = [...svg.querySelectorAll('g.node')].map((node) => {
    const {x, y} = offsetOf(node, svg);
    // The drawn box when the shape is a rect; otherwise the label group
    // (which sits at minus half its size) plus the flowchart padding.
    const rect = node.querySelector(':scope > rect');
    const width = parseFloat(rect?.getAttribute('width'));
    const label = TRANSLATE.exec(
      node.querySelector('g.label')?.getAttribute('transform') || '',
    );
    const half =
      width > 0 ? width / 2 : (label ? Math.abs(parseFloat(label[1])) : 0) + 16;
    return {left: x - half, right: x + half, y};
  });
  if (!nodes.length) return null;
  // Subgraph frames are drawn in place (x is their left edge).
  const boxes = nodes.map(({left, right}) => ({left, right}));
  svg.querySelectorAll('g.cluster > rect').forEach((rect) => {
    const x = offsetOf(rect, svg).x + parseFloat(rect.getAttribute('x'));
    const width = parseFloat(rect.getAttribute('width'));
    if (Number.isFinite(x) && width > 0) boxes.push({left: x, right: x + width});
  });
  return {viewBox, nodes, boxes};
}

// The start of the flow: its top rank of nodes, side by side.
function topRank(nodes) {
  const top = Math.min(...nodes.map((n) => n.y));
  const rank = nodes.filter((n) => n.y - top < 8);
  return {
    left: Math.min(...rank.map((n) => n.left)),
    right: Math.max(...rank.map((n) => n.right)),
    y: top,
  };
}

function entryScroll(wrap, img) {
  const flow = parseFlow(img);
  if (!flow) return 0;
  const {viewBox, nodes, boxes} = flow;

  // In scrollLeft coordinates.
  const scale = img.getBoundingClientRect().width / viewBox[2];
  const toScroll = (svgX) => img.offsetLeft + (svgX - viewBox[0]) * scale;
  const rank = topRank(nodes);
  const best = entryLeft({
    left: toScroll(rank.left),
    right: toScroll(rank.right),
    boxes: boxes.map((b) => [toScroll(b.left), toScroll(b.right)]),
    view: wrap.clientWidth,
    max: wrap.scrollWidth - wrap.clientWidth,
  });
  // Scrolling only into the card's padding hides nothing and would just
  // light the start fade.
  return best <= img.offsetLeft ? 0 : Math.round(best);
}

function bindWrap(wrap) {
  wrap.setAttribute('data-zoom-bound', 'true');

  // Two renders per diagram (light and dark); zoom whichever is showing.
  const visibleImg = () =>
    [...wrap.querySelectorAll('img.mermaid-diagram')].find(
      (el) => el.offsetParent !== null,
    ) || wrap.querySelector('img.mermaid-diagram');
  if (!visibleImg()) return;

  // On a narrow screen the diagram keeps a readable size and the card
  // scrolls sideways; open it on the start of the flow.
  if (wrap.scrollWidth > wrap.clientWidth) {
    wrap.scrollLeft = entryScroll(wrap, visibleImg());
  }
  trackOverflow(wrap, visibleImg);

  // The affordance is position:absolute (out of flow), so appending it never
  // shifts layout — unlike moving the img itself.
  const affordance = document.createElement('div');
  affordance.className = 'mermaid-zoom-affordance';
  affordance.setAttribute('aria-hidden', 'true');
  affordance.innerHTML = `${EXPAND_ICON}<span class="mermaid-zoom-affordance-text">Open diagram</span>`;
  wrap.appendChild(affordance);

  const open = () => {
    const slide = {...buildSlide(visibleImg()), opener: wrap};
    if (openSlide) {
      openSlide(slide);
    } else {
      pendingSlide = slide;
      ensureHost();
    }
  };
  wrap.addEventListener('click', open);
  wrap.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      open();
    }
  });
}

function bindAll() {
  const wraps = document.querySelectorAll(
    '.mermaid-zoom-wrap:not([data-zoom-bound])',
  );
  if (!wraps.length) {
    return;
  }
  // Warm the lightbox host so the first click opens instantly.
  ensureHost();
  wraps.forEach(bindWrap);
}

// Diagrams ship loading=lazy; printing from the dark theme shows the
// light copy, which may never have loaded. Load every copy before print.
if (ExecutionEnvironment.canUseDOM) {
  window.addEventListener('beforeprint', () => {
    document.querySelectorAll('img.mermaid-diagram[loading="lazy"]').forEach((img) => {
      img.loading = 'eager';
    });
  });
}

export function onRouteDidUpdate() {
  if (!ExecutionEnvironment.canUseDOM) {
    return;
  }
  // The route's DOM is committed by now; rAF avoids racing hydration work.
  window.requestAnimationFrame(bindAll);
}
