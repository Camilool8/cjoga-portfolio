# WS-G — Terminal UX & accessibility remediation

Date: 2026-07-04 · Branch: `feat/audit-remediation` · Audit refs: §2 (interaction bugs), §4 (a11y Critical/High)

Status: **implemented** — all 8 changes landed; ESLint clean; all verification greps pass.

## Scope (owned files)

- `src/components/Terminal/useTerminal.js`
- `src/components/Terminal/Terminal.jsx`
- `src/components/Terminal/TerminalPromo.jsx`
- `src/components/Terminal/commands.js` (read — sentinel already correct; no change needed, see #7)
- `src/services/terminalApi.js`

## Changes

### 1. Keyboard trap (Critical, WCAG 2.1.2) — `useTerminal.js` Tab branch
- `if (e.shiftKey) return;` first — Shift+Tab always moves focus backwards out.
- Only `preventDefault()` when a completion actually matches; no match → Tab
  moves focus out natively.
- Empty input → `return` early (bare Tab on an empty prompt escapes; otherwise
  `"".startsWith` matches everything and Tab would still trap).
- ArrowUp/Down/Ctrl+L keep their `preventDefault()` — none of those trap.

### 2. autoFocus — `Terminal.jsx:81`
- Remove `autoFocus` (focus steal on route entry + iOS keyboard pop).
- Keep click-anywhere-to-focus (`onClick={focusInput}` on `.terminal-body`).

### 3. TerminalPromo permanent freeze — `TerminalPromo.jsx:63-108`
- Cancel-safe sleep: store `{ resolve, timer }` in a ref; cleanup clears the
  timer AND resolves the pending promise so the `while` loop can advance.
- Generation counter (`generationRef`): `runSequence` captures its generation;
  cleanup bumps it; the loop checks `cancelled()` after every `await` and exits.
- Cleanup resets `isAnimating` to `false` so re-entering the viewport restarts
  the demo.
- Mobile clipping: `.tp-output` (defined in this component's `<style>` block)
  gets `overflow-x: auto; overflow-y: hidden; -webkit-overflow-scrolling:
  touch; max-width: 100%; min-width: 0` so kubectl tables scroll instead of
  clipping.
- Remove the `section-label` eyebrow (identity rule: eyebrows only on
  Experience/Contact).

### 4. Processing state — `Terminal.jsx`
- Input form stays mounted; input gets `disabled={isProcessing}` (no more
  unmount → focus destruction → iOS keyboard churn).
- i18n'd loading line in the output area while waiting:
  `t("terminal.loading", "querying cluster…")`.
- `useTerminal` refocuses the input when `isProcessing` flips true→false
  (preserves the old post-command focus behavior that `autoFocus`-on-remount
  provided, without the route-entry steal).

### 5. Screen readers — `Terminal.jsx`
- `aria-label={t("terminal.inputLabel", "terminal command input")}` on the input.
- History + loading line wrapped in `<div role="log" aria-live="polite">`
  (inside `.terminal-body`, excluding the input form).

### 6. Timeout — `terminalApi.js`
- `timeout: 10000` on the axios call.
- Timeout detection (`error.code === "ECONNABORTED"`/`"ETIMEDOUT"`) returns
  `errorKey: "timeout"`; `useTerminal` maps it to
  `t("terminal.errors.timeout", "cluster did not respond — try again in a
  moment")` (different namespace than `terminal.messages.*`, so it's
  special-cased before the generic `terminal.messages.${errorKey}` mapping).
- 429 handling unchanged.

### 7. exit command — SPA navigation
- `commands.js` already returns the `{ type: "exit" }` sentinel; the hard
  reload lives in `useTerminal.js:56` (`window.location.href = "/"`).
- `useTerminal` gets `useNavigate()`; on exit it navigates to the
  language-aware home: `pathname.startsWith("/es") ? "/es" : "/"`.

### 8. LazyMotion compat
- `motion.x` → `m.x` (`import { m } from "framer-motion"`) in `Terminal.jsx`
  and `TerminalPromo.jsx` (the only owned files using `motion`).

## i18n keys

`terminal.loading`, `terminal.inputLabel`, `terminal.errors.timeout` are added
to both locales by another workstream this wave; consumed here with
defaultValue fallbacks.

## Verification

- `npx eslint src/components/Terminal src/services/terminalApi.js --ext js,jsx` clean
- `grep -n "autoFocus" src/components/Terminal/Terminal.jsx` → empty
- `grep -n "shiftKey" src/components/Terminal/useTerminal.js` → present
- `grep -rn "motion\." src/components/Terminal/` → empty
- `grep -n "location.href" src/components/Terminal/commands.js src/components/Terminal/useTerminal.js` → empty
