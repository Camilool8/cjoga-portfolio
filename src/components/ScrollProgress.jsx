import { m, useScroll, useSpring } from "framer-motion";

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 250,
    damping: 40,
    restDelta: 0.001,
  });

  // Purely decorative — hidden from assistive tech.
  return (
    <m.div
      className="fixed top-0 left-0 right-0 h-0.5 z-[9999] origin-left pointer-events-none"
      style={{
        scaleX,
        background: "var(--gradient-accent)",
        boxShadow: "0 0 12px var(--accent-glow)",
      }}
      aria-hidden="true"
    />
  );
}

export default ScrollProgress;
