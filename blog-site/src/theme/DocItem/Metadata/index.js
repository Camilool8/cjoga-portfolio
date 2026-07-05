import React from 'react';
import Metadata from '@theme-original/DocItem/Metadata';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useDoc} from '@docusaurus/plugin-content-docs/client';

// Adds article-level SEO on top of the stock DocItem metadata:
//   - TechArticle JSON-LD (headline, dates, author @id → the portfolio's
//     Person node at https://cjoga.cloud/#person)
//   - og:type=article (Helmet dedupes against the sitewide `website` meta)
//   - article:published_time / article:modified_time
//
// Dates come straight from frontmatter (`date` + `last_update.date`), same
// source of truth as the DocItem/Content dateline swizzle — never from
// git-backfilled metadata. Every field is guarded: hub/index pages without
// dates or images emit a minimal-but-valid TechArticle, and time metas only
// appear when the corresponding date exists.
//
// Known gotcha (see DocItem/Content/index.js): under this project's Rspack
// dev resolution, `useDoc()` imported from a src/ swizzle can resolve a
// different module instance than the core theme's and throw "outside the
// <DocProvider>". We wrap it in try/catch — dev degrades to the original
// metadata only; the production build resolves consistently and emits the
// full JSON-LD.

function toIso(value) {
  if (!value) {
    return null;
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function toAbsoluteUrl(siteUrl, path) {
  if (!path) {
    return null;
  }
  if (/^https?:\/\//.test(path)) {
    return path;
  }
  return `${siteUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

export default function MetadataWrapper(props) {
  const {siteConfig} = useDocusaurusContext();

  let doc = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- stable per render tree; try/catch only guards the Rspack dev module-duplication gotcha
    doc = useDoc();
  } catch {
    doc = null;
  }

  if (!doc?.metadata) {
    return <Metadata {...props} />;
  }

  const {metadata, frontMatter = {}} = doc;
  const canonicalUrl = toAbsoluteUrl(siteConfig.url, metadata.permalink);
  const imageUrl = toAbsoluteUrl(siteConfig.url, frontMatter.image);
  const datePublished = toIso(frontMatter.date);
  const dateModified = toIso(frontMatter.last_update?.date) ?? datePublished;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    ...(metadata.title && {headline: metadata.title}),
    ...(metadata.description && {description: metadata.description}),
    ...(imageUrl && {image: imageUrl}),
    ...(datePublished && {datePublished}),
    ...(dateModified && {dateModified}),
    author: {
      '@type': 'Person',
      '@id': 'https://cjoga.cloud/#person',
      name: 'José Camilo Joga Guerrero',
    },
    ...(canonicalUrl && {
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl,
      },
    }),
  };

  return (
    <>
      <Metadata {...props} />
      <Head>
        <meta property="og:type" content="article" />
        {datePublished && (
          <meta property="article:published_time" content={datePublished} />
        )}
        {dateModified && (
          <meta property="article:modified_time" content={dateModified} />
        )}
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Head>
    </>
  );
}
