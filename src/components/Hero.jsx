import { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { EASE_SMOOTH } from "../hooks/useMotion";

function BlurWords({ words, baseDelay = 0, className = "", style = {} }) {
  const reduced = useReducedMotion();
  return words.map((word, i) => (
    <motion.span
      key={`${word}-${i}`}
      className={className}
      style={{
        display: "inline-block",
        marginRight: i === words.length - 1 ? 0 : "0.22em",
        willChange: "filter, transform, opacity",
        ...style,
      }}
      initial={
        reduced
          ? { opacity: 0 }
          : { opacity: 0, filter: "blur(12px)", y: -14 }
      }
      animate={
        reduced
          ? { opacity: 1 }
          : { opacity: 1, filter: "blur(0px)", y: 0 }
      }
      transition={{
        duration: 0.7,
        delay: baseDelay + i * 0.11,
        ease: EASE_SMOOTH,
      }}
    >
      {word}
    </motion.span>
  ));
}

function Hero() {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const [text, setText] = useState("");
  const [roleIndex, setRoleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [delta, setDelta] = useState(100);

  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 40,
    damping: 25,
    mass: 1,
  });
  const heroOpacity = useTransform(smoothProgress, [0, 0.8], [1, 0]);
  const heroY = useTransform(smoothProgress, [0, 0.8], [0, -60]);
  const gridY = useTransform(smoothProgress, [0, 1], [0, -20]);

  const roles = t("hero.roles", { returnObjects: true });
  const textArray = useMemo(
    () => [...(Array.isArray(roles) ? roles : [])],
    [roles],
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
        aria-hidden="true"
        className="absolute pointer-events-none"
        initial={reduced ? { opacity: 0.4, scale: 1 } : { opacity: 0, scale: 0.6 }}
        animate={{ opacity: 0.45, scale: 1 }}
        transition={{ duration: reduced ? 0 : 1.6, ease: EASE_SMOOTH }}
        style={{
          top: "-15%",
          left: "-10%",
          width: "55vw",
          height: "55vw",
          maxWidth: "780px",
          maxHeight: "780px",
          background:
            "radial-gradient(circle at center, var(--accent) 0%, transparent 65%)",
          filter: "blur(120px)",
          willChange: "transform, opacity",
        }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute pointer-events-none"
        initial={reduced ? { opacity: 0.25, scale: 1 } : { opacity: 0, scale: 0.6 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ duration: reduced ? 0 : 1.8, delay: 0.2, ease: EASE_SMOOTH }}
        style={{
          bottom: "-20%",
          right: "-10%",
          width: "60vw",
          height: "60vw",
          maxWidth: "880px",
          maxHeight: "880px",
          background:
            "radial-gradient(circle at center, var(--accent-warm) 0%, transparent 65%)",
          filter: "blur(140px)",
          willChange: "transform, opacity",
        }}
      />

      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          y: gridY,
          backgroundImage:
            "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 100%)",
          opacity: 0.4,
        }}
        aria-hidden="true"
      />

      <motion.div
        className="section-inner relative z-10"
        style={{ opacity: heroOpacity, y: heroY }}
      >
        <p
          className="mb-5"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.85rem",
            color: "var(--accent)",
            opacity: 0,
            animation: "hReveal 0.6s 0.3s var(--ease-out-expo) forwards",
          }}
        >
          <span style={{ color: "var(--accent)" }}>~/camilo</span> $ whoami
          <span
            className="inline-block ml-0.5 align-text-bottom"
            style={{
              width: "8px",
              height: "1.1em",
              background: "var(--accent)",
              animation: "blink 1s step-end infinite",
            }}
            aria-hidden="true"
          />
        </p>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 5.5vw, 3.8rem)",
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            marginBottom: "8px",
            textWrap: "balance",
          }}
        >
          <BlurWords words={["Jose", "Camilo"]} baseDelay={0.45} />
          <BlurWords
            words={["Joga", "Guerrero."]}
            baseDelay={0.7}
            style={{
              background: "var(--gradient-accent)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          />
        </h1>

        <div
          className="min-h[1.4em]"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.2rem, 3.5vw, 2.2rem)",
            fontWeight: 600,
            color: "var(--text-secondary)",
            marginBottom: "28px",
            opacity: 0,
            animation: "hReveal 0.8s 1.1s var(--ease-out-expo) forwards",
          }}
        >
          <span
            style={{
              borderRight: "2px solid var(--accent)",
              paddingRight: "4px",
              animation: "blink-border 1s step-end infinite",
            }}
            aria-live="polite"
          >
            {text}
          </span>
        </div>

        <p
          className="max-w-[560px]"
          style={{
            fontSize: "1.05rem",
            lineHeight: 1.7,
            color: "var(--text-secondary)",
            marginBottom: "40px",
            textWrap: "pretty",
            opacity: 0,
            animation: "hReveal 0.8s 1.25s var(--ease-out-expo) forwards",
          }}
        >
          {t("hero.description")}
        </p>

        <div
          className="flex gap-4 flex-wrap"
          style={{
            opacity: 0,
            animation: "hReveal 0.8s 1.45s var(--ease-out-expo) forwards",
          }}
        >
          <a href="#projects" className="btn btn-primary">
            {t("hero.cta.work")}
          </a>
          <a href="#contact" className="btn btn-outline">
            {t("hero.cta.contact")}
          </a>
        </div>

        <div
          className="flex items-center gap-5 mt-[60px] pt-8 flex-wrap"
          style={{
            borderTop: "1px solid var(--border-subtle)",
            opacity: 0,
            animation: "hReveal 0.8s 1.7s var(--ease-out-expo) forwards",
          }}
        >
          <div
            className="flex items-center gap-2"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              color: "var(--text-tertiary)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e" }}
              aria-hidden="true"
            />
            <span>{t("hero.status.operational", "systems operational")}</span>
          </div>
          <div
            className="flex items-center gap-2"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              color: "var(--text-tertiary)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e" }}
              aria-hidden="true"
            />
            <span>{t("hero.status.certs", "11 certs earned")}</span>
          </div>
          <div
            className="flex items-center gap-2"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              color: "var(--text-tertiary)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{
                background: "var(--accent-warm)",
                boxShadow: "0 0 6px var(--accent-warm)",
              }}
              aria-hidden="true"
            />
            <span>
              {t("hero.status.opportunities", "open to opportunities")}
            </span>
          </div>
        </div>
      </motion.div>

      <a
        href="#about"
        aria-label={t("hero.scroll", "Scroll to about section")}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2 cursor-pointer z-10"
        style={{
          opacity: 0,
          animation: "hReveal 0.8s 2.0s var(--ease-out-expo) forwards",
          textDecoration: "none",
        }}
        onClick={(e) => {
          e.preventDefault();
          document
            .getElementById("about")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--text-tertiary)",
          }}
        >
          scroll
        </span>
        <div
          className="relative overflow-hidden"
          style={{
            width: "1px",
            height: "40px",
            background: "var(--border-medium)",
          }}
          aria-hidden="true"
        >
          <div
            className="absolute w-full"
            style={{
              height: "50%",
              background: "var(--accent)",
              animation: "scroll-anim 2s ease-in-out infinite",
            }}
          />
        </div>
      </a>
    </section>
  );
}

export default Hero;
