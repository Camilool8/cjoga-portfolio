// Fact sheets: a description list of hairline rows, label on the left and
// value on the right, so a reader on a phone gets the facts before the
// essay. Two uses, one look:
//
// - FactSheet + Fact, for a page that opens on a few plain facts (the
//   Work pages: role, employer, dates). Values are inline Markdown, so
//   links keep the article's link style and external arrow.
//
//     <FactSheet>
//       <Fact label="Role">DevOps Consultant</Fact>
//       <Fact label="Since">April 2022</Fact>
//     </FactSheet>
//
// - ExamFacts, for a cert guide. One fixed schema in one order on every
//   guide, so the three read alike. Every value comes from the guide's own
//   text, the official exam page or the owner; nothing is filled in from
//   elsewhere. A figure the official page doesn't publish says so, with
//   the vendor and the day the page was checked, rather than sending the
//   reader to a page that won't answer. The official page is linked once,
//   on a line under the list.
//
//     <ExamFacts
//       official={{ href: 'https://…', name: "Red Hat’s EX200 page", vendor: 'Red Hat' }}
//       exam="EX200"                  // left out when the title already says it
//       duration="3 hours"
//       passMark="210 of 300 points"
//       sources={{ passMark: 'my sitting, 2024' }}
//       version={{ exam: 'RHEL 10', lab: 'RHEL 9' }}
//       asOf="2026-10-30"             // YYYY, YYYY-MM, YYYY-MM-DD or mid-YYYY
//     />
//
//   `asOf` is only the day the sheet was last verified. A fact that comes
//   from somewhere older or narrower (a sitting, the owner's word) names
//   it in `sources`, and the row carries it after its value in the quiet
//   tone ("210 of 300 points · my sitting, 2024"), so a deep link or a
//   search excerpt that shows the row alone still says where it is from.
//   `checked` (with `unpublished`) is the day the official page was read
//   for the rows it doesn't answer.
//
//   `version` is { exam, lab } ("Exam: RHEL 10 · Lab: RHEL 9"), or just
//   { exam } when there is no lab to compare.
//
//   Each row is an anchor, the same on every guide, so a search hit or a
//   shared link can land on the fact that answers it: #fact-exam,
//   #fact-format, #fact-duration, #fact-pass-mark, #fact-version,
//   #fact-as-of. A shared row takes its first fact's id, and the others
//   land on it through empty aliases; without an Exam row, #fact-exam is
//   an alias of the first row. Arriving on one tints the row, as arriving
//   on a sheet's domain tints its name.

import React, { useEffect, useRef } from "react";
import Link from "@docusaurus/Link";
import useBrokenLinks from "@docusaurus/useBrokenLinks";
import styles from "./styles.module.css";

// Search and other text readers flatten the list, so hidden marks keep
// the rows apart there: "Role: DevOps Consultant · Since: April 2022".
// They are aria-hidden; a screen reader has the list's own structure.
function Hidden({ children }) {
  return (
    <span className={styles.srOnly} aria-hidden="true">
      {children}
    </span>
  );
}

export function FactSheet({ children }) {
  let n = 0;
  return (
    <dl className={styles.facts}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child) && n++ ? React.cloneElement(child, { after: true }) : child,
      )}
    </dl>
  );
}

export function Fact({ label, children, muted = false, after = false, id, aliases = [] }) {
  return (
    // A div per pair is valid inside <dl> and keeps term and value on
    // one hairline row. Aliases sit in the term, where a span may go.
    <div id={id} className={styles.row}>
      <dt className={styles.term}>
        {aliases.map((alias) => (
          <span key={alias} id={alias} data-alias-of={id} className={styles.alias} aria-hidden="true" />
        ))}
        {after ? <Hidden>· </Hidden> : null}
        {label}
        <Hidden>: </Hidden>
      </dt>
      <dd className={muted ? `${styles.value} ${styles.muted}` : styles.value}>
        {children}
      </dd>
    </div>
  );
}

const EXAM_SCHEMA = [
  ["exam", "Exam"],
  ["format", "Format"],
  ["duration", "Duration"],
  ["passMark", "Pass mark"],
  ["version", "Version"],
  ["asOf", "As of"],
];

// passMark is #fact-pass-mark.
const factId = (key) => `fact-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;

// Arriving on a row (DocItem/TOC/Mobile sends "handbook:arrive" once the
// page is still, an alias already resolved to its row): the dim accent
// behind it for two seconds, as on a sheet's domain.
const ARRIVE_EVENT = "handbook:arrive";
const ARRIVE_MS = 2100;

function useArrivalCue(ref) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    let fade = 0;
    let row = null;
    const onArrive = (event) => {
      if (!event.target.id || !event.target.classList?.contains(styles.row)) return;
      clearTimeout(fade);
      row?.classList.remove(styles.arrived);
      row = event.target;
      void row.offsetWidth; // restart the fade on a repeat jump
      row.classList.add(styles.arrived);
      fade = setTimeout(() => row.classList.remove(styles.arrived), ARRIVE_MS);
    };
    root.addEventListener(ARRIVE_EVENT, onArrive);
    return () => {
      root.removeEventListener(ARRIVE_EVENT, onArrive);
      clearTimeout(fade);
    };
  }, [ref]);
}

// One date format on every guide: "Oct 30, 2026", "Aug 2026", "2026",
// "Mid-2026", as precise as the source. Parsed by hand, in UTC, so a day
// never slips across a time zone between the server's HTML and the client.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDay(value) {
  const mid = /^mid-(\d{4})$/i.exec(String(value));
  if (mid) return `Mid-${mid[1]}`;
  const [, year, month, day] = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(String(value)) ?? [];
  if (!year) return String(value);
  if (!month) return year;
  const name = MONTHS[Number(month) - 1];
  return day ? `${name} ${Number(day)}, ${year}` : `${name} ${year}`;
}

// The as-of value, the day the sheet was last verified. A bare or
// mid-year stays plain text: <time> wants at least a month.
function AsOf({ date }) {
  const day = formatDay(date);
  return /^\d{4}-\d{2}/.test(String(date)) ? <time dateTime={String(date)}>{day}</time> : day;
}

// "Exam: RHEL 10 · Lab: RHEL 9", or the exam's value alone when there is
// no lab to set beside it.
function Version({ value }) {
  if (value == null || typeof value !== "object" || React.isValidElement(value)) return value;
  return value.lab ? `Exam: ${value.exam} · Lab: ${value.lab}` : value.exam;
}

// Where a row's value comes from, after it in the quiet tone: a side
// note, so <small>. The space before it is the only break, so the source
// moves down whole ("· my sitting, 2024") rather than splitting.
function Source({ children }) {
  return (
    <>
      {" "}
      <small className={styles.source}>· {children}</small>
    </>
  );
}

// The official page's link. It stays a plain <a> so it takes the
// article's link style and drawn ↗; the last word is held to the arrow
// so the arrow never wraps onto a line by itself.
function OfficialLink({ official }) {
  const words = official.name.split(" ");
  const last = words.pop();
  return (
    <Link to={official.href} style={{ whiteSpace: "nowrap" }}>
      <span className={styles.wrap}>{words.join(" ")} </span>
      {last}
    </Link>
  );
}

// Neighbouring facts with the same answer share one row, their labels
// stacked; the hidden comma keeps a screen reader from running them
// together.
function Labels({ keys }) {
  return keys.map(([key, label], i) => (
    <span key={key} className={styles.termLine}>
      {label}
      {i < keys.length - 1 ? <span className={styles.srOnly}>, </span> : null}
    </span>
  ));
}

export default function ExamFacts({
  official,
  checked,
  unpublished = [],
  sources = {},
  ...values
}) {
  const ref = useRef(null);
  useArrivalCue(ref);
  // The build checks anchors only against the ids it was told about.
  const brokenLinks = useBrokenLinks();
  EXAM_SCHEMA.forEach(([key]) => brokenLinks.collectAnchor(factId(key)));

  const stateOf = (key) =>
    unpublished.includes(key) ? "unpublished" : values[key] == null ? "missing" : "stated";

  // Rows in schema order; a run of unpublished (or unstated) facts is
  // one row. The Exam row is the one that may be left out: on a guide
  // whose title is the exam's name ("CKAD guide") it would only repeat it.
  const rows = [];
  for (const entry of EXAM_SCHEMA) {
    const [key] = entry;
    if (key === "exam" && values.exam == null) continue;
    const state = stateOf(key);
    const prev = rows[rows.length - 1];
    if (state !== "stated" && prev?.state === state) {
      prev.keys.push(entry);
    } else {
      rows.push({ state, keys: [entry] });
    }
  }
  const examAlias = values.exam == null ? [factId("exam")] : [];

  const vendor = official?.vendor ?? "the vendor";
  const valueOf = ([key]) => {
    const value =
      key === "asOf" ? (
        <AsOf date={values.asOf} />
      ) : key === "version" ? (
        <Version value={values.version} />
      ) : (
        values[key]
      );
    return (
      <>
        {value}
        {sources[key] ? <Source>{sources[key]}</Source> : null}
      </>
    );
  };

  return (
    <div ref={ref} className={styles.withNote}>
      <FactSheet>
        {rows.map(({ state, keys }, i) => {
          const aliases = (i === 0 ? examAlias : []).concat(
            keys.slice(1).map(([key]) => factId(key)),
          );
          return state === "stated" ? (
            <Fact key={keys[0][0]} id={factId(keys[0][0])} aliases={aliases} label={keys[0][1]}>
              {valueOf(keys[0])}
            </Fact>
          ) : (
            <Fact
              key={keys[0][0]}
              id={factId(keys[0][0])}
              aliases={aliases}
              label={<Labels keys={keys} />}
              muted
            >
              {state === "unpublished" ? (
                <>
                  Not published by {vendor}
                  {checked ? <Source>checked {formatDay(checked)}</Source> : null}
                </>
              ) : (
                "Not stated here"
              )}
            </Fact>
          );
        })}
      </FactSheet>
      {official ? (
        <p className={styles.note}>
          <Hidden>· </Hidden>
          Check before you book: <OfficialLink official={official} />
          <Hidden> ·</Hidden>
        </p>
      ) : null}
    </div>
  );
}
