import React from 'react';
import { useLocation } from '@docusaurus/router';
import DocPaginator from '@theme-original/DocPaginator';

// Prev / next stay inside the reader's section. The sidebar runs every
// section end to end, so the last tip's Next landed on the Work hub and
// the last Learn guide's on Engineering: links that read as "more of
// this" but leave it. A neighbour is kept only when it is related to
// the current page: one contains the other (a hub and its pages), or
// both sit under the same parent (pages of one section). Anything else
// (another sub-section, another top-level section) is dropped; with
// neither left, no landmark.
const trim = (path) => (path || '').replace(/\/+$/, '') || '/';
const parentOf = (path) => path.slice(0, path.lastIndexOf('/')) || '/';

// The section hubs (/learn, /engineering, /me) share the root as parent
// but are separate sections, so the root never counts as a shared one.
function related(a, b) {
  const parent = parentOf(a);
  return (
    a.startsWith(`${b}/`) ||
    b.startsWith(`${a}/`) ||
    (parent !== '/' && parent === parentOf(b))
  );
}

// A section index (Me, Homelab, Work, Opinions…) shows none at all. Its
// list of pages is already the way on, and the sidebar puts its first
// page right after it, so "Next" would repeat the list's first row and
// "Previous" would step out sideways. A page whose next neighbour lies
// under its own path is such an index: only a category's own page has
// pages below it. One rule from the sidebar's shape, so a new hub needs
// no front matter to match the others.
const isIndex = (here, next) =>
  Boolean(next) && trim(next.permalink).startsWith(`${here}/`);

export default function DocPaginatorWrapper({ previous, next, ...props }) {
  const here = trim(useLocation().pathname);
  if (isIndex(here, next)) {
    return null;
  }
  const keep = (link) =>
    link && related(here, trim(link.permalink)) ? link : undefined;
  const prev = keep(previous);
  const nxt = keep(next);
  if (!prev && !nxt) {
    return null;
  }
  return <DocPaginator {...props} previous={prev} next={nxt} />;
}
