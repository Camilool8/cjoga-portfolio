import { useScroll, useTransform, useSpring, useReducedMotion } from "framer-motion";

export const EASE_SMOOTH = [0.25, 1, 0.5, 1];

export const SPRING_CONFIG = { stiffness: 50, damping: 25, mass: 1 };

// Section reveals support the content, they are not the show: short,
// a small rise, no scale. The hero globe and the stack pipeline's
// signal are the authored moments; everything else just arrives.
export const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: EASE_SMOOTH,
      staggerChildren: 0.08,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_SMOOTH },
  },
};

// Cards stagger as a list, capped so the last of a long grid is not
// left waiting: at most 5 steps of 60ms.
export const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: EASE_SMOOTH,
      delay: Math.min(i, 5) * 0.06,
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
