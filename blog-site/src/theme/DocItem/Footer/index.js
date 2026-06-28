import React from 'react';

// The date eyebrow at the TOP of each doc (see theme/DocItem/Content) is the
// only doc-meta we want to show. The stock footer's edit/last-updated row would
// duplicate "Updated", and the git "last updated" value isn't available in the
// production Docker build anyway (no .git in the build context). These docs use
// `keywords`, not `tags`, so there is no tags row to preserve — render nothing.
//
// NOTE: intentionally import-free. Calling `useDoc()` here (as the stock footer
// does) throws "called outside the <DocProvider>" under this project's Rspack
// dev resolution — a src/ import of `@docusaurus/plugin-content-docs/client`
// resolves to a different module instance than the core theme's DocProvider.
export default function DocItemFooter() {
  return null;
}
