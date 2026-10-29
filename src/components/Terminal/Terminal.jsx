import { useEffect, useState } from "react";
import { m } from "framer-motion";
import { useTranslation } from "react-i18next";
import { sectionVariants, itemVariants } from "../../hooks/useMotion";
import PlanetScene from "../hero/PlanetScene";
import useTerminal from "./useTerminal";

const PROMPT = "visitor@cjoga.cloud:~$ ";
const SHORT_PROMPT = "~$ ";

// One tap runs a command: first-time visitors see what the terminal can
// do without guessing, and nobody has to type on a phone keyboard.
const SUGGESTIONS = [
  "help",
  "kubectl get nodes",
  "kubectl get namespaces",
  "neofetch",
  "cat resume.txt",
  "sudo hire-me",
];

function Prompt() {
  return (
    <span className="terminal-prompt" aria-hidden="true">
      <span className="terminal-prompt-full">{PROMPT}</span>
      <span className="terminal-prompt-short">{SHORT_PROMPT}</span>
    </span>
  );
}

export default function Terminal() {
  const { t } = useTranslation();
  const {
    history,
    currentInput,
    setCurrentInput,
    isProcessing,
    handleSubmit,
    runCommand,
    handleKeyDown,
    terminalRef,
    inputRef,
    focusInput,
  } = useTerminal();
  const [health, setHealth] = useState("checking");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/health", { signal: AbortSignal.timeout(5000) })
      .then((res) => !cancelled && setHealth(res.ok ? "operational" : "unavailable"))
      .catch(() => !cancelled && setHealth("unavailable"));
    return () => {
      cancelled = true;
    };
  }, []);

  // Desktop visitors can type straight away; on touch screens focusing
  // would throw the keyboard over the page before they've read it.
  useEffect(() => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) focusInput();
  }, [focusInput]);

  const healthLabel = {
    checking: t("hero.status.checking"),
    operational: t("hero.status.operational"),
    unavailable: t("hero.status.unavailable"),
  }[health];

  return (
    <section className="term-page hero-grain" aria-labelledby="terminal-title">
      <div className="term-page__scene" aria-hidden="true">
        <PlanetScene variant="horizon" quiet still />
      </div>

      <m.div
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="term-page__inner"
      >
        <m.header variants={itemVariants} className="term-page__header">
          <h1 id="terminal-title" className="section-heading term-page__title">
            {t("terminal.page.title")}{" "}
            <span className="section-heading__muted">{t("terminal.page.titleMuted")}</span>
          </h1>
          <p className="section-lede">{t("terminal.page.lede")}</p>
          <p className="term-page__status" role="status">
            <span className={`term-page__dot term-page__dot--${health}`} aria-hidden="true" />
            {healthLabel}
          </p>
        </m.header>

        <m.div variants={itemVariants} className="terminal-window chapter-dark">
          <div className="terminal-titlebar">
            <div className="terminal-dots" aria-hidden="true">
              <span className="terminal-dot terminal-dot-red" />
              <span className="terminal-dot terminal-dot-yellow" />
              <span className="terminal-dot terminal-dot-green" />
            </div>
            <span className="terminal-title">visitor@cjoga.cloud: ~</span>
            <span className="terminal-badge">{t("terminal.page.readOnly")}</span>
          </div>

          <div ref={terminalRef} className="terminal-body" onClick={focusInput}>
            <div role="log" aria-live="polite">
              {history.map((entry, i) => (
                <div key={i} className="terminal-line">
                  {entry.type === "input" ? (
                    <>
                      <Prompt />
                      <span className="terminal-cmd">{entry.content}</span>
                    </>
                  ) : (
                    <pre
                      className={`terminal-output ${
                        entry.outputType === "error"
                          ? "terminal-output-error"
                          : entry.outputType === "info"
                          ? "terminal-output-info"
                          : ""
                      }`}
                    >
                      {entry.content}
                    </pre>
                  )}
                </div>
              ))}

              {isProcessing && (
                <div className="terminal-line">
                  <span className="terminal-output-info">
                    {t("terminal.loading", "querying cluster…")}
                  </span>
                  <span className="terminal-cursor">_</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="terminal-line terminal-input-line">
              <Prompt />
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="terminal-input"
                aria-label={t("terminal.inputLabel")}
                disabled={isProcessing}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                enterKeyHint="send"
              />
            </form>
          </div>
        </m.div>

        <m.div variants={itemVariants} className="term-page__suggest">
          <h2 id="term-suggest-title" className="term-page__try">
            {t("terminal.page.try")}
          </h2>
          <ul aria-labelledby="term-suggest-title">
            {SUGGESTIONS.map((cmd) => (
              <li key={cmd}>
                <button
                  type="button"
                  className="term-chip"
                  disabled={isProcessing}
                  onClick={() => runCommand(cmd)}
                >
                  {cmd}
                </button>
              </li>
            ))}
          </ul>
        </m.div>
      </m.div>

      <style>{`
        .term-page {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          min-height: 100svh;
          display: flex;
          align-items: center;
          padding: 112px 0 72px;
        }
        .term-page__scene {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }
        .term-page__inner {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 64rem;
          margin: 0 auto;
          padding: 0 clamp(16px, 4vw, 32px);
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 24px;
        }
        /* Grid items default to min-width:auto and would grow to the
           widest output line; pin them so wide output scrolls inside
           the terminal instead of widening the page. */
        .term-page__inner > * { min-width: 0; }
        .term-page__title {
          margin-bottom: 12px;
        }
        .term-page__status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin: 14px 0 0;
          font-size: 0.875rem;
          color: var(--text-tertiary);
        }
        .term-page__dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--text-tertiary);
        }
        .term-page__dot--operational {
          background: var(--accent);
          box-shadow: 0 0 0 4px var(--accent-dim);
        }

        .terminal-window {
          background: var(--bg-surface);
          border: 1px solid var(--border-medium);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 40px 80px -32px rgba(2, 6, 23, 0.55), 0 2px 6px rgba(2, 6, 23, 0.2);
          font-family: var(--font-mono);
          font-size: 0.875rem;
          line-height: 1.7;
          color: var(--text-primary);
        }
        .terminal-titlebar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: var(--bg-elevated);
          border-bottom: 1px solid var(--border-subtle);
          user-select: none;
        }
        .terminal-dots { display: flex; gap: 7px; }
        .terminal-dot { width: 12px; height: 12px; border-radius: 50%; }
        .terminal-dot-red { background: #ff5f57; }
        .terminal-dot-yellow { background: #febc2e; }
        .terminal-dot-green { background: #28c840; }
        .terminal-title {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          letter-spacing: 0.02em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .terminal-badge {
          margin-left: auto;
          flex-shrink: 0;
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
        .terminal-body {
          padding: 18px 20px;
          min-height: 440px;
          max-height: 62vh;
          overflow-y: auto;
          cursor: text;
          scrollbar-width: thin;
          scrollbar-color: var(--border-medium) transparent;
        }
        .terminal-line {
          display: flex;
          align-items: flex-start;
          min-height: 1.7em;
          min-width: 0;
        }
        .terminal-prompt {
          color: var(--accent);
          user-select: none;
          white-space: pre;
          flex-shrink: 0;
        }
        .terminal-prompt-short { display: none; }
        .terminal-cmd {
          color: var(--text-primary);
          overflow-wrap: anywhere;
        }
        /* Command output keeps its columns: tables, ASCII art and top
           scroll sideways inside their own block instead of wrapping
           into an unreadable mess. */
        .terminal-output {
          white-space: pre;
          overflow-x: auto;
          margin: 0;
          padding: 0 0 2px;
          font-family: inherit;
          font-size: inherit;
          line-height: inherit;
          color: var(--text-primary);
          width: 100%;
          min-width: 0;
          scrollbar-width: thin;
        }
        .terminal-output-error { color: #fca5a5; }
        .terminal-output-info { color: var(--accent); }
        .terminal-input-line { align-items: center; }
        .terminal-input {
          flex: 1;
          min-width: 0;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-family: inherit;
          font-size: inherit;
          line-height: inherit;
          padding: 0;
          margin: 0;
          caret-color: var(--accent);
        }
        .terminal-cursor {
          color: var(--accent);
          animation: terminal-blink 1s step-end infinite;
        }
        @keyframes terminal-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        /* Suggested commands: a labelled group of solid buttons that wraps
           into an even grid at every width (no sideways scrolling). */
        .term-page__suggest {
          display: grid;
          gap: 12px;
        }
        .term-page__try {
          margin: 0;
          font-family: var(--font-body);
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .term-page__suggest ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 12.5rem), 1fr));
          gap: 8px;
        }
        .term-chip {
          width: 100%;
          min-height: 44px;
          padding: 8px 14px;
          border: 1px solid var(--border-medium);
          border-radius: 10px;
          background: var(--bg-surface);
          color: var(--text-primary);
          font-family: var(--font-mono);
          font-size: 0.875rem;
          text-align: left;
          overflow-wrap: anywhere;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s, background-color 0.2s;
        }
        .term-chip:hover:not(:disabled) {
          border-color: var(--accent);
          color: var(--accent);
        }
        .term-chip:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }
        .term-chip:disabled { opacity: 0.55; cursor: wait; }

        @media (max-width: 640px) {
          .term-page { padding: 96px 0 48px; }
          .terminal-window {
            /* Output reads smaller to fit a phone; the input stays at
               16px so iOS Safari doesn't zoom the page on focus. */
            font-size: 0.75rem;
            border-radius: 10px;
          }
          .terminal-input { font-size: 16px; }
          .terminal-prompt-full { display: none; }
          .terminal-prompt-short { display: inline; }
          .terminal-body {
            min-height: 340px;
            max-height: 58svh;
            padding: 14px;
          }
          .terminal-titlebar { padding: 10px 12px; }
          .terminal-dot { width: 10px; height: 10px; }
          .term-page__suggest ul {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .term-chip { font-size: 0.8125rem; }
        }
      `}</style>
    </section>
  );
}
