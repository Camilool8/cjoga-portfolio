import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function TableOfContents({ items }) {
  const [activeId, setActiveId] = useState(null);

  // Track active heading via Intersection Observer
  useEffect(() => {
    const headingElements = items
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);

    if (headingElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 }
    );

    headingElements.forEach((el) => observer.observe(el));

    return () => {
      headingElements.forEach((el) => observer.unobserve(el));
    };
  }, [items]);

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
        className="space-y-1"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {items.map((tocItem, index) => {
          const isActive = activeId === tocItem.id;
          return (
            <motion.li
              key={index}
              className="toc-item relative"
              style={{ paddingLeft: `${(tocItem.level - 2) * 1}rem` }}
              variants={item}
            >
              {/* Active indicator bar */}
              {isActive && (
                <motion.div
                  layoutId="toc-active-indicator"
                  className="absolute left-0 top-0 bottom-0 w-[2px]"
                  style={{ background: "var(--gradient-accent)" }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <button
                onClick={() => scrollToHeading(tocItem.id)}
                className="cursor-pointer text-left w-full py-1 px-2 rounded text-sm"
                style={{
                  fontFamily: "var(--font-body)",
                  color: isActive ? "var(--accent)" : "var(--text-secondary)",
                  fontWeight: isActive ? 500 : 400,
                  background: isActive ? "var(--accent-glow)" : "transparent",
                  transition:
                    "color 0.3s var(--ease-out-expo), background 0.3s var(--ease-out-expo)",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "var(--accent)";
                    e.currentTarget.style.background = "var(--accent-glow)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "var(--text-secondary)";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {tocItem.text}
              </button>
            </motion.li>
          );
        })}
      </motion.ul>
    </nav>
  );
}
