import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function SectionDivider() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // scaleX is a compositor-only transform — no layout recalc per frame.
  // width: 40% baseline + scaleX 0→1→0 yields the same visual effect.
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.6, 0]);
  const scaleX = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);

  return (
    <div
      ref={ref}
      className="relative h-24 md:h-32 flex items-center justify-center overflow-hidden pointer-events-none"
      style={{ zIndex: 2 }}
      aria-hidden="true"
    >
      <motion.div
        className="h-px"
        style={{
          width: "40%",
          transformOrigin: "center",
          scaleX,
          opacity,
          background: "var(--gradient-accent)",
        }}
      />
      <motion.div
        className="absolute w-1 h-1 rounded-full"
        style={{
          background: "var(--accent)",
          opacity,
          boxShadow: "0 0 10px var(--accent)",
        }}
      />
    </div>
  );
}
