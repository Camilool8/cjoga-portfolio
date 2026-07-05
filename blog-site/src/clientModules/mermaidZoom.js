// Client module: binds click-to-zoom onto the build-time-rendered mermaid
// diagrams (rehype-mermaid `img-svg` output — `img.mermaid-diagram`, class
// added by the rehypeMermaidImgAlt pass in docusaurus.config.js).
//
// Each diagram img gets wrapped in a keyboard-operable button-role element
// with the hover affordance; clicks/Enter/Space open a single shared
// yet-another-react-lightbox host (DiagramZoom) mounted outside the
// Docusaurus app root. The host (and the lightbox library with it) is
// dynamically imported the first time a page with diagrams is seen, so
// diagram-free pages never pay for it. `onRouteDidUpdate` rebinds after
// client-side navigations; already-bound imgs are skipped via a data
// attribute.

import React from 'react';
import { createRoot } from 'react-dom/client';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
// Static import so the global card CSS (img.mermaid-diagram) ships in the
// main stylesheet and applies pre-JS.
import styles from '@site/src/components/DiagramZoom/styles.module.css';

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

function buildSlide(img) {
  const naturalWidth =
    img.naturalWidth || parseFloat(img.getAttribute('width')) || 800;
  const naturalHeight =
    img.naturalHeight || parseFloat(img.getAttribute('height')) || 600;
  const height = Math.round(
    TARGET_SLIDE_WIDTH * (naturalHeight / naturalWidth),
  );
  return {
    src: img.currentSrc || img.src,
    alt: img.alt || 'Diagram',
    width: TARGET_SLIDE_WIDTH,
    height,
  };
}

function bindDiagram(img) {
  img.setAttribute('data-zoom-bound', 'true');

  const wrap = document.createElement('div');
  wrap.className = styles.inlineWrap;
  wrap.setAttribute('role', 'button');
  wrap.tabIndex = 0;
  wrap.setAttribute(
    'aria-label',
    `${img.alt || 'Diagram'} — open in zoom view`,
  );

  img.parentNode.insertBefore(wrap, img);
  wrap.appendChild(img);

  const affordance = document.createElement('div');
  affordance.className = styles.affordance;
  affordance.setAttribute('aria-hidden', 'true');
  affordance.innerHTML = `${EXPAND_ICON}<span class="${styles.affordanceText}">Click to zoom</span>`;
  wrap.appendChild(affordance);

  const open = () => {
    const slide = buildSlide(img);
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
  const diagrams = document.querySelectorAll(
    'img.mermaid-diagram:not([data-zoom-bound])',
  );
  if (!diagrams.length) {
    return;
  }
  // Warm the lightbox host so the first click opens instantly.
  ensureHost();
  diagrams.forEach(bindDiagram);
}

export function onRouteDidUpdate() {
  if (!ExecutionEnvironment.canUseDOM) {
    return;
  }
  // The route's DOM is committed by now; rAF avoids racing hydration work.
  window.requestAnimationFrame(bindAll);
}
