import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

// A redrawn exam workspace from sim.cjoga.cloud: the real CKAD task and
// the real kubectl output from a training session (2026-10-28), set in
// the site's palette. The terminal replays the session once, the first
// time the card scrolls into view.
const PROMPT = "candidate@instance-2:~$";
const SCRIPT = [
  { cmd: "kubectl get nodes" },
  {
    out: [
      "NAME                STATUS   ROLES           AGE     VERSION",
      "sim-control-plane   Ready    control-plane   7m51s   v1.35.5",
      "sim-worker          Ready    <none>          7m39s   v1.35.5",
    ],
  },
  { cmd: "kubectl get sa,role,rolebinding -n crater" },
  { out: ["NAME                     AGE", "serviceaccount/default   71s"] },
];

function useReplay(active, reduced) {
  const full = SCRIPT.length;
  const [step, setStep] = useState(reduced ? full : 0);
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (reduced || !active || step >= full) return undefined;
    const line = SCRIPT[step];
    if (line.out) {
      const id = setTimeout(() => {
        setStep((s) => s + 1);
        setTyped(0);
      }, 380);
      return () => clearTimeout(id);
    }
    if (typed < line.cmd.length) {
      const id = setTimeout(() => setTyped((n) => n + 1), 38);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => {
      setStep((s) => s + 1);
      setTyped(0);
    }, 260);
    return () => clearTimeout(id);
  }, [active, reduced, step, typed, full]);

  return { step, typed };
}

function SimWorkspace({ label }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const { step, typed } = useReplay(inView, reduced);

  const lines = [];
  SCRIPT.forEach((line, i) => {
    if (i > step) return;
    if (line.cmd) {
      const text = i < step ? line.cmd : line.cmd.slice(0, typed);
      lines.push(
        <div key={`c${i}`}>
          <span className="sim__prompt">{PROMPT}</span> {text}
          {i === step && <span className="sim__caret" />}
        </div>,
      );
    } else if (i < step) {
      line.out.forEach((o, j) => lines.push(<div key={`o${i}-${j}`}>{o}</div>));
    }
  });
  if (step >= SCRIPT.length) {
    lines.push(
      <div key="end">
        <span className="sim__prompt">{PROMPT}</span> <span className="sim__caret" />
      </div>,
    );
  }

  return (
    <figure ref={ref} className="uishot chapter-dark" role="img" aria-label={label}>
      <div className="uishot__frame" aria-hidden="true">
        <div className="uishot__bar">
          <i />
          <i />
          <i />
          <b>sim.cjoga.cloud</b>
        </div>
        <div className="sim">
          <div className="sim__top">
            <span className="sim__brand">kubestronaut-sim</span>
            <span className="sim__crumb">CKAD · 1 of 17 opened</span>
            <span className="sim__progress">
              <i />
            </span>
            <span className="sim__pill">Training</span>
            <span className="sim__submit">Submit session</span>
          </div>
          <div className="sim__body">
            <div className="sim__task">
              <small>TASK 01 / 17</small>
              <strong>Grant a ServiceAccount only what it needs</strong>
              <div className="sim__tags">
                <span>Configuration and Security</span>
                <span>Weight 6%</span>
                <span className="sim__tag--on">instance-2</span>
              </div>
              <div className="sim__workfrom">
                <small>WORK FROM</small>
                <code>ssh instance-2</code>
              </div>
              <p>
                Namespace <code>crater</code> runs a reporting job that reads its configuration from
                ConfigMaps. It must be able to read those and nothing else.
              </p>
              <p>
                1. Create a ServiceAccount named <code>report-reader</code> in Namespace <code>crater</code>.
              </p>
            </div>
            <div className="sim__term">{lines}</div>
          </div>
        </div>
      </div>
    </figure>
  );
}

export default SimWorkspace;
