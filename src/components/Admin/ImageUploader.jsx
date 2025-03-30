import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FaUpload, FaImage, FaTimes } from "react-icons/fa";
import blogApi from "../../services/blogApi";

function ImageUploader({ onImageUploaded }) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Clear error
    setError("");
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files[0];

    if (!file) {
      setError(t("admin.imageUploader.noFileSelected"));
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError(t("admin.imageUploader.fileTooLarge"));
      return;
    }

    // Validate file type
    if (
      !file.mimetype?.startsWith("image/") &&
      !file.type?.startsWith("image/")
    ) {
      setError(t("admin.imageUploader.invalidFileType"));
      return;
    }

    try {
      setUploading(true);
      setError("");

      console.log(
        "Sending upload request with file:",
        file.name,
        file.type,
        file.size
      );

      // Upload the file
      const result = await blogApi.uploadImage(file);

      console.log("Upload result:", result);

      // Call the callback with the image URL
      onImageUploaded(result.url);

      // Reset the form
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      setError(t("admin.imageUploader.uploadError"));
    } finally {
      setUploading(false);
    }
  };

  const cancelUpload = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setError("");
  };

  return (
    <div className="image-uploader">
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-200 p-2 rounded-md mb-2 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col space-y-2">
        {/* File Preview */}
        {preview && (
          <div className="relative mb-2">
            <img
              src={preview}
              alt="Preview"
              className="max-h-40 max-w-full object-contain rounded-md"
            />
            <button
              type="button"
              onClick={cancelUpload}
              className="absolute top-1 right-1 bg-red-500 dark:bg-red-600 text-white rounded-full p-1 hover:bg-red-600 dark:hover:bg-red-700"
              title={t("admin.imageUploader.cancel")}
            >
              <FaTimes size={12} />
            </button>
          </div>
        )}

        {/* File Input */}
        <div className="flex">
          <div className="flex-1 relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={uploading}
            />
            <div className="flex items-center px-4 py-2 bg-light-primary dark:bg-gray-700 border-2 border-dashed border-light-secondary dark:border-gray-500 rounded-l-md text-light-text-secondary dark:text-gray-300">
              <FaImage className="mr-2" />
              <span className="truncate">
                {preview
                  ? fileInputRef.current?.files[0]?.name
                  : t("admin.imageUploader.selectImage")}
              </span>
            </div>
          </div>

          {/* Upload Button */}
          <button
            type="button"
            onClick={handleUpload}
            disabled={!preview || uploading}
            className={`px-4 py-2 rounded-r-md ${
              !preview || uploading
                ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed text-gray-200"
                : "bg-light-accent dark:bg-teal-600 text-white hover:bg-light-accent/90 dark:hover:bg-teal-500"
            } flex items-center transition-colors`}
          >
            {uploading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t("admin.imageUploader.uploading")}
              </>
            ) : (
              <>
                <FaUpload className="mr-1" />
                {t("admin.imageUploader.upload")}
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-light-text-secondary dark:text-gray-400">
          {t("admin.imageUploader.supportedFormats")}
        </p>
      </div>
    </div>
  );
}

export default ImageUploader;
