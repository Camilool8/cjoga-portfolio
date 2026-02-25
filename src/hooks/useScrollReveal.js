import { useEffect } from "react";

/**
 * Hook that sets up IntersectionObserver for scroll-reveal animations.
 * Elements with the `.reveal` class will get `.visible` added when entering viewport.
 * Uses MutationObserver to catch dynamically added elements.
 */
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
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );

    // Observe all existing .reveal elements
    const observeAll = () => {
      document.querySelectorAll(".reveal:not(.visible)").forEach((el) => {
        observer.observe(el);
      });
    };

    // Initial observe
    observeAll();

    // Watch for new .reveal elements added to the DOM
    const mutationObserver = new MutationObserver((mutations) => {
      let hasNewElements = false;
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          hasNewElements = true;
          break;
        }
      }
      if (hasNewElements) {
        observeAll();
      }
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
}
