// Authored preview — wraps any diagram with a click-to-zoom affordance + lightbox.
// A sample inline SVG stands in for a mermaid diagram.
import { DiagramZoom } from "blog-site";

export const Default = () => (
  <DiagramZoom ariaLabel="Request path: client to service">
    <svg viewBox="0 0 360 120" width="360" height="120" xmlns="http://www.w3.org/2000/svg" role="img">
      <rect x="8" y="40" width="90" height="40" rx="8" fill="none" stroke="#64ffda" />
      <text x="53" y="65" fill="#e2e8f0" fontSize="13" fontFamily="monospace" textAnchor="middle">Client</text>
      <line x1="98" y1="60" x2="135" y2="60" stroke="#38bdf8" strokeWidth="2" />
      <rect x="135" y="40" width="90" height="40" rx="8" fill="none" stroke="#64ffda" />
      <text x="180" y="65" fill="#e2e8f0" fontSize="13" fontFamily="monospace" textAnchor="middle">Gateway</text>
      <line x1="225" y1="60" x2="262" y2="60" stroke="#38bdf8" strokeWidth="2" />
      <rect x="262" y="40" width="90" height="40" rx="8" fill="none" stroke="#64ffda" />
      <text x="307" y="65" fill="#e2e8f0" fontSize="13" fontFamily="monospace" textAnchor="middle">Service</text>
    </svg>
  </DiagramZoom>
);
