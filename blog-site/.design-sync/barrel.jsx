// Bundle entry for design-sync (blog / handbook design system).
// Re-exports every component (default + named) so they land on
// window.CjogaHandbook.*. Add a line here AND a componentSrcMap pin when a
// component is added. Authored, committed sync input.
export { default as AuthorCard } from "../src/components/AuthorCard";
export { default as CertBadge, CertBadgeGrid } from "../src/components/CertBadge";
export { default as CourseCard, CourseCardGrid } from "../src/components/CourseCard";
export { default as DiagramZoom } from "../src/components/DiagramZoom";
export { default as PullQuote } from "../src/components/PullQuote";
export { default as SectionCardGrid, SectionCard } from "../src/components/SectionCardGrid";
export { default as TechStackGrid } from "../src/components/TechStackGrid";
export { default as Timeline, TimelineEntry } from "../src/components/Timeline";

export { PreviewFrame } from "./preview-providers.jsx";
