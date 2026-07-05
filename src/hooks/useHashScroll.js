import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Scrolls to the element addressed by `location.hash` after navigation.
// React Router doesn't do this natively, so section links like
// `/#about` clicked from `/terminal` used to land at the top of home.
// A short retry loop covers content that mounts lazily after the
// route transition.
const MAX_TRIES = 20;
const RETRY_MS = 50;

export default function useHashScroll() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return undefined;
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return undefined;

    let cancelled = false;
    let tries = 0;
    let timerId = null;

    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? "auto"
      : "smooth";

    const attempt = () => {
      if (cancelled) return;
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior, block: "start" });
        return;
      }
      tries += 1;
      if (tries < MAX_TRIES) {
        timerId = setTimeout(attempt, RETRY_MS);
      }
    };

    const rafId = requestAnimationFrame(attempt);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      if (timerId !== null) clearTimeout(timerId);
    };
  }, [location]);
}
