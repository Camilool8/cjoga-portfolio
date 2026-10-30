// The night-before sheet: for each exam domain, the commands that do the
// work, how to check them, and the task in the repo that drills them.
// The answers stay in the repo; this is the sheet, not a copy of it.
//
// Usage (registered globally in MDXComponents). Keep a blank line around
// each fence and start it at column 0, or MDX won't parse it as code:
//
//   <DomainSheet shorthand={[['k', 'kubectl']]}>
//   <Domain title="Scheduled tasks — at and cron" short="Scheduled tasks" tasks={[{ label: 'Tasks 24–25', href: 'https://…' }]}>
//
//   ```bash
//   at now + 10 minutes
//   ```
//
//   <Verify>Ctrl-D queues the job.</Verify>
//
//   </Domain>
//   </DomainSheet>
//
// `short` names the domain in the index at the top of the sheet and in
// its anchor (#sheet-scheduled-tasks); without it the index uses the
// title up to its dash. The anchor the full title gave before still
// lands on the domain.
//
// `shorthand` is optional: [term, meaning] pairs the commands rely on.
// It is one row under the index, and a quiet line at the top of the
// first domain that uses each term (after the one that sets it up), so a
// reader going down the sheet meets "k" with its meaning once, where it
// first matters. It is not repeated on every domain: the row under the
// index says it for the whole sheet, and a reader who lands deeper (a
// search hit, a shared link) is told again at the moment it counts, by
// the copy note on a command that needs it, which names the domain whose
// code sets it up (`alias k=…`). A static rule, so nothing appears or
// goes as the reader arrives.
//
// Code goes through Markdown fences, so copy, wrap, the edge fade and the
// "Copied" confirmation behave as on every other block.
//
// Each domain ends on its steps, the previous and next domains (from
// 997px) and "All domains", back to the index; the index has
// "Print this sheet", which prints the sheet alone (html[data-print-sheet]
// for the length of the print; the page's own print is unchanged).

import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useBrokenLinks from "@docusaurus/useBrokenLinks";
import Heading from "@theme/Heading";
import CodeInline from "@theme/CodeInline";
import MDXCode from "@theme/MDXComponents/Code";
import { FiArrowLeft, FiArrowRight, FiArrowUp, FiPrinter } from "react-icons/fi";
import { definesTerm, usesTerm } from "./shorthand";
import styles from "./styles.module.css";

// Plain text of a title that may hold <code>, for its anchor id.
function textOf(node) {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  return textOf(node.props?.children);
}

function slug(node) {
  return textOf(node)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// The index's label: where "All domains" goes back to.
const INDEX_ID = "domain-sheet-index";

// "Scheduled tasks — at and cron" is "Scheduled tasks" in the index.
function shortOf({ short, title }) {
  if (short != null) return short;
  return typeof title === "string" ? title.split(" — ")[0] : title;
}

// The anchor comes from the short name (#sheet-selinux), so a shared
// link stays short; the full title's anchor is kept as an alias.
const idOf = (props) => `sheet-${slug(shortOf(props))}`;
const aliasOf = (props) => `sheet-${slug(props.title)}`;

// Every command in a domain: its fences and the inline code in its rows.
function codeIn(node, out = []) {
  if (node == null || typeof node !== "object") return out;
  if (Array.isArray(node)) {
    node.forEach((child) => codeIn(child, out));
    return out;
  }
  const { children } = node.props ?? {};
  if ((node.type === "code" || node.type === MDXCode) && typeof children === "string") {
    out.push(children);
  } else {
    codeIn(children, out);
  }
  return out;
}

// What a domain needs from its sheet: the shorthand it is first to use,
// and its neighbours, for the steps at its foot.
const SheetContext = React.createContext({ terms: [], firstUse: {}, steps: {} });

// Each domain's previous and next, by anchor: their ids and short names.
function stepsOf(domains) {
  const steps = {};
  domains.forEach((domain, i) => {
    const near = (d) => (d ? { id: idOf(d.props), short: shortOf(d.props) } : null);
    steps[idOf(domain.props)] = { prev: near(domains[i - 1]), next: near(domains[i + 1]) };
  });
  return steps;
}

// Which domain sets the shorthand up (the first whose code defines a
// term), and, per term, the first other domain whose commands use it:
// the one that carries its line.
function shorthandOf(shorthand = [], domains) {
  const terms = shorthand.map(([term, meaning]) => ({ term, meaning }));
  const setup = terms.length
    ? domains.find((domain) =>
        codeIn(domain.props.children).some((code) =>
          terms.some(({ term }) => definesTerm(code, term)),
        ),
      )
    : null;
  const firstUse = {};
  terms.forEach(({ term }) => {
    const first = domains.find(
      (domain) =>
        domain !== setup &&
        codeIn(domain.props.children).some((code) => usesTerm(code, term)),
    );
    if (first) firstUse[term] = idOf(first.props);
  });
  return { terms, setup, firstUse };
}

// Placeholders (<ns>, <server2>) are marked with the CSS Custom Highlight
// API, so the code's DOM and its copied text stay exactly the command.
const HIGHLIGHT = "sheet-placeholder";
const PLACEHOLDER = /<[A-Za-z][\w.-]*>/g;

function placeholderRanges(root) {
  const ranges = [];
  root.querySelectorAll("code").forEach((code) => {
    // Prism splits "<ns>" across tokens, so match on the code's whole
    // text and map each match back onto its text nodes.
    const nodes = [];
    let text = "";
    const walker = document.createTreeWalker(code, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.data) continue;
      nodes.push([n, text.length]);
      text += n.data;
    }
    const at = (offset) => {
      let i = nodes.length - 1;
      while (i > 0 && nodes[i][1] > offset) i -= 1;
      return [nodes[i][0], offset - nodes[i][1]];
    };
    for (const m of text.matchAll(PLACEHOLDER)) {
      const range = document.createRange();
      range.setStart(...at(m.index));
      range.setEnd(...at(m.index + m[0].length - 1));
      range.setEnd(range.endContainer, range.endOffset + 1);
      ranges.push(range);
    }
  });
  return ranges;
}

// A wrapped line breaks at its spaces only. Browsers also break after a
// hyphen or a slash, and between "=" and "<" ("yum-" / "repo.yml"), and
// no CSS property turns that off. So each run of non-space characters
// that holds such a character is gathered into one nowrap span, across
// Prism's token spans: a token cut by the run is split into two spans of
// the same class and colour. Only the DOM moves: the text, and so what
// copy and selection give, is the command as written, and each original
// node stays the one React rendered.
//
// A run wider than the line (k explain deploy.spec.template.spec.…) would
// then go on under the edge fade. So a long run is also cut into whole
// pieces with a <wbr> between them, in a box that keeps it whole while it
// fits and wraps it there only when it doesn't (styles.run). Never at a
// hyphen. The cuts come in two tiers: first after "=", "/" and ",", then
// after ".". Each first-tier piece with a "." in it is a box of its own,
// so it breaks at its dots only when it is wider than the line by
// itself: systemd.unit=multi-user.target wraps as "systemd.unit=" /
// "multi-user.target", never "systemd.unit=multi-user." / "target".
const BREAKABLE = /[^\s\w]/;
const RUN = /\S+/g;
const CUT_FIRST = /[/=,]/g;
const CUT_LAST = /\./g;
// Shorter runs fit the narrowest phone's line; they stay one piece.
const CUT_MIN = 20;
const kept = new WeakSet();

// The same token, holding `node` instead: a sibling span with its class
// and style.
function sibling(token, node) {
  const twin = token.cloneNode(false);
  twin.append(node);
  return twin;
}

// Where `text` (starting at `from` in the line) may be cut: after each
// match, but not after a leading "/" or at the end (a closing ",").
function cutsIn(text, from, pattern) {
  const cuts = [];
  for (const c of text.matchAll(pattern)) {
    if (c.index > 0 && c.index < text.length - 1) cuts.push(from + c.index + 1);
  }
  return cuts;
}

// Pieces into one run box, a <wbr> between each.
function boxRun(parts) {
  if (parts.length < 2) return parts[0];
  const run = document.createElement("span");
  run.className = styles.run;
  parts[0].before(run);
  parts.forEach((part, i) => {
    if (i) run.append(document.createElement("wbr"));
    run.append(part);
  });
  return run;
}

function keepLine(line) {
  const segments = [];
  let text = "";
  for (const token of line.children) {
    if (token.tagName !== "SPAN" || !token.firstChild) continue;
    const node = token.firstChild;
    // Not the shape Prism renders (token > text): leave the line alone.
    if (token.childNodes.length !== 1 || node.nodeType !== Node.TEXT_NODE) return;
    segments.push({ token, node, start: text.length });
    text += node.data;
  }
  const runs = [...text.matchAll(RUN)].filter((m) => m[0].length > 1 && BREAKABLE.test(m[0]));
  // The text from `from` to `to`, gathered into one span of `className`.
  const gather = (from, to, className) => {
    const pieces = [];
    for (const { token, node, start } of segments) {
      const end = start + node.data.length;
      if (end <= from || start >= to) continue;
      const a = Math.max(from, start) - start;
      const z = Math.min(to, end) - start;
      if (z < node.data.length) token.after(sibling(token, node.splitText(z)));
      if (a > 0) {
        const piece = sibling(token, node.splitText(a));
        token.after(piece);
        pieces.push(piece);
      } else {
        pieces.push(token);
      }
    }
    const span = document.createElement("span");
    span.className = className;
    pieces[0].before(span);
    span.append(...pieces);
    return span;
  };
  // From the last run back, and the last piece of a run back: a token
  // only ever loses its tail, so the offsets before it still hold.
  for (const m of runs.reverse()) {
    const from = m.index;
    const to = from + m[0].length;
    const long = m[0].length >= CUT_MIN;
    // First-tier pieces, then each one's bounds at its dots.
    const firsts = [from, ...(long ? cutsIn(m[0], from, CUT_FIRST) : []), to];
    const tiers = [];
    for (let i = 1; i < firsts.length; i += 1) {
      const [a, z] = [firsts[i - 1], firsts[i]];
      tiers.push([a, ...(long ? cutsIn(text.slice(a, z), a, CUT_LAST) : []), z]);
    }
    const words = tiers.map(() => []);
    for (let t = tiers.length - 1; t >= 0; t -= 1) {
      const bounds = tiers[t];
      for (let i = bounds.length - 1; i > 0; i -= 1) {
        words[t].unshift(gather(bounds[i - 1], bounds[i], styles.word));
      }
    }
    boxRun(words.map(boxRun));
  }
}

function keepWords(root) {
  root.querySelectorAll("pre code .token-line").forEach((line) => {
    if (kept.has(line)) return;
    kept.add(line);
    keepLine(line);
  });
}

function usePlaceholderHighlight(ref) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const canPaint = typeof Highlight !== "undefined" && Boolean(CSS.highlights);
    let highlight = canPaint ? CSS.highlights.get(HIGHLIGHT) : null;
    if (canPaint && !highlight) {
      highlight = new Highlight();
      CSS.highlights.set(HIGHLIGHT, highlight);
    }
    let own = [];
    let frame = 0;
    const paint = () => {
      frame = 0;
      keepWords(root);
      if (!highlight) return;
      own.forEach((r) => highlight.delete(r));
      own = placeholderRanges(root);
      own.forEach((r) => highlight.add(r));
    };
    paint();
    // Wrap and copy re-render a block's lines; paint again once they settle.
    const observer = new MutationObserver(() => {
      if (!frame) frame = requestAnimationFrame(paint);
    });
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      own.forEach((r) => highlight?.delete(r));
    };
  }, [ref]);
}

// Arriving on a domain (a search hit, the index, a shared link, the
// step to the next one), its heading takes a brief cue once the page is
// still, so the fade is seen, not spent on the way. The arrival itself
// (the jump, the check, the focus) is DocItem/TOC/Mobile's: it sends
// "handbook:arrive" to what it landed on, an old full-title anchor
// already resolved to its heading. Long jumps go at once and short hops
// glide there too, by one rule for every arrival.
const ARRIVE_EVENT = "handbook:arrive";
const ARRIVE_MS = 2100;

function useArrivalCue(ref) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    let fade = 0;
    let heading = null;
    const onArrive = (event) => {
      const target = event.target;
      if (!target.matches?.(".domain-heading")) return;
      clearTimeout(fade);
      heading?.classList.remove(styles.arrived);
      heading = target;
      void heading.offsetWidth; // restart the fade on a repeat jump
      heading.classList.add(styles.arrived);
      fade = setTimeout(() => heading.classList.remove(styles.arrived), ARRIVE_MS);
    };
    root.addEventListener(ARRIVE_EVENT, onArrive);
    return () => {
      root.removeEventListener(ARRIVE_EVENT, onArrive);
      clearTimeout(fade);
    };
  }, [ref]);
}

// The index link moves focus to the heading as well as the view, so the
// next Tab continues from the domain (so do the steps to the previous and
// next domain; "All domains" does the same for the index's label). tabindex is set only now: a heading
// that is focusable from the start takes the browser's own fragment
// focus, which scrolls it into view at once and cuts the smooth scroll
// short halfway down the page.
function focusHeading(event) {
  const heading = document.getElementById(decodeURIComponent(event.currentTarget.hash.slice(1)));
  if (!heading) return;
  requestAnimationFrame(() => {
    heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
  });
}

// Prints the sheet alone: html[data-print-sheet] switches the print CSS
// to the sheet (and its header) for this one print, then goes.
function printSheet() {
  const html = document.documentElement;
  const done = () => {
    html.removeAttribute("data-print-sheet");
    window.removeEventListener("afterprint", done);
  };
  window.addEventListener("afterprint", done);
  html.setAttribute("data-print-sheet", "");
  window.print();
}

// The printed sheet's header: the page's title (which names the exam)
// and where the page lives. Read after mount, so it is never in the
// server HTML or the search index; it shows on paper only.
function usePrintHead() {
  const [head, setHead] = useState(null);
  useEffect(() => {
    const title = document.querySelector("article h1")?.textContent.trim();
    setHead({ title, url: `${window.location.origin}${window.location.pathname}` });
  }, []);
  return head;
}

// On paper an "In the repo" link prints its path in the repo
// (banks/ckad-mock-01/q04/question.md), not the whole GitHub URL; the
// repo itself is named once, in the sheet's printed header.
const GITHUB_FILE = /^https:\/\/github\.com\/([^/]+\/[^/?#]+)(?:\/(?:blob|tree)\/[^/]+\/([^?#]+))?/;

function repoOf(href) {
  const m = GITHUB_FILE.exec(href);
  return m ? `github.com/${m[1]}` : null;
}

function repoPath(href) {
  const m = GITHUB_FILE.exec(href);
  if (!m?.[2]) return null;
  const line = /#L(\d+)$/.exec(href);
  return line ? `${m[2]}, line ${line[1]}` : m[2];
}

export default function DomainSheet({ shorthand, children }) {
  const ref = useRef(null);
  usePlaceholderHighlight(ref);
  useArrivalCue(ref);
  const head = usePrintHead();
  // The index's label is a link target ("All domains"); the build checks
  // anchors only against the ids it was told about.
  useBrokenLinks().collectAnchor(INDEX_ID);
  const domains = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child) && child.type === Domain,
  );
  const { terms, setup, firstUse } = shorthandOf(shorthand, domains);
  const repos = [
    ...new Set(domains.flatMap((d) => (d.props.tasks ?? []).map((t) => repoOf(t.href)))),
  ].filter(Boolean);
  return (
    <div
      ref={ref}
      className={clsx(styles.sheet, "domain-sheet")}
      // For the copy note (codeBlocks.js): what a copied command may need,
      // and the domain that sets it up.
      data-shorthand={terms.length ? terms.map((t) => t.term).join(" ") : undefined}
      data-shorthand-setup={setup ? textOf(shortOf(setup.props)) : undefined}
    >
      {head ? (
        <div className={styles.printHead}>
          {head.title ? <p className={styles.printTitle}>{head.title}</p> : null}
          <p className={styles.printMeta}>
            Key commands by domain · {head.url}
            {repos.length ? (
              <>
                <br />
                In the repo: {repos.join(" · ")}
              </>
            ) : null}
          </p>
        </div>
      ) : null}
      {domains.length > 1 ? (
        <nav className={styles.index} aria-labelledby={INDEX_ID}>
          <p id={INDEX_ID} className={styles.label}>
            Domains
          </p>
          {/* Rows for the first column (styles.indexList): it runs down
              the first column, then the second. */}
          <ol
            className={styles.indexList}
            style={{ "--index-rows": Math.ceil(domains.length / 2) }}
          >
            {domains.map((domain) => {
              const id = idOf(domain.props);
              return (
                <li key={id}>
                  <Link
                    className={styles.indexLink}
                    to={`#${id}`}
                    onClick={focusHeading}
                  >
                    {/* One box, so a 44px flex row keeps a name with
                        <code> in it as one line of text. */}
                    <span>{shortOf(domain.props)}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
          <p className={styles.printRow}>
            <button type="button" className={styles.print} onClick={printSheet}>
              <FiPrinter className={styles.icon} aria-hidden="true" />
              Print this sheet
            </button>
          </p>
        </nav>
      ) : null}
      {terms.length ? (
        <dl className={styles.rows}>
          <Row label="Shorthand">
            <Meanings terms={terms} />
          </Row>
        </dl>
      ) : null}
      <SheetContext.Provider value={{ terms, firstUse, steps: stepsOf(domains) }}>
        {children}
      </SheetContext.Provider>
    </div>
  );
}

// "k is kubectl · $do is --dry-run=client -o yaml"
function Meanings({ terms }) {
  return terms.map(({ term, meaning }, i) => (
    <React.Fragment key={term}>
      {i ? <span className={styles.sep}> · </span> : null}
      <Command text={term} /> is <Command text={meaning} />
    </React.Fragment>
  ));
}

// One label row: a <dt>/<dd> pair, so the label is a term, not run-in
// text (search excerpts and screen readers keep "Verify" apart from the
// command after it).
//
// Search and other text readers flatten the rows, so hidden marks keep
// them apart there: "Verify: getenforce · In the repo: Task 15". They
// are aria-hidden; a screen reader has the list's own structure.
function Hidden({ children }) {
  return (
    <span className={styles.srOnly} aria-hidden="true">
      {children}
    </span>
  );
}

function Row({ label, after = false, children }) {
  return (
    <div className={styles.line}>
      <dt className={styles.label}>
        {after ? <Hidden>· </Hidden> : null}
        {label}
        <Hidden>: </Hidden>
      </dt>
      <dd className={styles.text}>{children}</dd>
    </div>
  );
}

// A heading per domain (an h3 in the article outline, with the "#" link
// so search can land on it; kept out of "On this page", which lists only
// the page's own sections), then the code, then the label rows.
//
// The row closes on its steps, outside the heading's run of siblings, so
// a search hit on the domain doesn't end on them: from 997px the previous
// and next domains by their short names (phones have the band's list),
// then "All domains", back to the index.
export function Domain({ title, short, tasks = [], children }) {
  const { terms, firstUse, steps } = React.useContext(SheetContext);
  const id = idOf({ title, short });
  const alias = aliasOf({ title });
  // A link to the old anchor is a link to this domain.
  useBrokenLinks().collectAnchor(alias);
  const all = React.Children.toArray(children);
  const isRow = (child) => React.isValidElement(child) && child.type === Verify;
  const rows = all
    .filter(isRow)
    .map((row, i) => (i ? React.cloneElement(row, { after: true }) : row));
  const body = all.filter((child) => !isRow(child));
  // The shorthand this domain is the first to use.
  const used = terms.filter(({ term }) => firstUse[term] === id);
  const { prev, next } = steps[id] ?? {};
  return (
    <div className={styles.domain}>
      <Hidden> · </Hidden>
      <div>
        {alias !== id ? (
          <span id={alias} data-alias-of={id} className={styles.alias} aria-hidden="true" />
        ) : null}
        <Heading
          as="h3"
          id={id}
          // The index's short name, for wayfinding that names the domain
          // in view (the phone band, the desktop contents list).
          data-short={textOf(shortOf({ short, title }))}
          className={clsx(styles.title, "domain-heading")}
        >
          {title}
        </Heading>
        {/* Right under the name, so the reader has the meaning before
            the first command that needs it. On paper it is said once,
            under the sheet's header.
            domain-sheet-shorthand: a stable name for the search index
            to skip. */}
        {used.length ? (
          <p className={clsx(styles.shorthand, "domain-sheet-shorthand")}>
            <span className={styles.label}>
              Shorthand
              <Hidden>: </Hidden>
            </span>
            <span>
              <Meanings terms={used} />
            </span>
          </p>
        ) : null}
        {body}
        {rows.length || tasks.length ? (
          <dl className={styles.rows}>
            {rows}
            {tasks.length ? (
              <Row label="In the repo" after={rows.length > 0}>
                {tasks.map((task, i) => (
                  <React.Fragment key={task.href}>
                    {i ? <span className={styles.sep}> · </span> : null}
                    {/* Unclassed, so it takes the article link style and
                        the drawn ↗; on paper, its path in the repo is
                        written after it. */}
                    <Link to={task.href} data-print-path={repoPath(task.href) ?? undefined}>
                      {task.label}
                    </Link>
                  </React.Fragment>
                ))}
              </Row>
            ) : null}
          </dl>
        ) : null}
      </div>
      {/* domain-sheet-back: a stable name for the search index to skip. */}
      <div className={clsx(styles.back, "domain-sheet-back")}>
        {prev || next ? (
          <span className={styles.steps}>
            {prev ? (
              <Link className={styles.stepLink} to={`#${prev.id}`} onClick={focusHeading}>
                <FiArrowLeft className={styles.icon} aria-hidden="true" />
                <span>
                  <span className={styles.srText}>Previous domain: </span>
                  {prev.short}
                </span>
              </Link>
            ) : null}
            {prev && next ? (
              <span className={styles.sep} aria-hidden="true">
                ·
              </span>
            ) : null}
            {next ? (
              <Link className={styles.stepLink} to={`#${next.id}`} onClick={focusHeading}>
                <span>
                  <span className={styles.srText}>Next domain: </span>
                  {next.short}
                </span>
                <FiArrowRight className={styles.icon} aria-hidden="true" />
              </Link>
            ) : null}
          </span>
        ) : null}
        <Link className={styles.backLink} to={`#${INDEX_ID}`} onClick={focusHeading}>
          All domains
          <FiArrowUp className={styles.icon} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

// An inline command breaks only between its words, never inside one, so
// "enable-linger" never splits at its hyphen. One that fits the
// narrowest phone column stays whole; a longer one keeps its first and
// last few words together, so "k -n" is never left alone at a line end.
// A word longer than a phone column may still wrap inside itself.
const WHOLE_MAX = 34;
const END_MIN = 8;

// Each word is unbreakable on its own, so where a group may break (the
// narrowest phones) it breaks between words, never at "-o"'s hyphen.
function words(group) {
  return group.split(" ").map((word, i) => (
    <React.Fragment key={i}>
      {i ? " " : null}
      <span className={styles.word}>{word}</span>
    </React.Fragment>
  ));
}

function Command({ text }) {
  const groups = text.length <= WHOLE_MAX ? [text] : text.split(" ");
  while (groups.length > 2 && groups[0].length < END_MIN) {
    groups.splice(0, 2, `${groups[0]} ${groups[1]}`);
  }
  while (groups.length > 2 && groups[groups.length - 1].length < END_MIN) {
    groups.splice(-2, 2, `${groups[groups.length - 2]} ${groups[groups.length - 1]}`);
  }
  return (
    <CodeInline>
      {groups.map((group, i) => (
        <React.Fragment key={i}>
          {i ? " " : null}
          {group.length <= WHOLE_MAX ? (
            <span className={styles.nobreak}>{words(group)}</span>
          ) : (
            words(group)
          )}
        </React.Fragment>
      ))}
    </CodeInline>
  );
}

// Only inline code: links and emphasis in the row pass through untouched.
function asCommand(child) {
  return React.isValidElement(child) &&
    (child.type === MDXCode || child.type === "code") &&
    typeof child.props?.children === "string" ? (
    <Command text={child.props.children} />
  ) : (
    child
  );
}

// The commands in a row's text, through Command; a fragment (a JSX
// prop such as the legend) is opened first.
function commands(node) {
  const children =
    React.isValidElement(node) && node.type === React.Fragment ? node.props.children : node;
  return React.Children.map(children, asCommand);
}

// How to know it worked, the way the exam would check it. Domain moves
// it into the sheet's label rows.
export function Verify({ after, children }) {
  return (
    <Row label="Verify" after={after}>
      {commands(children)}
    </Row>
  );
}
