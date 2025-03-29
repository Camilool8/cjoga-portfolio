import React from "react";
import { motion } from "framer-motion";

export default function TableOfContents({ items }) {
  const scrollToHeading = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  };

  return (
    <nav className="toc">
      <motion.ul
        className="space-y-2"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {items.map((item, index) => (
          <motion.li
            key={index}
            className="toc-item"
            style={{ paddingLeft: `${(item.level - 2) * 1}rem` }}
            variants={item}
          >
            <button
              onClick={() => scrollToHeading(item.id)}
              className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-accent dark:hover:text-dark-accent cursor-pointer transition-colors text-left w-full"
            >
              {item.text}
            </button>
          </motion.li>
        ))}
      </motion.ul>
    </nav>
  );
}
