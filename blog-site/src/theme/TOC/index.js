import React from 'react';
import clsx from 'clsx';
import TOCItems from '@theme/TOCItems';
import styles from './styles.module.css';

// Ejected from theme-classic to make the desktop contents list a named
// landmark: a <nav> labelled by its visible "On this page" heading, as
// the phone's toggle already says. The sticky box stays the outer
// element, so the label scrolls with the list.
const LINK_CLASS_NAME = 'table-of-contents__link toc-highlight';
const LINK_ACTIVE_CLASS_NAME = 'table-of-contents__link--active';

export default function TOC({className, ...props}) {
  return (
    <nav
      aria-labelledby="toc-label"
      className={clsx(styles.tableOfContents, 'thin-scrollbar', className)}>
      <p id="toc-label" className="toc-label">
        On this page
      </p>
      <TOCItems
        {...props}
        linkClassName={LINK_CLASS_NAME}
        linkActiveClassName={LINK_ACTIVE_CLASS_NAME}
      />
    </nav>
  );
}
