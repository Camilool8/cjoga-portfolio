import React from 'react';
import Layout from '@theme-original/DocItem/Layout';

// The frame the doc's row is composed in (custom.css, "Article: the
// reading column"): from 997px every doc page lays out on the same
// tracks (lead, measure, gap, contents list), so the text keeps one left
// edge from page to page, instead of a 75/25 split that left a band of
// empty column. The stock Layout stays in charge of what renders; this
// only gives CSS a stable hook around its row.
export default function LayoutWrapper(props) {
  return (
    <div className="doc-frame">
      <Layout {...props} />
    </div>
  );
}
