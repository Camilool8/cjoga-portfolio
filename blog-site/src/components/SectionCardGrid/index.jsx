import React, { createContext, useContext } from 'react';
import Link from '@docusaurus/Link';
import { usePluginData } from '@docusaurus/useGlobalData';
import { FiArrowRight, FiChevronRight } from 'react-icons/fi';
import rows from '@site/src/components/ReaderPaths/rows.module.css';
import styles from './styles.module.css';

// Section rows for the index pages: the same hairline link rows as the
// landing's reader paths (ReaderPaths/rows.module.css), with a line of
// description under each title and, for dated pages, the date in the
// article dateline's form. Click anywhere on a row to follow it.
//
// Titles are h2s: each index page's rows sit directly under its h1. In a
// SectionGroup they are h3s, under the group's own h2.
//
// Dates come from the linked doc's own front matter, collected at build
// time by plugins/doc-dates.js, so a row never disagrees with its page and
// the index doesn't import the articles it lists. Only grids marked
// `dated` show them (opinions and tips, where recency matters), or only
// the rows marked `dated` in a mixed list (a hub's tips under its
// overview), and only when those rows' dates differ; `date` and
// `updated` props on a row override the lookup.

const Dated = createContext({ show: false, all: false });
const Level = createContext(2);

const fmt = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

function toDate(value) {
  if (!value) {
    return null;
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

// One date per row, the page's latest: "Updated" when it has an update
// newer than its publication, else "Published". On a list of pages
// published together, the update is what tells them apart. A
// correction-only update (`last_update_kind: correction`) isn't news, so
// its row keeps the publication date; the article's own dateline says
// "Corrected".
function rowDate(date, updated, kind) {
  const published = toDate(date);
  const changed = kind === 'correction' ? null : toDate(updated);
  if (changed && (!published || changed > published)) {
    return { label: 'Updated', day: changed };
  }
  return published ? { label: 'Published', day: published } : null;
}

function RowDate({ date, updated, kind }) {
  const shown = rowDate(date, updated, kind);
  if (!shown) {
    return null;
  }
  return (
    <p className={rows.meta}>
      <span>{shown.label}</span>
      <time dateTime={shown.day.toISOString().slice(0, 10)}>
        {fmt.format(shown.day)}
      </time>
    </p>
  );
}

// What a row's date line would read, as text (see RowDate).
function shownLine(props, all) {
  const dates = all?.[props?.href];
  const shown = rowDate(
    props?.date ?? dates?.date,
    props?.updated ?? dates?.updated,
    props?.updated ? undefined : dates?.kind,
  );
  return shown ? `${shown.label} ${shown.day.toISOString().slice(0, 10)}` : null;
}

// A date column says something only when the rows differ. When every
// row would print the same line (pages published together, never
// updated), the column is noise repeated down the list, so the grid
// drops it; it returns by itself once one page is updated or a page with
// another date joins the list.
export default function SectionCardGrid({ dated = false, children }) {
  const all = usePluginData('doc-dates');
  const grouped = useContext(Level) === 3;
  const cards = React.Children.toArray(children)
    .filter(React.isValidElement)
    .filter((card) => dated || card.props.dated);
  const lines = new Set(cards.map((card) => shownLine(card.props, all)));
  const show = cards.length > 1 && lines.size > 1;
  // In a group the group draws the rules around the list.
  const frame = grouped ? styles.groupList : `${rows.framed} ${styles.grid}`;
  return (
    <Dated.Provider value={{ show, all: dated }}>
      <ul className={`section-index-list ${rows.list} ${frame}`}>
        {children}
      </ul>
    </Dated.Provider>
  );
}

// A hub that lists its sections' real pages instead of the sections
// themselves (Engineering: Homelab, Work), so a reader reaches a tip from
// the first index rather than through two more. Each group opens on the
// reader paths' rule and dot with a quiet h2 that links the section's
// own hub; the link sits inside the heading, never around it, and the
// rows under it drop to h3. The wrapper carries `section-index-list` too,
// so search skips the group headings with the rows: they repeat the hubs'
// own titles.
export function SectionGroup({ title, href, dated = false, children }) {
  return (
    <div className={`section-index-list ${styles.group}`}>
      <h2 className={styles.groupTitle}>
        <Link to={href} className={styles.groupLink}>
          {title}
          <FiChevronRight className={styles.groupArrow} aria-hidden="true" />
        </Link>
      </h2>
      <Level.Provider value={3}>
        <SectionCardGrid dated={dated}>{children}</SectionCardGrid>
      </Level.Provider>
    </div>
  );
}

// `secondary` ({ href, label }) adds one quiet link under the row's
// text, for a part of the page worth going to directly (a guide's
// night-before sheet). It is a sibling of the row's link, never inside
// it, so each is its own Tab stop with its own name; the hidden title
// tells the row's secondary links apart for a screen reader's link list.
export function SectionCard({ href, title, description, date, updated, dated: own, secondary }) {
  const shown = useContext(Dated);
  const Title = useContext(Level) === 3 ? 'h3' : 'h2';
  const dated = shown.show && (shown.all || own);
  const all = usePluginData('doc-dates');
  const dates = dated ? all?.[href] : undefined;
  return (
    <li className={secondary ? `${rows.item} ${styles.withSecondary}` : rows.item}>
      <Link to={href} className={`${rows.row} ${rows.rowDetailed}`}>
        <div className={rows.text}>
          <Title className={rows.label}>{title}</Title>
          {description && <p className={rows.detail}>{description}</p>}
          <RowDate
            date={date ?? dates?.date}
            updated={updated ?? dates?.updated}
            kind={updated ? undefined : dates?.kind}
          />
        </div>
        <FiArrowRight className={rows.arrow} aria-hidden="true" />
      </Link>
      {secondary ? (
        <Link to={secondary.href} className={styles.secondary}>
          {secondary.label}
          <span className={styles.srOnly}>, {title}</span>
        </Link>
      ) : null}
    </li>
  );
}
