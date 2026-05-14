// Wraps the default Docusaurus Mermaid component with DiagramZoom so every
// mermaid code fence in MDX automatically gets a click-to-zoom modal with
// pan/zoom controls. No doc rewrites needed.

import React from 'react';
import OriginalMermaid from '@theme-original/Mermaid';
import DiagramZoom from '@site/src/components/DiagramZoom';

export default function MermaidWrapper(props) {
  return (
    <DiagramZoom ariaLabel="Architecture diagram">
      <OriginalMermaid {...props} />
    </DiagramZoom>
  );
}
