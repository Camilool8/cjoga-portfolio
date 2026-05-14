import { useEffect } from "react";

// Reveal-on-scroll for elements with `.reveal`. Observes once on mount;
// React-mounted components added later are picked up by a single rAF-debounced
// re-scan triggered from a lightweight childList observer on the app root.
// (Previous version watched the entire body subtree, which fired on every
// keystroke and tooltip mutation — a constant tax even when nothing was
// actually revealing.)
export default function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" },
    );

    const observeAll = () => {
      document
        .querySelectorAll(".reveal:not(.visible)")
        .forEach((el) => observer.observe(el));
    };

    observeAll();

    // Re-scan when sections of the page swap (route change, async content).
    // Scoped to the React root and debounced to one rAF.
    const root = document.getElementById("root") || document.body;
    let rafId = null;
    const scheduleScan = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        observeAll();
      });
    };

    const mutationObserver = new MutationObserver(scheduleScan);
    mutationObserver.observe(root, { childList: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);
}
