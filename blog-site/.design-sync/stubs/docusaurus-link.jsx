// Browser-bundle stub for @docusaurus/Link. The real Link needs the Docusaurus
// router/runtime, absent here. Renders a plain anchor; `to` maps to href.
import React from "react";

export default function Link({ to, href, children, activeClassName, isNavLink, activeStyle, autoAddBaseUrl, ...rest }) {
  return (
    <a href={to ?? href ?? "#"} {...rest}>
      {children}
    </a>
  );
}
