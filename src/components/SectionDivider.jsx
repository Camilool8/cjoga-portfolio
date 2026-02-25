import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function SectionDivider() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.6, 0]);
  const lineWidth = useTransform(scrollYProgress, [0, 0.5, 1], ["0%", "40%", "0%"]);

  return (
    <div
      ref={ref}
      className="relative h-24 md:h-32 flex items-center justify-center overflow-hidden pointer-events-none"
      style={{ zIndex: 2 }}
    >
      {/* Expanding gradient line */}
      <motion.div
        className="h-px"
        style={{
          width: lineWidth,
          opacity,
          background: "var(--gradient-accent)",
        }}
      />
      {/* Center dot */}
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
