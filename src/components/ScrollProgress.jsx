import { useState, useEffect } from "react";

function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      if (totalHeight === 0) return;
      setProgress((window.scrollY / totalHeight) * 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 h-0.5 z-[9999]"
      style={{
        width: `${progress}%`,
        background: "var(--gradient-accent)",
        transformOrigin: "left",
        transition: "width 0.15s linear",
      }}
    />
  );
}

export default ScrollProgress;
