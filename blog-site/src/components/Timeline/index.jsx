import React from 'react';
import styles from './styles.module.css';

// Vertical timeline — rail + dot markers, accent year, display-font title.
// Designed to summarize multi-year arcs as a TL;DR view above prose.
//
// Usage:
//   <Timeline>
//     <TimelineEntry year="2002" title="Born in Santo Domingo" />
//     <TimelineEntry year="Apr 2022" title="Hired by Shadow-Soft" emphasis>
//       Optional body — short. Skip if the title is the whole point.
//     </TimelineEntry>
//   </Timeline>

export default function Timeline({ children, caption }) {
  return (
    <div className={styles.wrap}>
      {caption && <div className={styles.caption}>{caption}</div>}
      <ol className={styles.timeline}>{children}</ol>
    </div>
  );
}

export function TimelineEntry({
  year,
  title,
  emphasis = false,
  children,
}) {
  return (
    <li className={`${styles.entry} ${emphasis ? styles.emphasis : ''}`}>
      <span className={styles.dot} aria-hidden="true" />
      <div className={styles.entryBody}>
        {year && <div className={styles.year}>{year}</div>}
        {title && <div className={styles.title}>{title}</div>}
        {children && <div className={styles.body}>{children}</div>}
      </div>
    </li>
  );
}
