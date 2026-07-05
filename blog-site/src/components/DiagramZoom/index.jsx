import React, { useCallback, useEffect, useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import 'yet-another-react-lightbox/styles.css';

// Mermaid diagrams are rendered to static SVG <img> elements at build time
// (rehype-mermaid, img-svg strategy). This component is the single lightbox
// host mounted once by the mermaidZoom client module — it receives slides
// (the diagram's SVG data URI, upscaled) through the `bind` callback and
// handles zoom/pan/pinch, Escape, and focus via yet-another-react-lightbox.
export default function MermaidZoomHost({ bind }) {
  const [slide, setSlide] = useState(null);

  useEffect(() => {
    bind(setSlide);
    return () => bind(null);
  }, [bind]);

  const handleClose = useCallback(() => setSlide(null), []);

  return (
    <Lightbox
      open={Boolean(slide)}
      close={handleClose}
      slides={slide ? [slide] : []}
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
  );
}
