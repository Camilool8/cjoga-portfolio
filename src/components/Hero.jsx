import { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

function Hero() {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [roleIndex, setRoleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [delta, setDelta] = useState(100);

  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 40, damping: 25, mass: 1 });
  const heroOpacity = useTransform(smoothProgress, [0, 0.8], [1, 0]);
  const heroY = useTransform(smoothProgress, [0, 0.8], [0, -60]);
  const gridY = useTransform(smoothProgress, [0, 1], [0, -20]);

  const roles = t("hero.roles", { returnObjects: true });
  const textArray = useMemo(
    () => [...(Array.isArray(roles) ? roles : [])],
    [roles]
  );
  const period = 2000;

  useEffect(() => {
    const tick = () => {
      const i = roleIndex % textArray.length;
      const fullText = textArray[i];
      let nextDelta = 100 - Math.random() * 50;

      if (isDeleting) {
        setText(fullText.substring(0, text.length - 1));
        nextDelta = 50;
      } else {
        setText(fullText.substring(0, text.length + 1));
      }
      setDelta(nextDelta);

      if (!isDeleting && text === fullText) {
        setIsDeleting(true);
        setDelta(period);
      } else if (isDeleting && text === "") {
        setIsDeleting(false);
        setRoleIndex(roleIndex + 1);
        setDelta(500);
      }
    };

    const ticker = setInterval(tick, delta);
    return () => clearInterval(ticker);
  }, [text, delta, isDeleting, roleIndex, textArray]);

  return (
    <section
      ref={heroRef}
      id="hero"
      className="min-h-screen flex flex-col justify-center relative overflow-hidden"
      style={{ background: "var(--gradient-hero)", padding: "100px 0 60px" }}
    >
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          y: gridY,
          backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 100%)",
          opacity: 0.4,
        }}
      />

      <motion.div
        className="section-inner relative z-10"
        style={{ opacity: heroOpacity, y: heroY }}
      >
        <p
          className="mb-5"
          style={{
            fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--accent)",
            opacity: 0, animation: "hReveal 0.6s 0.3s var(--ease-out-expo) forwards",
          }}
        >
          <span style={{ color: "var(--accent)" }}>~/camilo</span> $ whoami
          <span
            className="inline-block ml-0.5 align-text-bottom"
            style={{ width: "8px", height: "1.1em", background: "var(--accent)", animation: "blink 1s step-end infinite" }}
          />
        </p>

        <h1
          style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5.5vw, 3.8rem)",
            fontWeight: 800, lineHeight: 1, letterSpacing: "-0.04em", marginBottom: "8px",
            opacity: 0, animation: "hReveal 0.8s 0.5s var(--ease-out-expo) forwards",
          }}
        >
          Jose Camilo{" "}
          <span
            style={{
              background: "var(--gradient-accent)", WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent", backgroundClip: "text",
              whiteSpace: "nowrap",
            }}
          >
            Joga Guerrero.
          </span>
        </h1>

        <div
          className="min-h-[1.4em]"
          style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(1.2rem, 3.5vw, 2.2rem)",
            fontWeight: 600, color: "var(--text-secondary)", marginBottom: "28px",
            opacity: 0, animation: "hReveal 0.8s 0.7s var(--ease-out-expo) forwards",
          }}
        >
          <span style={{ borderRight: "2px solid var(--accent)", paddingRight: "4px", animation: "blink-border 1s step-end infinite" }}>
            {text}
          </span>
        </div>

        <p
          className="max-w-[560px]"
          style={{
            fontSize: "1.05rem", lineHeight: 1.7, color: "var(--text-secondary)", marginBottom: "40px",
            opacity: 0, animation: "hReveal 0.8s 0.9s var(--ease-out-expo) forwards",
          }}
        >
          {t("hero.description")}
        </p>

        <div
          className="flex gap-4 flex-wrap"
          style={{ opacity: 0, animation: "hReveal 0.8s 1.1s var(--ease-out-expo) forwards" }}
        >
          <a href="#projects" className="btn btn-primary">{t("hero.cta.work")}</a>
          <a href="#contact" className="btn btn-outline">{t("hero.cta.contact")}</a>
        </div>

        <div
          className="flex items-center gap-5 mt-[60px] pt-8 flex-wrap"
          style={{
            borderTop: "1px solid var(--border-subtle)",
            opacity: 0, animation: "hReveal 0.8s 1.4s var(--ease-out-expo) forwards",
          }}
        >
          <div className="flex items-center gap-2" style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-tertiary)" }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
            <span>{t("hero.status.operational", "systems operational")}</span>
          </div>
          <div className="flex items-center gap-2" style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-tertiary)" }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
            <span>{t("hero.status.certs", "10 certs active")}</span>
          </div>
          <div className="flex items-center gap-2" style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-tertiary)" }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--accent-warm)", boxShadow: "0 0 6px var(--accent-warm)" }} />
            <span>{t("hero.status.opportunities", "open to opportunities")}</span>
          </div>
        </div>
      </motion.div>

      <a
        href="#about"
        className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2 cursor-pointer z-10"
        style={{ opacity: 0, animation: "hReveal 0.8s 1.8s var(--ease-out-expo) forwards", textDecoration: "none" }}
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>
          scroll
        </span>
        <div className="relative overflow-hidden" style={{ width: "1px", height: "40px", background: "var(--border-medium)" }}>
          <div className="absolute w-full" style={{ height: "50%", background: "var(--accent)", animation: "scroll-anim 2s ease-in-out infinite" }} />
        </div>
      </a>
    </section>
  );
}

export default Hero;
