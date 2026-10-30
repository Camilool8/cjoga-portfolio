// The handbook's entry points by reader, as hairline rows: a heading per
// reader on the left, its links on the right from 997px, and from 1200px
// the four readers two by two (heading over links). Used by the
// landing page and the 404 page. The rows themselves (rows.module.css)
// are shared with SectionCardGrid on the section index pages.

import React from "react";
import Link from "@docusaurus/Link";
import { FiArrowRight } from "react-icons/fi";
import READER_PATHS from "@site/src/data/readerPaths";
import styles from "./styles.module.css";
import rows from "./rows.module.css";

// A hyphenated name ("kubestronaut-sim") stays whole: a line that ends
// on "kubestronaut-" reads as a different word.
function keepNamesWhole(text) {
  return text.split(/(\S+-\S+)/).map((part, i) =>
    i % 2 ? (
      <span key={i} className={styles.whole}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}

function PathBlock({ path }) {
  const headingId = `path-${path.id}`;
  return (
    <section className={styles.path} aria-labelledby={headingId}>
      <div className={styles.pathHead}>
        <h2 id={headingId} className={styles.pathTitle}>
          {path.title}
        </h2>
        {path.intro ? (
          <p className={styles.pathIntro}>{keepNamesWhole(path.intro)}</p>
        ) : null}
      </div>
      <ul className={`${rows.list} ${styles.links}`}>
        {path.rows.map((row) => (
          <li key={row.to} className={rows.item}>
            {/* An absolute URL is the portfolio (one product): it opens
                in place, not in a new tab. */}
            <Link
              to={row.to}
              className={rows.row}
              {...(/^https?:/.test(row.to) ? { target: "_self" } : {})}
            >
              <span className={`${rows.text} ${rows.label}`}>{row.label}</span>
              <FiArrowRight className={rows.arrow} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ReaderPaths() {
  return (
    <div className={styles.paths}>
      {READER_PATHS.map((path) => (
        <PathBlock key={path.id} path={path} />
      ))}
    </div>
  );
}
