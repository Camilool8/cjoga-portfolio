import { useTranslation } from "react-i18next";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const { t } = useTranslation();

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        end = Math.min(4, totalPages - 1);
      }

      if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - 3);
      }

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  const baseButtonStyle = {
    fontFamily: "var(--font-mono)",
    fontSize: "0.85rem",
    minWidth: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid var(--border-subtle)",
    background: "var(--bg-surface)",
    color: "var(--text-secondary)",
    cursor: "pointer",
    transition: "all 0.3s var(--ease-out-expo)",
  };

  const activeButtonStyle = {
    ...baseButtonStyle,
    background: "var(--accent)",
    color: "var(--bg-primary)",
    border: "1px solid var(--accent)",
    boxShadow: "0 0 20px var(--accent-glow)",
    fontWeight: 600,
  };

  const disabledButtonStyle = {
    ...baseButtonStyle,
    opacity: 0.4,
    cursor: "not-allowed",
  };

  return (
    <nav
      className="flex items-center justify-center gap-2"
      aria-label={t("blog.pagination", { defaultValue: "Pagination" })}
    >
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={currentPage === 1 ? disabledButtonStyle : baseButtonStyle}
        onMouseEnter={(e) => {
          if (currentPage !== 1) {
            e.currentTarget.style.borderColor = "var(--border-medium)";
            e.currentTarget.style.color = "var(--accent)";
          }
        }}
        onMouseLeave={(e) => {
          if (currentPage !== 1) {
            e.currentTarget.style.borderColor = "var(--border-subtle)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }
        }}
        aria-label={t("blog.previousPage", { defaultValue: "Previous page" })}
      >
        <FaChevronLeft size={12} />
      </button>

      {/* Page numbers */}
      {pages.map((page, index) =>
        page === "..." ? (
          <span
            key={`ellipsis-${index}`}
            className="px-2"
            style={{
              color: "var(--text-tertiary)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
            }}
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            style={page === currentPage ? activeButtonStyle : baseButtonStyle}
            onMouseEnter={(e) => {
              if (page !== currentPage) {
                e.currentTarget.style.borderColor = "var(--border-medium)";
                e.currentTarget.style.color = "var(--accent)";
              }
            }}
            onMouseLeave={(e) => {
              if (page !== currentPage) {
                e.currentTarget.style.borderColor = "var(--border-subtle)";
                e.currentTarget.style.color = "var(--text-secondary)";
              }
            }}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        )
      )}

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={
          currentPage === totalPages ? disabledButtonStyle : baseButtonStyle
        }
        onMouseEnter={(e) => {
          if (currentPage !== totalPages) {
            e.currentTarget.style.borderColor = "var(--border-medium)";
            e.currentTarget.style.color = "var(--accent)";
          }
        }}
        onMouseLeave={(e) => {
          if (currentPage !== totalPages) {
            e.currentTarget.style.borderColor = "var(--border-subtle)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }
        }}
        aria-label={t("blog.nextPage", { defaultValue: "Next page" })}
      >
        <FaChevronRight size={12} />
      </button>
    </nav>
  );
}
