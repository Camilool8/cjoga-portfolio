import React, { useState, useEffect, useRef } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { FaClipboard, FaCheck } from "react-icons/fa";
import Prism from "prismjs";

import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-json";
import "prismjs/components/prism-python";
import "prismjs/components/prism-docker";
import "prismjs/components/prism-powershell";
import "prismjs/components/prism-hcl";

const CodeBlock = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const languageMap = {
    js: "javascript",
    ts: "typescript",
    py: "python",
    sh: "bash",
    shell: "bash",
    yml: "yaml",
    tf: "hcl",
    terraform: "hcl",
  };

  const normalizedLang = language?.toLowerCase() || "plaintext";
  const mappedLang = languageMap[normalizedLang] || normalizedLang;
  const displayLanguage =
    mappedLang.charAt(0).toUpperCase() + mappedLang.slice(1);

  useEffect(() => {
    Prism.highlightAll();
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  };

  return (
    <div className="code-block relative group my-6 rounded-md overflow-hidden shadow-lg">
      <div className="code-header flex justify-between items-center px-4 py-2 bg-gray-800 dark:bg-gray-900 text-gray-200">
        <span className="text-xs font-mono">{displayLanguage}</span>
        <button
          onClick={copyToClipboard}
          className="copy-button flex items-center gap-1 bg-gray-700 hover:bg-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 text-xs text-gray-200 px-3 py-1 rounded transition-colors"
          aria-label={copied ? "Copied!" : "Copy code"}
        >
          {copied ? (
            <>
              <FaCheck size={12} /> Copied!
            </>
          ) : (
            <>
              <FaClipboard size={12} /> Copy
            </>
          )}
        </button>
      </div>
      <pre className="p-4 bg-gray-800 dark:bg-gray-900 overflow-x-auto text-sm rounded-b-md m-0">
        <code className={`language-${mappedLang}`}>{code}</code>
      </pre>
    </div>
  );
};

const SimpleMarkdownRenderer = ({
  content,
  className = "",
  onHeadingsExtracted = null,
}) => {
  const [parsedElements, setParsedElements] = useState([]);
  const headingsExtracted = useRef(false);

  useEffect(() => {
    if (!content) {
      setParsedElements([]);
      return;
    }

    if (onHeadingsExtracted && !headingsExtracted.current) {
      const headingRegex = /^(#{2,6})\s+(.+)$/gm;
      const headings = [];
      let match;

      while ((match = headingRegex.exec(content)) !== null) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");

        headings.push({ id, text, level });
      }

      onHeadingsExtracted(headings);
      headingsExtracted.current = true;
    }

    const segments = content.split(/(```[a-zA-Z0-9]*\n[\s\S]*?\n```)/g);

    const elements = segments.map((segment, index) => {
      const codeMatch = segment.match(/```([a-zA-Z0-9]*)\n([\s\S]*?)\n```/);

      if (codeMatch) {
        const language = codeMatch[1];
        const code = codeMatch[2];
        return (
          <CodeBlock key={`code-${index}`} code={code} language={language} />
        );
      }

      const renderer = new marked.Renderer();

      renderer.code = (code, lang) => {
        return `<pre><code class="language-${
          lang || "plaintext"
        }">${code}</code></pre>`;
      };

      renderer.heading = (text, level, raw) => {
        const id = raw
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");

        return `<h${level} id="${id}">${text}</h${level}>`;
      };

      marked.setOptions({
        renderer,
        gfm: true,
        breaks: true,
        headerIds: true,
        headerPrefix: "",
        mangle: false,
        sanitize: false,
      });

      const html = marked.parse(segment);
      const cleanHtml = DOMPurify.sanitize(html);

      return (
        <div
          key={`html-${index}`}
          className="markdown-html"
          dangerouslySetInnerHTML={{ __html: cleanHtml }}
        />
      );
    });

    setParsedElements(elements);
  }, [content, onHeadingsExtracted]);

  useEffect(() => {
    Prism.highlightAll();
  }, [parsedElements]);

  useEffect(() => {
    headingsExtracted.current = false;
  }, [content]);

  return <div className={`simple-markdown ${className}`}>{parsedElements}</div>;
};

export default SimpleMarkdownRenderer;
