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
      const headings = content?.match(/#{1,6}\s+.+/g) || [];

      if (headings && headings.length > 0) {
        tocHtml =
          '<div class="toc-container"><h3>Table of Contents</h3><ul class="toc-list">';
        headings.forEach((heading) => {
          const level = heading.match(/^#+/)[0].length;
          const text = heading.replace(/^#+\s+/, "");
          const id = text
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]/g, "");

          tocHtml += `<li style="margin-left: ${
            (level - 1) * 20
          }px;"><a href="#${id}" class="toc-link">${text}</a></li>`;
        });
        tocHtml += "</ul></div>";
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

      // Add styles to the preview
      const style = document.createElement("style");
      style.textContent = `
        .markdown-preview a {
          color: var(--link-color, #0ea5e9);
        }
        .dark .markdown-preview a {
          color: var(--dark-link-color, #38bdf8);
        }
        .toc-container {
          margin-bottom: 2rem;
          padding: 1rem;
          border-radius: 0.375rem;
          background-color: rgba(0, 0, 0, 0.05);
        }
        .dark .toc-container {
          background-color: rgba(255, 255, 255, 0.05);
        }
        .toc-container h3 {
          margin-top: 0 !important;
          margin-bottom: 0.75rem !important;
          font-size: 1.25rem !important;
        }
        .toc-list {
          list-style-type: none;
          padding-left: 0;
        }
        .toc-link {
          text-decoration: none;
          transition: color 0.2s;
        }
        .toc-link:hover {
          text-decoration: underline;
        }
        .dark .markdown-preview {
          color: #e2e8f0;
        }
        .dark .markdown-preview h1,
        .dark .markdown-preview h2,
        .dark .markdown-preview h3,
        .dark .markdown-preview h4,
        .dark .markdown-preview h5,
        .dark .markdown-preview h6 {
          color: #f8fafc;
        }
        .dark .markdown-preview blockquote {
          color: #cbd5e1;
          border-left-color: #475569;
        }
        .dark .markdown-preview code {
          background-color: rgba(30, 41, 59, 0.8);
          color: #e2e8f0;
        }
        .dark .markdown-preview pre {
          background-color: #1e293b;
        }
        .dark .markdown-preview table th {
          background-color: #334155;
        }
        .dark .markdown-preview table td,
        .dark .markdown-preview table th {
          border-color: #475569;
        }
      `;
      previewRef.current.appendChild(style);
    }
  }, [content]);

  return (
    <div
      ref={previewRef}
      className="markdown-preview prose prose-lg dark:prose-invert max-w-none"
    ></div>
  );
}
