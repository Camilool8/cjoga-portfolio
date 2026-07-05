import { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  m,
  AnimatePresence,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { EASE_SMOOTH } from "../hooks/useMotion";
import { CERT_COUNT } from "./certifications/certData";

const ROLE_PERIOD = 4000;

const HEALTH_DOT = {
  checking: "var(--text-tertiary)",
  operational: "var(--accent)",
  unavailable: "var(--accent-warm)",
};

function BlurWords({ words, baseDelay = 0, className = "", style = {} }) {
  const reduced = useReducedMotion();
  // On coarse pointers (phones/tablets), skip the blur filter — paint cost on
  // multi-word headlines was visibly stuttering. opacity+translate covers it.
  const coarse =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse), (max-width: 768px)").matches;
  return words.map((word, i) => {
    const initial = reduced
      ? { opacity: 0 }
      : coarse
        ? { opacity: 0, y: -10 }
        : { opacity: 0, filter: "blur(8px)", y: -14 };
    const animate = reduced
      ? { opacity: 1 }
      : coarse
        ? { opacity: 1, y: 0 }
        : { opacity: 1, filter: "blur(0px)", y: 0 };
    return (
      <m.span
        key={`${word}-${i}`}
        className={className}
        style={{
          display: "inline-block",
          marginRight: i === words.length - 1 ? 0 : "0.22em",
          ...style,
        }}
        initial={initial}
        animate={animate}
        transition={{
          duration: 0.7,
          delay: baseDelay + i * 0.11,
          ease: EASE_SMOOTH,
        }}
      >
        {word}
      </m.span>
    );
  });
}

function Hero() {
  const { t, i18n } = useTranslation();
  const reduced = useReducedMotion();
  const [roleIndex, setRoleIndex] = useState(0);
  const [health, setHealth] = useState("checking");

  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  // Drive parallax directly off scrollYProgress (compositor-friendly transforms).
  // Dropped the useSpring wrapper — it keeps interpolating after scroll stops
  // and adds main-thread cost without a visible benefit on a one-way exit fade.
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.8], [0, -60]);
  const gridY = useTransform(scrollYProgress, [0, 1], [0, -20]);

  const roles = t("hero.roles", { returnObjects: true });
  const textArray = useMemo(
    () => [...(Array.isArray(roles) ? roles : [])],
    [roles],
  );

  // Crossfade role rotation — one re-render every ROLE_PERIOD instead of a
  // per-keystroke typewriter. Under reduced motion the first role renders
  // statically and this effect never schedules.
  useEffect(() => {
    if (reduced || textArray.length < 2) return undefined;
    const timer = setTimeout(() => {
      setRoleIndex((i) => (i + 1) % textArray.length);
    }, ROLE_PERIOD);
    return () => clearTimeout(timer);
  }, [reduced, roleIndex, textArray.length]);

  // Real health for the status strip — one fetch on mount, no polling.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/health", { signal: AbortSignal.timeout(5000) })
      .then((res) => {
        if (!cancelled) setHealth(res.ok ? "operational" : "unavailable");
      })
      .catch(() => {
        if (!cancelled) setHealth("unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const currentRole =
    textArray.length > 0 ? textArray[roleIndex % textArray.length] : "";

  const healthLabel = {
    checking: t("hero.status.checking", "checking systems…"),
    operational: t("hero.status.operational", "systems operational"),
    unavailable: t("hero.status.unavailable", "systems unreachable"),
  }[health];

  return (
    <section
      ref={heroRef}
      id="hero"
      className="min-h-[100dvh] flex flex-col justify-center relative overflow-hidden"
      style={{ background: "var(--gradient-hero)", padding: "100px 0 60px" }}
    >
      <m.div
        aria-hidden="true"
        className="hero-orb hero-orb-accent absolute pointer-events-none"
        initial={reduced ? { opacity: 0.4, scale: 1 } : { opacity: 0, scale: 0.6 }}
        animate={{ opacity: 0.45, scale: 1 }}
        transition={{ duration: reduced ? 0 : 1.6, ease: EASE_SMOOTH }}
      />
      <m.div
        aria-hidden="true"
        className="hero-orb hero-orb-warm absolute pointer-events-none"
        initial={reduced ? { opacity: 0.25, scale: 1 } : { opacity: 0, scale: 0.6 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ duration: reduced ? 0 : 1.8, delay: 0.2, ease: EASE_SMOOTH }}
      />

      <m.div
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

      <m.div
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
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.2rem, 3.5vw, 2.2rem)",
            fontWeight: 600,
            color: "var(--text-secondary)",
            marginBottom: "28px",
            minHeight: "1.4em",
            opacity: 0,
            animation: "hReveal 0.8s 1.1s var(--ease-out-expo) forwards",
          }}
        >
          {reduced ? (
            <span>{textArray[0]}</span>
          ) : (
            <AnimatePresence mode="wait">
              <m.span
                key={roleIndex}
                className="inline-block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: EASE_SMOOTH }}
              >
                {currentRole}
              </m.span>
            </AnimatePresence>
          )}
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
          className="flex items-center gap-4 flex-wrap"
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
          <Link
            to={i18n.language === "es" ? "/es/terminal" : "/terminal"}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.8rem",
              color: "var(--text-tertiary)",
              textDecoration: "none",
              borderBottom: "1px dashed var(--border-medium)",
              paddingBottom: "2px",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-tertiary)";
            }}
          >
            {t("hero.terminalHint", "try the live terminal →")}
          </Link>
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
              style={{
                background: HEALTH_DOT[health],
                boxShadow:
                  health === "checking"
                    ? "none"
                    : `0 0 6px ${HEALTH_DOT[health]}`,
              }}
              aria-hidden="true"
            />
            <span>{healthLabel}</span>
          </div>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              color: "var(--text-tertiary)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {t("hero.status.certs", { count: CERT_COUNT })}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              color: "var(--text-tertiary)",
            }}
          >
            {t("hero.status.opportunities", "open to opportunities")}
          </span>
        </div>
      </m.div>
    </section>
  );
}

export default Hero;
