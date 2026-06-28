import React from 'react';
import Content from '@theme-original/DocItem/Content';

// Renders a "Published / Updated" dateline above each doc's content.
//
// We deliberately do NOT call `useDoc()`. Under this project's Rspack dev
// resolution, importing `@docusaurus/plugin-content-docs/client` from a src/
// swizzle resolves to a different module instance than the core theme's, so its
// DocContext reads null and `useDoc()` throws "called outside the <DocProvider>".
// Instead we read the doc's `frontMatter` off the MDX component core passes in
// as `props.children` — a static property, context-free, identical in dev,
// production build, and client hydration.
//
// Both dates come straight from frontmatter, never from `metadata.lastUpdatedAt`
// (which Docusaurus backfills from git / file mtime and would show a bogus
// "Updated" on docs that were never actually given a `last_update`). So:
//   - Published = `date`
//   - Updated   = `last_update.date`, shown ONLY when explicitly set.
// Hub/index pages carry no `date` and render nothing here.

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

function DateItem({label, date}) {
  return (
    <span className="doc-dateline__item">
      <span className="doc-dateline__label">{label}</span>
      <time className="doc-dateline__date" dateTime={date.toISOString()}>
        {fmt.format(date)}
      </time>
    </span>
  );
}

export default function ContentWrapper(props) {
  const frontMatter = props?.children?.type?.frontMatter ?? {};
  const published = toDate(frontMatter.date);
  const updated = toDate(frontMatter.last_update?.date);
  const showUpdated =
    updated &&
    (!published || updated.toDateString() !== published.toDateString());

  return (
    <>
      {published && (
        <div className="doc-dateline">
          <DateItem label="Published" date={published} />
          {showUpdated && <DateItem label="Updated" date={updated} />}
        </div>
      )}
      <Content {...props} />
    </>
  );
}
