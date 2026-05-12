// Globally register MDX components so authors don't have to import them
// in every .mdx file. Spread the original mapping so Docusaurus defaults
// (admonitions, code blocks, etc.) still work.

import React from "react";
import MDXComponents from "@theme-original/MDXComponents";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

export default {
  ...MDXComponents,
  Tabs,
  TabItem,
};
