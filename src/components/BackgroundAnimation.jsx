import { useEffect, useRef } from "react";

function BackgroundAnimation({ theme }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let particles = [];
    let animationId = null;
    let running = false;

    const isCoarsePointer = window.matchMedia(
      "(pointer: coarse), (max-width: 768px)",
    ).matches;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Mobile/tablet pays a smaller particle tax; reduced-motion gets none.
    const targetCount = reducedMotion
      ? 0
      : isCoarsePointer
        ? Math.min(Math.max(window.innerWidth / 40, 14), 22)
        : Math.min(Math.max(window.innerWidth / 20, 30), 60);
    const linkDistance = isCoarsePointer ? 100 : 150;
    const speedScale = isCoarsePointer ? 0.6 : 1;

    const getParticleColor = () => {
      const style = getComputedStyle(document.documentElement);
      return style.getPropertyValue("--particle-color").trim() || "100, 255, 218";
    };

    let particleColor = getParticleColor();

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const createParticles = () => {
      particles = [];
      const w = window.innerWidth;
      const h = window.innerHeight;
      for (let i = 0; i < targetCount; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: 2 + Math.random() * 2,
          speedX: (Math.random() - 0.5) * 0.5 * speedScale,
          speedY: (Math.random() - 0.5) * 0.5 * speedScale,
          opacity: 0.1 + Math.random() * 0.1,
        });
      }
    };

    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particleColor},${p.opacity})`;
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          // Skip sqrt unless within bounding box — cheap early-out
          if (Math.abs(dx) > linkDistance || Math.abs(dy) > linkDistance) continue;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < linkDistance) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${particleColor},${0.03 * (1 - distance / linkDistance)})`;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    const start = () => {
      if (running || targetCount === 0) return;
      running = true;
      animationId = requestAnimationFrame(animate);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      if (animationId) cancelAnimationFrame(animationId);
      animationId = null;
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    particleColor = getParticleColor();
    createParticles();
    if (!document.hidden && targetCount > 0) start();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-0"
      style={{ pointerEvents: "none", opacity: 0.6 }}
      aria-hidden="true"
    />
  );
}

export default BackgroundAnimation;
