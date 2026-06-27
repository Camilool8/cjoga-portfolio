// Browser-bundle stub for @react-pdf/renderer.
//
// @react-pdf/renderer is a Node-side PDF generator: it imports fs, path, url,
// stream, zlib and buffer, none of which bundle for the browser. PrintButton
// dynamically import()s it and ProfessionalPDFCV builds a PDF document tree
// from it — neither is meant to render as a DOM design-system card. Resolving
// the single package entry to this no-op stub (via cfg.tsconfig paths) lets the
// rest of the portfolio bundle for the claude.ai/design browser runtime; esbuild
// never traverses into @react-pdf's Node-only subtree.
//
// Authored, committed sync input — not machine-generated.
const Noop = () => null;

export const Document = Noop;
export const Page = Noop;
export const Text = Noop;
export const View = Noop;
export const Image = Noop;
export const Link = Noop;
export const Note = Noop;
export const Canvas = Noop;
export const Svg = Noop;
export const G = Noop;
export const Path = Noop;

export const StyleSheet = {
  create: (styles) => styles,
  resolve: () => ({}),
  flatten: (style) => style,
  absoluteFillObject: {},
};

export const Font = {
  register: () => {},
  registerHyphenationCallback: () => {},
  registerEmojiSource: () => {},
  getRegisteredFonts: () => ({}),
  getRegisteredFontFamilies: () => [],
  clear: () => {},
  reset: () => {},
};

export const pdf = () => ({
  toBlob: async () => new Blob(),
  toBuffer: async () => null,
  toString: () => "",
  updateContainer: () => {},
  on: () => {},
});

export const PDFViewer = Noop;
export const PDFDownloadLink = Noop;
export const BlobProvider = Noop;
export const usePDF = () => [{ loading: false, blob: null, url: null, error: null }, () => {}];
export const renderToStream = async () => null;
export const renderToFile = async () => null;
export const render = async () => null;
export const version = "0.0.0-stub";

export default {
  Document, Page, Text, View, Image, Link, Note, Canvas, Svg,
  StyleSheet, Font, pdf, PDFViewer, PDFDownloadLink, BlobProvider, usePDF,
};
