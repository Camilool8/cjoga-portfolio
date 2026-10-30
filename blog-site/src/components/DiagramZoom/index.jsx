import React, { useCallback, useEffect, useRef, useState } from 'react';
import Lightbox, {
  CLASS_FLEX_CENTER,
  CLASS_SLIDE,
  CloseIcon,
  ImageSlide,
  MODULE_CAROUSEL,
  clsx,
  createModule,
  cssClass,
  isImageSlide,
  useController,
  useLightboxProps,
  useLightboxState,
} from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import 'yet-another-react-lightbox/styles.css';
import { openingLeft } from './entry';

// Mermaid diagrams are rendered to static SVG <img> elements at build time
// (rehype-mermaid, img-svg strategy). This component is the single lightbox
// host mounted once by the mermaidZoom client module — it receives slides
// (the diagram's SVG data URI, upscaled) through the `bind` callback and
// handles zoom/pan/pinch and Escape via yet-another-react-lightbox.
//
// While open, the page behind is inert (no focus, no screen-reader reach)
// and Tab cycles through the toolbar instead of falling back into the
// page. With a pointer the slide opens fit to the screen, so the whole
// flow is in view. On touch, where fit leaves the labels a few pixels
// high, it opens on the start of the flow at a readable size instead:
// its top rank whole, placed to cut as few nodes at the screen's edges as
// it can (openingLeft); one tap goes to the whole flow, and the next tap
// zooms back in on the tapped point. Pinch and drag work as before. A tap
// on the empty backdrop closes it at fit.

// Mermaid draws its labels at 15px; "readable" is where they reach 14px.
const DRAWN_LABEL_PX = 15;
const READABLE_LABEL_PX = 14;
// A finger moves a little during a tap; past this it is a drag.
const TAP_SLOP_PX = 10;
const TAP_MAX_MS = 500;
// A second tap this soon after a toggle is a habitual double-tap: ignore
// it, so the zoom doesn't bounce straight back.
const TAP_GUARD_MS = 350;
// Opening zoomed is only worth it when fit leaves the labels this much
// under the readable size; nearer than that, the whole flow already reads.
const OPEN_ZOOMED_MIN = 1.15;

// The lightbox only ever holds one diagram, so the stock carousel's
// semantics are wrong here: a "Photo gallery" region of "Carousel" slides,
// "1 of 1", with two empty placeholder slides beside it. This replaces the
// carousel module with a single slide in the same classes (layout, swipe
// and the zoom plugin, which renders through render.slide, work as
// before) and no roles: the dialog is named after the diagram and the
// image inside it carries the diagram's alt text.
function SingleSlide() {
  const { slides, currentIndex } = useLightboxState();
  const { setCarouselRef, slideRect } = useController();
  const {
    render,
    carousel: { padding, imageFit, imageProps },
    styles: { slide: style },
  } = useLightboxProps();
  const slide = slides[currentIndex];
  let rendered = slide ? render.slide?.({ slide, offset: 0, rect: slideRect }) : null;
  if (!rendered && slide && isImageSlide(slide)) {
    rendered = (
      <ImageSlide
        slide={slide}
        offset={0}
        render={render}
        rect={slideRect}
        imageFit={imageFit}
        imageProps={imageProps}
      />
    );
  }
  return (
    <div
      ref={setCarouselRef}
      className={clsx(cssClass('carousel'), slide && cssClass('carousel_with_slides'))}
      style={{
        '--yarl__carousel_slides_count': 1,
        '--yarl__carousel_padding_px': parseFloat(padding) || 0,
      }}
    >
      {slide ? (
        <div
          className={clsx(
            cssClass(CLASS_SLIDE),
            cssClass(`${CLASS_SLIDE}_current`),
            cssClass(CLASS_FLEX_CENTER),
          )}
          style={style}
        >
          {rendered}
        </div>
      ) : null}
    </div>
  );
}

// The dialog is named for its diagram. Alts open with a short name and
// go on after a dash ("Homelab ingress flow — internet traffic passes
// …"); the name is enough for the dialog, and the image inside still
// carries the whole alt.
function dialogLabel(slide) {
  if (!slide) return 'Diagram';
  const name = slide.alt.split(/\s+[—–]\s+/)[0].trim();
  return `Diagram: ${name || slide.alt}`;
}

const singleSlide = ({ replace }) =>
  replace(MODULE_CAROUSEL, createModule(MODULE_CAROUSEL, SingleSlide));

const portal = (selector) =>
  document.querySelector(`.yarl__portal_open ${selector}`);

const isBackdrop = (el) =>
  el instanceof HTMLElement &&
  (el.classList.contains('yarl__slide') ||
    el.classList.contains('yarl__slide_wrapper'));

export default function MermaidZoomHost({ bind }) {
  const [slide, setSlide] = useState(null);
  const [zoomed, setZoomed] = useState(false);
  const zoomRef = useRef(null);
  const controllerRef = useRef(null);

  useEffect(() => {
    bind(setSlide);
    return () => bind(null);
  }, [bind]);

  useEffect(() => {
    const root = document.getElementById('__docusaurus');
    if (!slide || !root) return undefined;
    root.inert = true;
    const loopFocus = (event) => {
      if (event.key !== 'Tab') return;
      const buttons = [
        ...document.querySelectorAll('.yarl__portal_open .yarl__button'),
      ].filter((b) => !b.disabled);
      if (!buttons.length) return;
      const i = buttons.indexOf(document.activeElement);
      const next = event.shiftKey
        ? buttons[(i <= 0 ? buttons.length : i) - 1]
        : buttons[(i + 1) % buttons.length];
      event.preventDefault();
      next.focus();
    };
    document.addEventListener('keydown', loopFocus, true);
    // Focus goes back to the diagram that opened it. The lightbox restores
    // focus itself, but it can try while the page is still inert, and a
    // tap doesn't always leave the diagram focused to begin with.
    const {opener} = slide;
    return () => {
      root.inert = false;
      document.removeEventListener('keydown', loopFocus, true);
      requestAnimationFrame(() => {
        const active = document.activeElement;
        if (
          opener?.isConnected &&
          (!active || active === document.body || active.closest('.yarl__portal'))
        ) {
          opener.focus({preventScroll: true});
        }
      });
    };
  }, [slide]);

  // The zoom (from fit) that brings the labels to a readable size, and
  // never below the size the diagram had inline.
  const readableZoom = useCallback(() => {
    const zoom = zoomRef.current;
    const img = portal('.yarl__slide_image');
    if (!zoom || !img || !slide) return 0;
    const fitWidth = img.getBoundingClientRect().width / zoom.zoom;
    if (!(fitWidth > 0)) return 0;
    const readableWidth = Math.max(
      (slide.diagramWidth * READABLE_LABEL_PX) / DRAWN_LABEL_PX,
      slide.inlineWidth || 0,
    );
    return readableWidth / fitWidth;
  }, [slide]);

  // The zoom a tap or the opening goes to.
  const readTarget = useCallback(() => {
    const zoom = zoomRef.current;
    return zoom ? Math.min(Math.max(readableZoom(), 1.5), zoom.maxZoom) : 0;
  }, [readableZoom]);

  // Zoom to that size, centred on a point (the tapped one, or the start
  // of the flow); the plugin keeps the image's edges on screen.
  const zoomToRead = useCallback(
    (clientX, clientY) => {
      const zoom = zoomRef.current;
      const container = portal('.yarl__container');
      if (!zoom || !container || !slide) return;
      const target = readTarget();
      // changeZoom keeps the passed point fixed under the finger; scaling
      // it by z/(z-1) moves the tapped point to the centre instead.
      const box = container.getBoundingClientRect();
      const k = target / (target - 1);
      zoom.changeZoom(
        target,
        false,
        (clientX - box.left - box.width / 2) * k,
        (clientY - box.top - box.height / 2) * k,
      );
    },
    [slide, readTarget],
  );

  // Touch: open on the start of the flow, readable. It waits for the fade
  // in (the whole flow shows for a moment, which says where the start
  // sits), then zooms; the plugin drops the motion under reduced motion.
  useEffect(() => {
    if (
      !slide?.start ||
      typeof window === 'undefined' ||
      !window.matchMedia?.('(pointer: coarse)').matches
    ) {
      return undefined;
    }
    let frame = 0;
    let tries = 0;
    const settle = () => {
      const zoom = zoomRef.current;
      const img = portal('.yarl__slide_image');
      const rect = img?.getBoundingClientRect();
      if (!zoom || zoom.disabled || !(zoom.maxZoom > 1) || !(rect?.width > 0)) {
        if (tries++ < 60) frame = requestAnimationFrame(settle);
        return;
      }
      if (zoom.zoom > 1.01 || readableZoom() < OPEN_ZOOMED_MIN) return;
      // The view's left edge, in the zoomed image's pixels, then the
      // point at its centre back in the fit image's.
      const z = readTarget();
      const view = portal('.yarl__container')?.getBoundingClientRect().width;
      const width = rect.width * z;
      const at = (share) => share * width;
      const {start} = slide;
      const x =
        start.nodes && view > 0
          ? (openingLeft({
              left: at(start.left),
              right: at(start.right),
              nodes: start.nodes.map(([l, r]) => [at(l), at(r)]),
              view,
              max: Math.max(0, width - view),
            }) +
              view / 2) /
            width
          : start.x;
      zoomToRead(rect.left + x * rect.width, rect.top + start.y * rect.height);
    };
    const timer = window.setTimeout(() => {
      frame = requestAnimationFrame(settle);
    }, 260);
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [slide, readableZoom, readTarget, zoomToRead]);

  // Taps are read here, in the capture phase, because the zoom plugin
  // stops pointer events from bubbling while zoomed. Touch taps toggle
  // between fit and readable; any tap on the bare backdrop at fit closes,
  // as closeOnBackdropClick did (it is off, so a tap beside a zoomed
  // diagram returns to fit instead of closing).
  useEffect(() => {
    if (!slide) return undefined;
    const pointers = new Set();
    let start = null;
    let lastToggle = 0;

    const onDown = (event) => {
      if (!event.target.closest?.('.yarl__portal_open')) return;
      pointers.add(event.pointerId);
      start =
        pointers.size === 1 && event.isPrimary
          ? {
              id: event.pointerId,
              x: event.clientX,
              y: event.clientY,
              t: event.timeStamp,
              target: event.target,
            }
          : null;
    };
    const onCancel = (event) => {
      pointers.delete(event.pointerId);
      start = null;
    };
    const onUp = (event) => {
      if (!pointers.delete(event.pointerId)) return;
      const tap = start;
      start = null;
      if (
        !tap ||
        tap.id !== event.pointerId ||
        pointers.size ||
        event.timeStamp - tap.t > TAP_MAX_MS ||
        Math.hypot(event.clientX - tap.x, event.clientY - tap.y) > TAP_SLOP_PX ||
        tap.target.closest('.yarl__toolbar, button')
      ) {
        return;
      }
      const zoom = zoomRef.current;
      const atFit = !zoom || zoom.zoom <= 1.01;
      const touch = event.pointerType === 'touch';
      if (isBackdrop(tap.target) && (atFit || !touch)) {
        controllerRef.current?.close();
        return;
      }
      if (!touch || !zoom || !tap.target.closest('.yarl__slide')) return;
      if (event.timeStamp - lastToggle < TAP_GUARD_MS) return;
      lastToggle = event.timeStamp;
      if (atFit) {
        if (tap.target.classList.contains('yarl__slide_image')) {
          zoomToRead(event.clientX, event.clientY);
        }
      } else {
        zoom.changeZoom(1, false);
      }
    };

    window.addEventListener('pointerdown', onDown, true);
    window.addEventListener('pointerup', onUp, true);
    window.addEventListener('pointercancel', onCancel, true);
    return () => {
      window.removeEventListener('pointerdown', onDown, true);
      window.removeEventListener('pointerup', onUp, true);
      window.removeEventListener('pointercancel', onCancel, true);
    };
  }, [slide, zoomToRead]);

  const handleClose = useCallback(() => {
    setSlide(null);
    setZoomed(false);
  }, []);
  const handleZoom = useCallback(({ zoom }) => setZoomed(zoom > 1.01), []);

  return (
    <Lightbox
      open={Boolean(slide)}
      close={handleClose}
      slides={slide ? [slide] : []}
      plugins={[singleSlide, Zoom, Fullscreen]}
      carousel={{ finite: true, padding: '24px' }}
      labels={{ Lightbox: dialogLabel(slide) }}
      controller={{
        ref: controllerRef,
        closeOnBackdropClick: false,
        closeOnPullDown: true,
      }}
      animation={{ fade: 200, zoom: 300 }}
      on={{ zoom: handleZoom }}
      zoom={{
        ref: zoomRef,
        // The slide is 2400px wide; twice that is ~14x on a phone, ~6x at
        // desktop width.
        maxZoomPixelRatio: 2,
        zoomInMultiplier: 1.5,
        // Touch double-tap is off: a single tap toggles (see above).
        doubleTapDelay: 0,
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
        // An icon alone is a guess on touch, where there is no tooltip
        // and no Esc: the word shows beside the cross there (CSS). The
        // button keeps its "Close" name, which the word matches.
        iconClose: () => (
          <>
            <CloseIcon className="yarl__icon" />
            <span className="mermaid-zoom-close-text" aria-hidden="true">
              Close
            </span>
          </>
        ),
        controls: () => (
          <p className="mermaid-zoom-hint" aria-hidden="true">
            {zoomed ? 'Tap to see the whole flow' : 'Tap the diagram to read it'}
          </p>
        ),
      }}
    />
  );
}
