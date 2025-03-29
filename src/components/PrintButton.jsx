import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdFileDownload } from "react-icons/md";
import { pdf } from "@react-pdf/renderer";
import ProfessionalPDFCV from "./ProfessionalPDFCV";

function PrintButton() {
  const { t, i18n } = useTranslation();
  const buttonRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Handle download PDF
  const handleDownloadPDF = async () => {
    if (isGenerating) return;

    try {
      setIsGenerating(true);

      // Create the PDF document
      const pdfDoc = <ProfessionalPDFCV />;
      const asPdf = pdf();
      asPdf.updateContainer(pdfDoc);
      const blob = await asPdf.toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `JoseCamiloJogaGuerrero_CV_${i18n.language}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("There was an error generating the PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-40 print:hidden">
      <button
        ref={buttonRef}
        onClick={handleDownloadPDF}
        disabled={isGenerating}
        className={`flex items-center bg-dark-accent text-dark-primary dark:bg-dark-accent dark:text-dark-primary px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
          isGenerating ? "opacity-75 cursor-wait" : ""
        }`}
        aria-label={t("print.button")}
      >
        <MdFileDownload className="mr-2 text-lg" />
        <span className="font-mono text-sm">
          {isGenerating
            ? t("print.generating", "Generating...")
            : t("print.button")}
        </span>
      </button>
    </div>
  );
}

export default PrintButton;
