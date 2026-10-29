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
import { FiArrowRight, FiDownload } from "react-icons/fi";
import { EASE_SMOOTH } from "../hooks/useMotion";
import PlanetScene from "./hero/PlanetScene";
import useCvDownload from "../hooks/useCvDownload";

const ROLE_PERIOD = 4000;

// The name arrives word by word: blur, drop and fade, in CSS so it plays
// from the prerendered HTML without waiting for the bundle (see .h-word).
function BlurWords({ words, baseDelay = 0, className = "", style = {} }) {
  return words.map((word, i) => [
    i > 0 ? " " : null,
    <span
      key={`${word}-${i}`}
      className={`h-word ${className}`.trim()}
      style={{ ...style, "--d": `${baseDelay + i * 0.08}s` }}
    >
      {word}
    </span>,
  ]);
}

function Hero() {
  const { t, i18n } = useTranslation();
  const reduced = useReducedMotion();
  const { download, isGenerating, hasError } = useCvDownload();
  const [roleIndex, setRoleIndex] = useState(0);

  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  // Drive parallax directly off scrollYProgress (compositor-friendly transforms).
  // Dropped the useSpring wrapper — it keeps interpolating after scroll stops
  // and adds main-thread cost without a visible benefit on a one-way exit fade.
  // Fade only once the hero is mostly gone, so the bottom row stays
  // readable while the visitor scrolls down to it.
  const heroOpacity = useTransform(scrollYProgress, [0.55, 0.95], [1, 0]);
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

  const currentRole =
    textArray.length > 0 ? textArray[roleIndex % textArray.length] : "";

  return (
    <section
      ref={heroRef}
      id="hero"
      className="hero-grain min-h-[100dvh] flex flex-col justify-center relative overflow-hidden"
      style={{ background: "var(--gradient-hero)", padding: "var(--hero-pt, clamp(108px, 15vh, 128px)) 0 60px" }}
    >
      <m.div
        className="hero-scene"
        initial={reduced ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduced ? 0 : 2.2, ease: EASE_SMOOTH }}
        style={{ y: gridY }}
      >
        <PlanetScene avoid="#hero .hero-telemetry, #hero h1, #hero .hero-actions" />
      </m.div>

      <m.div
        className="section-inner relative z-10"
        style={{ opacity: heroOpacity, y: heroY }}
      >
        <p
          className="hero-whoami"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.85rem",
            color: "var(--accent)",
            opacity: 0,
            animation: "hReveal 0.5s calc(0.05s - var(--hero-t, 0s)) var(--ease-out-expo) forwards",
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
            // Capped by viewport height too, so a short window still shows
            // the action buttons above the fold.
            fontSize: "clamp(2rem, min(6.4vw, 8vh), 4.75rem)",
            fontWeight: 800,
            fontStretch: "125%",
            fontVariationSettings: "'wdth' 125",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            marginBottom: "8px",
            textWrap: "balance",
          }}
        >
          <BlurWords words={["José", "Camilo"]} baseDelay={0.12} />{" "}
          <br />
          <BlurWords
            words={["Joga", "Guerrero."]}
            baseDelay={0.28}
            style={{
              background: "var(--gradient-accent)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          />
        </h1>

        <div
          className="hero-role"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.2rem, 3.5vw, 2.2rem)",
            fontWeight: 600,
            color: "var(--text-secondary)",
            marginBottom: "clamp(14px, 3.5vh, 28px)",
            minHeight: "1.4em",
            opacity: 0,
            animation: "hReveal 0.6s calc(0.5s - var(--hero-t, 0s)) var(--ease-out-expo) forwards",
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
                transition={{ duration: 0.28, ease: EASE_SMOOTH }}
              >
                {currentRole}
              </m.span>
            </AnimatePresence>
          )}
        </div>

        {/* One sentence: the title and what it means. The rest of the
            description is the CV summary; on the page the statements
            below carry it. */}
        <p
          className="hero-lede max-w-[560px]"
          style={{
            color: "var(--text-primary)",
            marginBottom: "clamp(22px, 5vh, 40px)",
            textWrap: "pretty",
            opacity: 0,
            animation: "hReveal 0.6s calc(0.6s - var(--hero-t, 0s)) var(--ease-out-expo) forwards",
          }}
        >
          {(() => {
            const text = t("hero.description");
            const cut = text.indexOf(". ");
            return cut < 0 ? text : text.slice(0, cut + 1);
          })()}
        </p>

        <div
          className="hero-actions flex items-center gap-4 flex-wrap"
          style={{
            opacity: 0,
            animation: "hReveal 0.6s calc(0.72s - var(--hero-t, 0s)) var(--ease-out-expo) forwards",
          }}
        >
          <button
            type="button"
            className="btn btn-primary"
            onClick={download}
            disabled={isGenerating}
          >
            <FiDownload aria-hidden="true" />
            {isGenerating ? t("print.generating") : t("print.button")}
          </button>
          <a href="#projects" className="btn btn-outline">
            {t("hero.cta.work")}
          </a>
          <Link
            to={i18n.language === "es" ? "/es/terminal" : "/terminal"}
            className="hero-terminal-link"
          >
            {t("hero.terminalHint")}
            <FiArrowRight aria-hidden="true" className="hero-terminal-link__icon" />
          </Link>
          {hasError && (
            <p role="alert" className="w-full m-0" style={{ fontSize: "0.9375rem", color: "var(--text-secondary)" }}>
              {t("print.error")}
            </p>
          )}
        </div>

        <div
          className="hero-telemetry"
          style={{
            opacity: 0,
            animation: "hReveal 0.6s calc(0.85s - var(--hero-t, 0s)) var(--ease-out-expo) forwards",
          }}
        >
          <ul className="hero-pillars">
            {["multicloud", "global", "agents"].map((id) => (
              <li key={id} className="hero-pillar">
                <span className="hero-pillar__title">{t(`hero.pillars.${id}.title`)}</span>
                <span className="hero-pillar__text">{t(`hero.pillars.${id}.text`)}</span>
              </li>
            ))}
          </ul>
          <p className="hero-status">
            <span className="hero-status__dot" aria-hidden="true" />
            <span>{t("hero.status.opportunities")}</span>
          </p>
        </div>
      </m.div>
    </section>
  );
}

export default Hero;
