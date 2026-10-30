// The landing's freshness line: the three most recently changed pages,
// under the reader paths, headed "Last updated". The heading names no
// age ("Recently" read false once the newest change was a season old);
// the date under each title says how old it is. Dates are the pages' own
// front matter (via plugins/doc-dates.js), the same days their datelines
// and the Atom feed show: a page's latest day is its update, else its
// publication. The rows are the reader paths' rows (rows.module.css):
// hairlines between them and the arrow that nudges, with the date in the
// section index lists' form ("Updated Aug 10, 2026"). A page whose last
// change only corrected it (last_update_kind: correction) is left out:
// a "Since then" note is not news, and listing it would spotlight a page
// for what it no longer says.

import React from "react";
import Link from "@docusaurus/Link";
import { usePluginData } from "@docusaurus/useGlobalData";
import { FiArrowRight } from "react-icons/fi";
import styles from "./styles.module.css";
import rows from "./rows.module.css";

const fmt = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const latest = ({ date, updated }) =>
  [date, updated].filter(Boolean).sort().pop();

// Newest change first; on the same day a newer page leads an older one,
// then titles in order, so the row is stable from build to build.
function recent(all, count) {
  return Object.entries(all ?? {})
    .filter(([, doc]) => doc.title && latest(doc) && doc.kind !== "correction")
    .map(([to, doc]) => ({
      to,
      title: doc.title,
      date: doc.date,
      day: latest(doc),
      // "Updated" only when the page changed after it was published.
      updated: Boolean(doc.updated && doc.date && doc.updated > doc.date),
    }))
    .sort(
      (a, b) =>
        b.day.localeCompare(a.day) ||
        (b.date || "").localeCompare(a.date || "") ||
        a.title.localeCompare(b.title),
    )
    .slice(0, count);
}

export default function RecentlyUpdated({ count = 3 }) {
  const pages = recent(usePluginData("doc-dates"), count);
  if (pages.length === 0) {
    return null;
  }
  // Three rows on one day are one batch: the date goes once, under the
  // heading ("Last updated / Aug 10, 2026"), instead of repeating down
  // the column.
  const sameDay = pages.length > 1 && pages.every((p) => p.day === pages[0].day);
  return (
    <section className={styles.recent} aria-labelledby="last-updated">
      <div className={styles.recentHead}>
        <h2 id="last-updated" className={styles.recentTitle}>
          Last updated
        </h2>
        {sameDay ? (
          <p className={styles.recentCaption}>
            <time dateTime={pages[0].day}>
              {fmt.format(new Date(pages[0].day))}
            </time>
          </p>
        ) : null}
      </div>
      <ul className={`${rows.list} ${styles.recentList}`}>
        {pages.map((page) => (
          <li key={page.to} className={rows.item}>
            <Link to={page.to} className={rows.row}>
              <span className={rows.text}>
                <span className={`${rows.label} ${styles.recentLabel}`}>
                  {page.title}
                </span>
                {sameDay ? null : (
                  <span className={rows.meta}>
                    <span>{page.updated ? "Updated" : "Published"}</span>
                    <time dateTime={page.day}>
                      {fmt.format(new Date(page.day))}
                    </time>
                  </span>
                )}
              </span>
              <FiArrowRight className={rows.arrow} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
