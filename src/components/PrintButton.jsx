import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdFileDownload } from "react-icons/md";

const TOAST_DISMISS_MS = 5000;

function PrintButton() {
  const { t, i18n } = useTranslation();
  const buttonRef = useRef(null);
  const toastTimerRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  // The floating button only shows between the hero and Contact, so it
  // never sits next to another "Download CV" button.
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  useEffect(() => {
    // Hidden while the hero or Contact is on screen: both carry their
    // own "Download CV" button.
    const targets = ["hero", "contact"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    // Off the home page (the terminal) there's no hero, and the pill
    // would sit on top of the terminal output; the terminal has its own
    // `cat resume.txt` and `sudo hire-me`.
    if (!targets.length) {
      setPastHero(false);
      return undefined;
    }
    const onScreen = new Set();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? onScreen.add(e.target) : onScreen.delete(e.target)));
        setPastHero(onScreen.size === 0);
      },
      { threshold: 0 },
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const handleDownloadPDF = async () => {
    if (isGenerating) return;

    clearTimeout(toastTimerRef.current);
    setShowErrorToast(false);

    try {
      setIsGenerating(true);

      const [{ pdf }, { default: ProfessionalPDFCV }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./ProfessionalPDFCV"),
      ]);

      const pdfDoc = <ProfessionalPDFCV />;
      const asPdf = pdf();
      asPdf.updateContainer(pdfDoc);
      const blob = await asPdf.toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `JoseCamiloJogaGuerrero_CV_${i18n.language}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      setShowErrorToast(true);
      toastTimerRef.current = setTimeout(
        () => setShowErrorToast(false),
        TOAST_DISMISS_MS,
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="fixed bottom-[max(1.5rem,calc(env(safe-area-inset-bottom)_+_0.75rem))] right-[max(1rem,env(safe-area-inset-right))] sm:bottom-[max(2rem,calc(env(safe-area-inset-bottom)_+_0.75rem))] sm:right-[max(1.5rem,env(safe-area-inset-right))] xl:right-20 z-40 print:hidden flex flex-col items-end gap-2"
      style={{
        opacity: pastHero ? 1 : 0,
        visibility: pastHero ? "visible" : "hidden",
        transform: pastHero ? "none" : "translateY(12px)",
        transition: "opacity 0.35s, transform 0.35s var(--ease-out-expo), visibility 0s linear " + (pastHero ? "0s" : "0.35s"),
      }}
    >
      <div role="status">
        {showErrorToast && (
          <p
            className="max-w-[240px] py-2 px-3 rounded-lg shadow-lg text-xs leading-relaxed m-0"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
              fontFamily: "var(--font-body)",
            }}
          >
            {t(
              "print.error",
              "Couldn't generate the PDF. Please try again.",
            )}
          </p>
        )}
      </div>
      <button
        ref={buttonRef}
        onClick={handleDownloadPDF}
        disabled={isGenerating}
        className={`flex items-center justify-center rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl p-3 sm:py-2 sm:px-4 ${
          isGenerating ? "opacity-75 cursor-wait" : ""
        }`}
        style={{
          background: "var(--accent)",
          color: "var(--bg-primary)",
          fontFamily: "var(--font-body)",
        }}
        aria-label={t("print.button")}
      >
        <MdFileDownload className="text-lg sm:mr-2" />
        <span className="hidden sm:inline text-sm font-medium">
          {isGenerating
            ? t("print.generating")
            : t("print.button")}
        </span>
      </button>
    </div>
  );
}

export default PrintButton;
