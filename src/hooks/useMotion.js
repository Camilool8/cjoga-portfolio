import { useScroll, useTransform, useSpring, useReducedMotion } from "framer-motion";

export const EASE_SMOOTH = [0.25, 1, 0.5, 1];

export const SPRING_CONFIG = { stiffness: 50, damping: 25, mass: 1 };

export const sectionVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 1.2,
      ease: EASE_SMOOTH,
      staggerChildren: 0.15,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.0, ease: EASE_SMOOTH },
  },
};

export const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.9,
      ease: EASE_SMOOTH,
      delay: i * 0.12,
    },
  }),
};

export function useParallax(ref, distance = 50) {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  const smoothY = useSpring(y, { stiffness: 40, damping: 25, mass: 1.2 });
  return smoothY;
}

export function useSectionScroll(ref, offset = ["start end", "end start"]) {
  const { scrollYProgress } = useScroll({ target: ref, offset });
  return scrollYProgress;
}

export { useReducedMotion };

export const viewportConfig = { once: true, amount: 0.15 };
