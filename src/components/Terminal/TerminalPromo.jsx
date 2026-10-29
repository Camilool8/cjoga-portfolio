import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { m, useInView } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import PlanetScene from "../hero/PlanetScene";
import SectionHeading from "../SectionHeading";
import { localizePath } from "../../utils/i18n";
import {
  sectionVariants,
  itemVariants,
  viewportConfig,
} from "../../hooks/useMotion";

const PROMPT = "visitor@cjoga.cloud:~$ ";

const TYPING_SPEED = 55; // ms per character
const OUTPUT_DELAY = 300; // ms after command before showing output
const PAUSE_BETWEEN = 2200; // ms between command sequences
const LOOP_PAUSE = 3500; // ms before restarting the entire loop

export default function TerminalPromo() {
  const { t, i18n } = useTranslation();
  const terminalPath = localizePath("/terminal", i18n.language === "es" ? "es" : "en");
  const [lines, setLines] = useState([]);
  const [currentTyping, setCurrentTyping] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.4 });
  // Pending sleep: { timer, resolve } — cleanup must BOTH clear the timer
  // and resolve the promise, otherwise the awaited sleep never settles and
  // the animation loop stalls forever with isAnimating stuck at true.
  const pendingSleepRef = useRef(null);
  // Bumped on cleanup; each runSequence captures its generation and exits
  // as soon as it no longer matches.
  const generationRef = useRef(0);

  const demoSequence = useMemo(
    () => [
      {
        command: "kubectl get nodes",
        output: `NAME            STATUS   ROLES           AGE    VERSION
k3s-master-01   Ready    control-plane   180d   v1.33.5+k3s1
k3s-worker-01   Ready    worker          180d   v1.33.5+k3s1
k3s-worker-02   Ready    worker          90d    v1.33.5+k3s1`,
      },
      {
        command: "kubectl get pods -n monitoring",
        output: `NAME                        READY   STATUS    RESTARTS   AGE
prometheus-server-0         1/1     Running   0          30d
grafana-5d4f8c7b9-kx2mt     1/1     Running   0          30d
loki-0                      1/1     Running   1          30d`,
      },
      {
        command: "sudo hire-me",
        output: ` +==========================================+
 |                                          |
 |   ${t("terminal.messages.hireGranted").padEnd(37)}  |
 |                                          |
 |   ${t("terminal.messages.hireCta").padEnd(37)}  |
 |                                          |
 |   Email    : josejoga.opx@gmail.com      |
 |   LinkedIn : linkedin.com/in/cjoga       |
 |   Web      : cjoga.cloud                 |
 |                                          |
 +==========================================+`,
      },
    ],
    [t],
  );

  // The window is sized to the whole recording: the font scales so the
  // longest line fits the width (no sideways scroll), and the body is
  // tall enough for every line, so the demo always plays end to end.
  const { cols, rows } = useMemo(() => {
    let widest = 0;
    let total = 1; // the final prompt line
    demoSequence.forEach(({ command, output }) => {
      widest = Math.max(widest, PROMPT.length + command.length + 1);
      const outLines = output.split("\n");
      outLines.forEach((l) => (widest = Math.max(widest, l.length)));
      total += 1 + outLines.length;
    });
    return { cols: widest, rows: total };
  }, [demoSequence]);

  const sleep = (ms) =>
    new Promise((resolve) => {
      const timer = setTimeout(() => {
        pendingSleepRef.current = null;
        resolve();
      }, ms);
      pendingSleepRef.current = { timer, resolve };
    });

  const runSequence = useCallback(async () => {
    const generation = generationRef.current;
    const cancelled = () => generationRef.current !== generation;
    setIsAnimating(true);

    while (!cancelled()) {
      setLines([]);
      setCurrentTyping("");

      for (let s = 0; s < demoSequence.length; s++) {
        const { command, output } = demoSequence[s];

        for (let i = 0; i <= command.length; i++) {
          setCurrentTyping(command.slice(0, i));
          await sleep(TYPING_SPEED + Math.random() * 30);
          if (cancelled()) return;
        }

        await sleep(OUTPUT_DELAY);
        if (cancelled()) return;

        setLines((prev) => [
          ...prev,
          { type: "input", content: command },
          { type: "output", content: output },
        ]);
        setCurrentTyping("");

        if (s < demoSequence.length - 1) {
          await sleep(PAUSE_BETWEEN);
          if (cancelled()) return;
        }
      }

      await sleep(LOOP_PAUSE);
    }
  }, [demoSequence]);

  useEffect(() => {
    if (isInView && !isAnimating) {
      runSequence();
    }
    return () => {
      // Cancel-safe teardown: invalidate the running sequence, settle any
      // pending sleep so the loop can observe the cancellation, and reset
      // isAnimating so re-entering the viewport restarts the demo.
      generationRef.current += 1;
      if (pendingSleepRef.current) {
        clearTimeout(pendingSleepRef.current.timer);
        pendingSleepRef.current.resolve();
        pendingSleepRef.current = null;
      }
      setIsAnimating(false);
    };
  }, [isInView]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const interval = setInterval(() => setShowCursor((p) => !p), 530);
    return () => clearInterval(interval);
  }, []);

  return (
    // Full-bleed chapter (after SpaceX/Vast): always dark, the same
    // world as the hero seen as a horizon, the live cluster as the subject.
    <section id="terminal-promo" className="chapter chapter-dark hero-grain" aria-labelledby="terminal-promo-title">
      <div className="chapter__scene" aria-hidden="true">
        <PlanetScene variant="horizon" still />
      </div>
      <div className="section-inner chapter__inner">
        <m.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="chapter__copy"
        >
          <SectionHeading
            id="terminal-promo-title"
            title={t("terminal.heading")}
            muted={t("terminal.headingMuted")}
          />
          <m.p variants={itemVariants} className="section-lede">
            {t("terminal.description")}
          </m.p>
        </m.div>

        <m.div
          ref={containerRef}
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="tp-wrapper"
        >
          <div className="tp-terminal">
            <div className="tp-titlebar">
              <div className="tp-dots" aria-hidden="true">
                <span className="tp-dot tp-dot-red" />
                <span className="tp-dot tp-dot-yellow" />
                <span className="tp-dot tp-dot-green" />
              </div>
              <span className="tp-titlebar-text">visitor@cjoga.cloud: ~</span>
              <span className="tp-replay">{t("terminal.replay")}</span>
            </div>

            <div className="tp-body" style={{ "--tp-cols": cols, "--tp-rows": rows }}>
              {lines.map((line, i) => (
                <div key={i} className="tp-line">
                  {line.type === "input" ? (
                    <>
                      <span className="tp-prompt">{PROMPT}</span>
                      <span className="tp-cmd">{line.content}</span>
                    </>
                  ) : (
                    <pre className="tp-output">{line.content}</pre>
                  )}
                </div>
              ))}

              <div className="tp-line">
                <span className="tp-prompt">{PROMPT}</span>
                <span className="tp-cmd">{currentTyping}</span>
                <span
                  className="tp-cursor"
                  style={{ opacity: showCursor ? 1 : 0 }}
                >
                  _
                </span>
              </div>
            </div>

          </div>
        </m.div>

        <m.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="chapter__cta"
        >
          <Link
            to={terminalPath}
            className="btn btn-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {t("terminal.cta")}
            <FiArrowRight aria-hidden="true" />
          </Link>
        </m.div>
      </div>

      <style>{`
        .tp-wrapper {
          position: relative;
          margin: 0;
        }

        .tp-terminal {
          container-type: inline-size;
          position: relative;
          z-index: 1;
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 30px 60px -24px rgba(0, 0, 0, 0.7);
          font-family: var(--font-mono);
          font-size: 0.8125rem;
          line-height: 1.65;
        }

        .tp-titlebar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 16px;
          background: var(--bg-elevated);
          border-bottom: 1px solid var(--border-subtle);
          user-select: none;
        }

        .tp-dots { display: flex; gap: 7px; }

        .tp-dot {
          width: 11px;
          height: 11px;
          border-radius: 50%;
        }

        .tp-dot-red    { background: #ff5f57; }
        .tp-dot-yellow { background: #febc2e; }
        .tp-dot-green  { background: #28c840; }

        .tp-replay {
          margin-left: auto;
          flex-shrink: 0;
          white-space: nowrap;
          font-family: var(--font-body);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-secondary);
          padding: 2px 8px;
          border: 1px solid var(--border-medium);
          border-radius: 6px;
        }
        .tp-titlebar-text {
          min-width: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 0.75rem;
          color: var(--text-tertiary);
          letter-spacing: 0.02em;
        }

        /* JetBrains Mono advances 0.6em per character, so this font size
           fits --tp-cols characters across the window; the height holds
           all --tp-rows lines at the 1.65 line height. */
        .tp-body {
          --tp-pad-x: 20px;
          --tp-pad-y: 18px;
          padding: var(--tp-pad-y) var(--tp-pad-x);
          font-size: clamp(8px, calc((100cqw - 2 * var(--tp-pad-x)) / (var(--tp-cols) * 0.61)), 13px);
          line-height: 1.65;
          height: calc(var(--tp-rows) * 1.65em + 2 * var(--tp-pad-y));
          overflow: hidden;
        }

        .tp-line {
          display: flex;
          align-items: flex-start;
          min-height: 1.65em;
        }

        .tp-prompt {
          color: var(--accent);
          white-space: nowrap;
          flex-shrink: 0;
          user-select: none;
        }

        .tp-cmd {
          color: var(--text-primary);
        }

        .tp-output {
          white-space: pre;
          margin: 0;
          padding: 0;
          font-family: inherit;
          font-size: inherit;
          line-height: inherit;
          color: var(--text-secondary);
          min-width: 0;
        }

        .tp-cursor {
          color: var(--accent);
          font-weight: 700;
          transition: opacity 0.08s;
        }

        @media (max-width: 640px) {
          .tp-terminal {
            border-radius: 8px;
          }
          .tp-body {
            --tp-pad-x: 12px;
            --tp-pad-y: 12px;
          }
          .tp-dot {
            width: 9px;
            height: 9px;
          }
        }
      `}</style>
    </section>
  );
}
