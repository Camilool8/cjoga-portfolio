import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
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
  const { t } = useTranslation();
  const [lines, setLines] = useState([]);
  const [currentTyping, setCurrentTyping] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.4 });
  const animationRef = useRef(null);

  const demoSequence = useMemo(
    () => [
      {
        command: "kubectl get nodes",
        output: `NAME             STATUS   ROLES                  AGE    VERSION
k3s-master-01    Ready    control-plane,master   180d   v1.28.4+k3s1
k3s-worker-01    Ready    worker                 180d   v1.28.4+k3s1
k3s-worker-02    Ready    worker                 90d    v1.28.4+k3s1`,
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

  const sleep = (ms) =>
    new Promise((r) => {
      animationRef.current = setTimeout(r, ms);
    });

  const runSequence = useCallback(async () => {
    setIsAnimating(true);

    while (true) {
      setLines([]);
      setCurrentTyping("");

      for (let s = 0; s < demoSequence.length; s++) {
        const { command, output } = demoSequence[s];

        for (let i = 0; i <= command.length; i++) {
          setCurrentTyping(command.slice(0, i));
          await sleep(TYPING_SPEED + Math.random() * 30);
        }

        await sleep(OUTPUT_DELAY);

        setLines((prev) => [
          ...prev,
          { type: "input", content: command },
          { type: "output", content: output },
        ]);
        setCurrentTyping("");

        if (s < demoSequence.length - 1) {
          await sleep(PAUSE_BETWEEN);
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
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, [isInView]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const interval = setInterval(() => setShowCursor((p) => !p), 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="terminal-promo" className="py-16 md:py-24 relative z-10">
      <div className="section-inner">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="mb-10"
        >
          <motion.div variants={itemVariants}>
            <span className="section-label">{t("terminal.label")}</span>
            <h2 className="section-heading">{t("terminal.heading")}</h2>
            <p
              className="max-w-2xl text-base leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("terminal.description")}
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          ref={containerRef}
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="tp-wrapper"
        >
          <div className="tp-terminal">
            <div className="tp-titlebar">
              <div className="tp-dots">
                <span className="tp-dot tp-dot-red" />
                <span className="tp-dot tp-dot-yellow" />
                <span className="tp-dot tp-dot-green" />
              </div>
              <span className="tp-titlebar-text">visitor@cjoga.cloud: ~</span>
            </div>

            <div className="tp-body">
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

            <div className="tp-scanline" />
          </div>

          <div className="tp-glow" />
        </motion.div>

        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link
            to="/terminal"
            className="btn btn-outline"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {t("terminal.cta")}
            <FaArrowRight size={12} />
          </Link>
        </motion.div>
      </div>

      <style>{`
        .tp-wrapper {
          position: relative;
          margin: 0;
          overflow: hidden;
        }

        .tp-glow {
          position: absolute;
          inset: -30%;
          background: radial-gradient(
            ellipse 60% 50% at 50% 50%,
            rgba(var(--particle-color), 0.06) 0%,
            transparent 70%
          );
          pointer-events: none;
          z-index: 0;
        }

        .tp-terminal {
          position: relative;
          z-index: 1;
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          overflow: hidden;
          box-shadow:
            0 24px 80px rgba(0, 0, 0, 0.35),
            0 0 60px rgba(var(--particle-color), 0.04);
          font-family: var(--font-mono);
          font-size: 0.78rem;
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

        .tp-titlebar-text {
          font-size: 0.7rem;
          color: var(--text-tertiary);
          letter-spacing: 0.02em;
        }

        .tp-body {
          padding: 18px 20px;
          min-height: 380px;
          max-height: 500px;
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
          overflow: hidden;
        }

        .tp-cursor {
          color: var(--accent);
          font-weight: 700;
          transition: opacity 0.08s;
        }

        .tp-scanline {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.03) 2px,
            rgba(0, 0, 0, 0.03) 4px
          );
          z-index: 2;
        }

        @media (max-width: 640px) {
          .tp-terminal {
            font-size: 0.62rem;
            border-radius: 8px;
          }
          .tp-body {
            padding: 10px 12px;
            min-height: 200px;
            max-height: 280px;
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
