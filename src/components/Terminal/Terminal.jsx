import { motion } from "framer-motion";
import { sectionVariants } from "../../hooks/useMotion";
import useTerminal from "./useTerminal";

const PROMPT = "visitor@cjoga.cloud:~$ ";

export default function Terminal() {
  const {
    history,
    currentInput,
    setCurrentInput,
    isProcessing,
    handleSubmit,
    handleKeyDown,
    terminalRef,
    inputRef,
    focusInput,
  } = useTerminal();

  return (
    <section className="min-h-screen flex flex-col items-center justify-center py-24 px-4">
      <motion.div
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-4xl"
      >
        <div className="terminal-window">
          <div className="terminal-titlebar">
            <div className="terminal-dots">
              <span className="terminal-dot terminal-dot-red" />
              <span className="terminal-dot terminal-dot-yellow" />
              <span className="terminal-dot terminal-dot-green" />
            </div>
            <span className="terminal-title">visitor@cjoga.cloud: ~</span>
          </div>

          <div
            ref={terminalRef}
            className="terminal-body"
            onClick={focusInput}
          >
            {history.map((entry, i) => (
              <div key={i} className="terminal-line">
                {entry.type === "input" ? (
                  <>
                    <span className="terminal-prompt">{PROMPT}</span>
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

            {isProcessing ? (
              <div className="terminal-line">
                <span className="terminal-prompt">{PROMPT}</span>
                <span className="terminal-cursor">_</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="terminal-line terminal-input-line">
                <span className="terminal-prompt">{PROMPT}</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="terminal-input"
                  autoFocus
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                />
              </form>
            )}
          </div>
        </div>
      </motion.div>

      <style>{`
        .terminal-window {
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3),
                      0 0 40px rgba(100, 255, 218, 0.03);
          font-family: var(--font-mono);
          font-size: 0.85rem;
          line-height: 1.7;
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

        .terminal-dots {
          display: flex;
          gap: 7px;
        }

        .terminal-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .terminal-dot-red { background: #ff5f57; }
        .terminal-dot-yellow { background: #febc2e; }
        .terminal-dot-green { background: #28c840; }

        .terminal-title {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          letter-spacing: 0.02em;
        }

        .terminal-body {
          padding: 16px;
          min-height: 420px;
          max-height: 70vh;
          overflow-y: auto;
          cursor: text;
          scrollbar-width: thin;
          scrollbar-color: var(--border-medium) transparent;
        }

        .terminal-body::-webkit-scrollbar {
          width: 6px;
        }

        .terminal-body::-webkit-scrollbar-track {
          background: transparent;
        }

        .terminal-body::-webkit-scrollbar-thumb {
          background: var(--border-medium);
          border-radius: 3px;
        }

        .terminal-line {
          display: flex;
          align-items: flex-start;
          min-height: 1.7em;
        }

        .terminal-prompt {
          color: var(--accent);
          user-select: none;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .terminal-cmd {
          color: var(--text-primary);
        }

        .terminal-output {
          white-space: pre-wrap;
          word-break: break-word;
          margin: 0;
          padding: 0;
          font-family: inherit;
          font-size: inherit;
          line-height: inherit;
          color: var(--text-primary);
          width: 100%;
        }

        .terminal-output-error {
          color: #f87171;
        }

        .terminal-output-info {
          color: var(--accent-secondary, var(--accent));
        }

        .terminal-input-line {
          display: flex;
          align-items: center;
        }

        .terminal-input {
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-family: inherit;
          font-size: inherit;
          line-height: inherit;
          width: 100%;
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

        @media (max-width: 640px) {
          .terminal-window {
            /* 16px (1rem) prevents iOS Safari's automatic zoom-on-focus
               behavior, which triggers when an input has font-size < 16px.
               Worth the slight density loss to keep the terminal usable
               on mobile without the viewport jumping around. */
            font-size: 1rem;
            border-radius: 8px;
          }

          .terminal-body {
            min-height: 300px;
            max-height: 60vh;
            padding: 12px;
          }

          .terminal-titlebar {
            padding: 10px 12px;
          }

          .terminal-dot {
            width: 10px;
            height: 10px;
          }

          .terminal-title {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </section>
  );
}
