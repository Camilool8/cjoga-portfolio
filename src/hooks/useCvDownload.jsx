import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const ERROR_DISMISS_MS = 5000;

// Builds the PDF CV on demand (react-pdf is lazy-loaded so it never
// weighs on first paint) and hands it to the browser as a download.
// Shared by every "Download CV" control on the page.
export default function useCvDownload() {
  const { i18n } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasError, setHasError] = useState(false);
  const errorTimer = useRef(null);

  useEffect(() => () => clearTimeout(errorTimer.current), []);

  const download = useCallback(async () => {
    if (isGenerating) return;
    clearTimeout(errorTimer.current);
    setHasError(false);

    try {
      setIsGenerating(true);
      const [{ pdf }, { default: ProfessionalPDFCV }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("../components/ProfessionalPDFCV"),
      ]);

      const asPdf = pdf();
      asPdf.updateContainer(<ProfessionalPDFCV />);
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
      setHasError(true);
      errorTimer.current = setTimeout(() => setHasError(false), ERROR_DISMISS_MS);
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, i18n.language]);

  return { download, isGenerating, hasError };
}
