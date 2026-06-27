// Bundle entry for design-sync.
//
// The portfolio's components are DEFAULT exports (export default About), but the
// converter's synth entry uses `export * from`, which skips default exports — so
// window.<globalName> would expose nothing. This barrel re-exports each default
// as a NAMED export so every component lands on window.CjogaPortfolio.* for the
// preview cards and the design agent. Passed as --entry; pinned 1:1 in
// cfg.componentSrcMap. PreviewProvider (cfg.provider.component) ships here too.
//
// Authored, committed sync input — not machine-generated. Add a line here AND a
// componentSrcMap pin whenever a component is added to the sync.
export { default as About } from "../src/components/About.jsx";
export { default as BackgroundAnimation } from "../src/components/BackgroundAnimation.jsx";
export { default as Certifications } from "../src/components/Certifications.jsx";
export { default as Contact } from "../src/components/Contact.jsx";
export { default as CursorGlow } from "../src/components/CursorGlow.jsx";
export { default as Experience } from "../src/components/Experience.jsx";
export { default as Footer } from "../src/components/Footer.jsx";
export { default as HandbookCallout } from "../src/components/HandbookCallout.jsx";
export { default as Hero } from "../src/components/Hero.jsx";
export { default as NavigationBar } from "../src/components/NavigationBar.jsx";
export { default as PrintButton } from "../src/components/PrintButton.jsx";
export { default as Projects } from "../src/components/Projects.jsx";
export { default as ScrollProgress } from "../src/components/ScrollProgress.jsx";
export { default as SectionDivider } from "../src/components/SectionDivider.jsx";
export { default as SideElements } from "../src/components/SideElements.jsx";

export { PreviewProvider } from "./preview-providers.jsx";
