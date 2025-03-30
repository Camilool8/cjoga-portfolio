import React, { useState, useCallback } from "react";
import SimpleMarkdownRenderer from "../Utils/SimpleMarkdownRenderer";

export default function MarkdownPreview({ content }) {
  const [tocItems, setTocItems] = useState([]);

  // Use useCallback to avoid creating a new function on each render
  const handleHeadingsExtracted = useCallback((headings) => {
    setTocItems(headings);
  }, []);

  // Render the table of contents if we have headings
  const renderTableOfContents = () => {
    if (!tocItems || tocItems.length === 0) return null;

    return (
      <div className="toc-container mb-8 p-4 bg-light-primary/20 dark:bg-dark-primary/20 rounded-md">
        <h3 className="text-lg font-semibold mb-3 text-light-text-primary dark:text-dark-text-primary">
          Table of Contents
        </h3>
        <ul className="space-y-1">
          {tocItems.map((item, index) => (
            <li
              key={index}
              style={{ paddingLeft: `${(item.level - 2) * 0.75}rem` }}
              className="toc-item"
            >
              <a
                href={`#${item.id}`}
                className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-accent dark:hover:text-dark-accent transition-colors"
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="markdown-preview">
      {/* Display the table of contents if available */}
      {tocItems.length > 0 && renderTableOfContents()}

      {/* Render the markdown content */}
      <div className="markdown-content-wrapper">
        <SimpleMarkdownRenderer
          content={content}
          onHeadingsExtracted={handleHeadingsExtracted}
          className="prose prose-lg dark:prose-invert max-w-none prose-a:text-light-accent dark:prose-a:text-dark-accent prose-img:rounded-md prose-headings:scroll-mt-24"
        />
      </div>
    </div>
  );
}
