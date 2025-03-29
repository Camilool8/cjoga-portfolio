import { useEffect, useRef } from "react";
import { marked } from "marked";

export default function MarkdownPreview({ content }) {
  const previewRef = useRef(null);

  useEffect(() => {
    if (previewRef.current) {
      // Configure marked options
      marked.setOptions({
        breaks: true, // Convert line breaks to <br>
        gfm: true, // GitHub Flavored Markdown
        headerIds: true, // Add IDs to headings
        mangle: false, // Don't mangle email addresses
        sanitize: false, // Don't sanitize HTML (use DOMPurify instead for security)
      });

      // Parse markdown to HTML
      const html = marked.parse(content || "");

      // Add table of contents
      let tocHtml = "";
      const headings = content.match(/#{1,6}\s+.+/g);

      if (headings && headings.length > 0) {
        tocHtml = "<h3>Table of Contents</h3><ul>";
        headings.forEach((heading) => {
          const level = heading.match(/^#+/)[0].length;
          const text = heading.replace(/^#+\s+/, "");
          const id = text
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]/g, "");

          tocHtml += `<li style="margin-left: ${
            (level - 1) * 20
          }px;"><a href="#${id}">${text}</a></li>`;
        });
        tocHtml += "</ul>";
      }

      // Update preview content
      previewRef.current.innerHTML = tocHtml + html;

      // Add IDs to headings
      const headingElements = previewRef.current.querySelectorAll(
        "h1, h2, h3, h4, h5, h6"
      );
      headingElements.forEach((heading) => {
        const id = heading.textContent
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, "");
        heading.id = id;
      });
    }
  }, [content]);

  return <div ref={previewRef} className="markdown-preview"></div>;
}
