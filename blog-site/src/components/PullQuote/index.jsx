import React from 'react';
import styles from './styles.module.css';

// Hero pull-quote — hairline rules above and below match the text column;
// quote text centered and balanced inside. No box, no background, no
// nested blockquote (to avoid inheriting Docusaurus's default styling).
//
// Usage:
//   <PullQuote>The sharpest sentence from the essay goes here.</PullQuote>
export default function PullQuote({ eyebrow, attribution, children }) {
  return (
    <figure className={styles.figure}>
      {eyebrow && <div className={styles.eyebrow}>{eyebrow}</div>}
      <div className={styles.quote}>{children}</div>
      {attribution && (
        <figcaption className={styles.attribution}>{attribution}</figcaption>
      )}
    </figure>
  );
}
