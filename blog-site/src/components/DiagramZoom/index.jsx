import React, { useState, useRef, useCallback, useEffect } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import 'yet-another-react-lightbox/styles.css';
import { FaExpand } from 'react-icons/fa';
import styles from './styles.module.css';

// Target SVG natural width when serializing. Mermaid emits tiny dimensions
// (often 400-800px wide); we upscale so the lightbox renders at a meaningful
// fit-to-viewport size. No artificial initial zoom on top — the upscale
// alone produces the right opening state across desktop and mobile.
const TARGET_SVG_WIDTH = 2400;

// Wraps any diagram (mermaid SVG, image, custom) with a hover affordance
// and an off-the-shelf lightbox for zoom/pan/pinch. The library handles
// every interaction — we just hand it a slide.
export default function DiagramZoom({ children, ariaLabel = 'Diagram' }) {
  const [open, setOpen] = useState(false);
  const [slideSrc, setSlideSrc] = useState(null);
  const [slideSize, setSlideSize] = useState({
    width: undefined,
    height: undefined,
  });
  const containerRef = useRef(null);

  const buildSlide = useCallback(() => {
    const root = containerRef.current;
    if (!root) return null;
    const svg = root.querySelector('svg');
    if (!svg) return null;

    const clone = svg.cloneNode(true);
    if (!clone.getAttribute('xmlns')) {
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }
    if (!clone.getAttribute('xmlns:xlink')) {
      clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    }

    // Upscale: give the SVG a large natural size so the lightbox's
    // fit-to-viewport produces a sharp, large render.
    let targetWidth = TARGET_SVG_WIDTH;
    let targetHeight;
    const viewBox = clone.getAttribute('viewBox');
    if (viewBox) {
      const parts = viewBox.split(/\s+/).map(Number);
      if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
        const aspect = parts[2] / parts[3];
        targetHeight = Math.round(targetWidth / aspect);
      }
    }
    if (!targetHeight) {
      const w = parseFloat(clone.getAttribute('width')) || 800;
      const h = parseFloat(clone.getAttribute('height')) || 600;
      const aspect = w / h;
      targetHeight = Math.round(targetWidth / aspect);
    }
    clone.setAttribute('width', String(targetWidth));
    clone.setAttribute('height', String(targetHeight));

    const str = new XMLSerializer().serializeToString(clone);
    const encoded = encodeURIComponent(str)
      .replace(/'/g, '%27')
      .replace(/"/g, '%22');
    return {
      src: `data:image/svg+xml;charset=utf-8,${encoded}`,
      width: targetWidth,
      height: targetHeight,
    };
  }, []);

  const handleOpen = useCallback(() => {
    const slide = buildSlide();
    if (!slide) return;
    setSlideSrc(slide.src);
    setSlideSize({ width: slide.width, height: slide.height });
    setOpen(true);
  }, [buildSlide]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => setSlideSrc(null), 400);
    return () => clearTimeout(t);
  }, [open]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleOpen();
      }
    },
    [handleOpen],
  );

  return (
    <>
      <div
        ref={containerRef}
        className={styles.inlineWrap}
        role="button"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={handleKeyDown}
        aria-label={`${ariaLabel} — open in zoom view`}
      >
        {children}
        <div className={styles.affordance} aria-hidden="true">
          <FaExpand />
          <span className={styles.affordanceText}>Click to zoom</span>
        </div>
      </div>

      <Lightbox
        open={open}
        close={handleClose}
        slides={
          slideSrc
            ? [
                {
                  src: slideSrc,
                  alt: ariaLabel,
                  width: slideSize.width,
                  height: slideSize.height,
                },
              ]
            : []
        }
        plugins={[Zoom, Fullscreen]}
        carousel={{ finite: true, padding: '24px' }}
        controller={{ closeOnBackdropClick: true, closeOnPullDown: true }}
        animation={{ fade: 200, zoom: 300 }}
        zoom={{
          maxZoomPixelRatio: 5,
          zoomInMultiplier: 1.5,
          doubleTapDelay: 300,
          doubleClickDelay: 300,
          doubleClickMaxStops: 2,
          keyboardMoveDistance: 50,
          wheelZoomDistanceFactor: 100,
          pinchZoomDistanceFactor: 100,
          scrollToZoom: true,
        }}
        render={{
          buttonPrev: () => null,
          buttonNext: () => null,
        }}
        styles={{
          container: { backgroundColor: 'rgba(5, 8, 12, 0.94)' },
        }}
      />
    </>
  );
}
