// The search plugin's /search page renders straight into Layout with no
// <main>, so the page has no main landmark (axe: landmark-one-main,
// region). Give that one route a <main>; every other page brings its own.
import React from "react";
import Layout from "@theme-original/Layout";
import { useLocation } from "@docusaurus/router";
import useBaseUrl from "@docusaurus/useBaseUrl";

export default function LayoutWrapper({ children, ...props }) {
  const { pathname } = useLocation();
  const searchPath = useBaseUrl("/search");
  if (pathname.replace(/\/$/, "") !== searchPath) {
    return <Layout {...props}>{children}</Layout>;
  }
  return (
    <Layout {...props}>
      <main>{children}</main>
    </Layout>
  );
}
