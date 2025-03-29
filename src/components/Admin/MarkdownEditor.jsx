import { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ImageUploader from "./ImageUploader";
import {
  FaBold,
  FaItalic,
  FaLink,
  FaImage,
  FaListUl,
  FaListOl,
  FaQuoteLeft,
  FaCode,
  FaHeading,
  FaTimes,
} from "react-icons/fa";

export default function MarkdownEditor({ value, onChange, theme = "light" }) {
  const { t } = useTranslation();
  const textareaRef = useRef(null);

  // Add this state for the image uploader modal
  const [showImageUploader, setShowImageUploader] = useState(false);

  // Set theme for any internal styling
  const isDarkMode = theme === "dark";

  // Focus textarea when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Insert markdown syntax at cursor position
  const insertMarkdown = (before, after = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    const textBefore = value.substring(0, start);
    const textAfter = value.substring(end);

    const newValue = textBefore + before + selectedText + after + textAfter;
    onChange(newValue);

    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  // Toolbar button click handlers
  const handleBold = () => insertMarkdown("**", "**");
  const handleItalic = () => insertMarkdown("*", "*");
  const handleHeading = () => insertMarkdown("## ");
  const handleLink = () => {
    const url = prompt(t("admin.markdownEditor.linkPrompt"), "https://");
    if (url) {
      insertMarkdown("[", `](${url})`);
    }
  };

  // Replace your existing handleImage function with this one:
  const handleImage = () => {
    setShowImageUploader(true);
  };

  const handleImageUpload = (url) => {
    if (url) {
      const alt = prompt(t("admin.markdownEditor.altTextPrompt"), "");
      insertMarkdown(`![${alt || ""}`, `](${url})`);
    }
  };

  const handleUnorderedList = () => insertMarkdown("- ");
  const handleOrderedList = () => insertMarkdown("1. ");
  const handleQuote = () => insertMarkdown("> ");
  const handleCode = () => insertMarkdown("```\n", "\n```");

  return (
    <div className="markdown-editor">
      {/* Toolbar */}
      <div
        className={`flex flex-wrap gap-1 p-2 mb-2 rounded-md ${
          isDarkMode ? "bg-dark-primary" : "bg-light-primary"
        }`}
      >
        <button
          type="button"
          onClick={handleHeading}
          className={`p-2 rounded hover:bg-opacity-20 ${
            isDarkMode
              ? "hover:bg-gray-700 text-dark-text-primary"
              : "hover:bg-gray-200 text-light-text-primary"
          }`}
          title={t("admin.markdownEditor.heading")}
        >
          <FaHeading />
        </button>
        <button
          type="button"
          onClick={handleBold}
          className={`p-2 rounded hover:bg-opacity-20 ${
            isDarkMode
              ? "hover:bg-gray-700 text-dark-text-primary"
              : "hover:bg-gray-200 text-light-text-primary"
          }`}
          title={t("admin.markdownEditor.bold")}
        >
          <FaBold />
        </button>
        <button
          type="button"
          onClick={handleItalic}
          className={`p-2 rounded hover:bg-opacity-20 ${
            isDarkMode
              ? "hover:bg-gray-700 text-dark-text-primary"
              : "hover:bg-gray-200 text-light-text-primary"
          }`}
          title={t("admin.markdownEditor.italic")}
        >
          <FaItalic />
        </button>
        <button
          type="button"
          onClick={handleLink}
          className={`p-2 rounded hover:bg-opacity-20 ${
            isDarkMode
              ? "hover:bg-gray-700 text-dark-text-primary"
              : "hover:bg-gray-200 text-light-text-primary"
          }`}
          title={t("admin.markdownEditor.link")}
        >
          <FaLink />
        </button>
        <button
          type="button"
          onClick={handleImage}
          className={`p-2 rounded hover:bg-opacity-20 ${
            isDarkMode
              ? "hover:bg-gray-700 text-dark-text-primary"
              : "hover:bg-gray-200 text-light-text-primary"
          }`}
          title={t("admin.markdownEditor.image")}
        >
          <FaImage />
        </button>
        <button
          type="button"
          onClick={handleUnorderedList}
          className={`p-2 rounded hover:bg-opacity-20 ${
            isDarkMode
              ? "hover:bg-gray-700 text-dark-text-primary"
              : "hover:bg-gray-200 text-light-text-primary"
          }`}
          title={t("admin.markdownEditor.bulletList")}
        >
          <FaListUl />
        </button>
        <button
          type="button"
          onClick={handleOrderedList}
          className={`p-2 rounded hover:bg-opacity-20 ${
            isDarkMode
              ? "hover:bg-gray-700 text-dark-text-primary"
              : "hover:bg-gray-200 text-light-text-primary"
          }`}
          title={t("admin.markdownEditor.numberedList")}
        >
          <FaListOl />
        </button>
        <button
          type="button"
          onClick={handleQuote}
          className={`p-2 rounded hover:bg-opacity-20 ${
            isDarkMode
              ? "hover:bg-gray-700 text-dark-text-primary"
              : "hover:bg-gray-200 text-light-text-primary"
          }`}
          title={t("admin.markdownEditor.blockquote")}
        >
          <FaQuoteLeft />
        </button>
        <button
          type="button"
          onClick={handleCode}
          className={`p-2 rounded hover:bg-opacity-20 ${
            isDarkMode
              ? "hover:bg-gray-700 text-dark-text-primary"
              : "hover:bg-gray-200 text-light-text-primary"
          }`}
          title={t("admin.markdownEditor.codeBlock")}
        >
          <FaCode />
        </button>
      </div>

      {/* Editor */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-64 p-4 rounded-md font-mono text-sm resize-y ${
          isDarkMode
            ? "bg-dark-primary text-dark-text-primary"
            : "bg-light-primary text-light-text-primary"
        } focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent border-none`}
        placeholder={t("admin.markdownEditor.placeholder")}
      />

      {/* Markdown syntax helper */}
      <div
        className={`mt-2 text-xs ${
          isDarkMode ? "text-dark-text-secondary" : "text-light-text-secondary"
        }`}
      >
        {t("admin.markdownEditor.syntaxGuide")}{" "}
        <a
          href="https://www.markdownguide.org/basic-syntax/"
          target="_blank"
          rel="noopener noreferrer"
          className={`${
            isDarkMode ? "text-dark-accent" : "text-light-accent"
          } hover:underline`}
        >
          {t("admin.markdownEditor.syntaxGuideLink")}
        </a>
      </div>

      {/* Image Uploader Modal - Add this at the end of your component */}
      {showImageUploader && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-light-primary dark:bg-dark-primary p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">
                {t("admin.markdownEditor.uploadImage")}
              </h3>
              <button
                type="button"
                onClick={() => setShowImageUploader(false)}
                className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-accent dark:hover:text-dark-accent"
              >
                <FaTimes />
              </button>
            </div>

            <ImageUploader
              onImageUploaded={(url) => {
                handleImageUpload(url);
                setShowImageUploader(false);
              }}
            />

            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setShowImageUploader(false)}
                className="px-4 py-2 text-light-text-primary dark:text-dark-text-primary bg-light-secondary dark:bg-dark-secondary rounded-md"
              >
                {t("admin.markdownEditor.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
