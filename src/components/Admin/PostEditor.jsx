import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaArrowLeft,
  FaSave,
  FaImage,
  FaEye,
  FaTimes,
  FaTag,
  FaPlus,
} from "react-icons/fa";
import slugify from "slugify";
import blogApi from "../../services/blogApi";
import MarkdownEditor from "./MarkdownEditor";
import MarkdownPreview from "./MarkdownPreview";

function PostEditor() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = id !== undefined;

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [published, setPublished] = useState(false);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Load post data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchPost = async () => {
        try {
          setLoading(true);
          const { post } = await blogApi.getPost(id);

          setTitle(post.title || "");
          setSlug(post.slug || "");
          setContent(post.content || "");
          setExcerpt(post.excerpt || "");
          setCoverImage(post.cover_image || "");
          setPublished(post.published || false);
          setTags(post.tags || []);
          setSeoTitle(post.seo_title || "");
          setSeoDescription(post.seo_description || "");
          setSeoKeywords(post.seo_keywords?.join(", ") || "");

          setIsSlugManuallyEdited(true); // Don't auto-generate slug in edit mode
        } catch (err) {
          console.error("Error fetching post:", err);
          setError(t("admin.postEditor.errorFetchingPost"));
        } finally {
          setLoading(false);
        }
      };

      fetchPost();
    }
  }, [id, isEditMode, t]);

  // Auto-generate slug from title if not manually edited
  useEffect(() => {
    if (title && !isSlugManuallyEdited) {
      setSlug(
        slugify(title, {
          lower: true,
          strict: true,
          remove: /[*+~.()'"!:@]/g,
        })
      );
    }
  }, [title, isSlugManuallyEdited]);

  // Handle slug change
  const handleSlugChange = (e) => {
    setIsSlugManuallyEdited(true);
    setSlug(e.target.value);
  };

  // Handle adding a tag
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content) {
      setError(t("admin.postEditor.errorRequiredFields"));
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const postData = {
        title,
        slug,
        content,
        excerpt: excerpt || title, // Use title as excerpt if not provided
        cover_image: coverImage,
        published,
        tags,
        seo_title: seoTitle || title, // Use title as SEO title if not provided
        seo_description: seoDescription || excerpt || title.substring(0, 160), // Use excerpt or title as SEO description if not provided
        seo_keywords: seoKeywords
          .split(",")
          .map((k) => k.trim())
          .filter((k) => k),
      };

      if (isEditMode) {
        await blogApi.updatePost(id, postData);
        setSuccess(t("admin.postEditor.postUpdated"));
      } else {
        await blogApi.createPost(postData);
        setSuccess(t("admin.postEditor.postCreated"));

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 1500);
      }

      setIsTouched(false);
    } catch (err) {
      console.error("Error saving post:", err);
      setError(
        isEditMode
          ? t("admin.postEditor.errorUpdatingPost")
          : t("admin.postEditor.errorCreatingPost")
      );
    } finally {
      setLoading(false);
    }
  };

  // Confirm before leaving if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isTouched) {
        e.preventDefault();
        e.returnValue = t("admin.postEditor.unsavedChanges");
        return t("admin.postEditor.unsavedChanges");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isTouched, t]);

  // Mark form as touched when any field changes
  useEffect(() => {
    if (title || content || excerpt || coverImage || tags.length > 0) {
      setIsTouched(true);
    }
  }, [title, content, excerpt, coverImage, tags]);

  return (
    <div className="min-h-screen bg-light-primary dark:bg-dark-primary py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
            {isEditMode
              ? t("admin.postEditor.editPost")
              : t("admin.postEditor.newPost")}
          </h1>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="bg-light-secondary dark:bg-dark-secondary text-light-text-primary dark:text-dark-text-primary py-2 px-4 rounded-md font-medium flex items-center transition-colors hover:bg-light-secondary/80 dark:hover:bg-dark-secondary/80"
            >
              <FaArrowLeft className="mr-2" />
              {t("admin.postEditor.back")}
            </button>

            <button
              onClick={() => setShowPreview(!showPreview)}
              className="bg-light-secondary dark:bg-dark-secondary text-light-text-primary dark:text-dark-text-primary py-2 px-4 rounded-md font-medium flex items-center transition-colors hover:bg-light-secondary/80 dark:hover:bg-dark-secondary/80"
            >
              <FaEye className="mr-2" />
              {showPreview
                ? t("admin.postEditor.hidePreview")
                : t("admin.postEditor.showPreview")}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-4 rounded-md mb-6">
            {success}
          </div>
        )}

        {loading && !isEditMode ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-light-accent dark:border-dark-accent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main editor */}
            <div
              className={`${
                showPreview ? "lg:col-span-1" : "lg:col-span-2"
              } space-y-6`}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-light-secondary dark:bg-dark-secondary rounded-lg p-6">
                  <h2 className="text-lg font-semibold mb-4 text-light-text-primary dark:text-dark-text-primary">
                    {t("admin.postEditor.basicInfo")}
                  </h2>

                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <label
                        htmlFor="title"
                        className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1"
                      >
                        {t("admin.postEditor.title")} *
                      </label>
                      <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-light-secondary dark:border-dark-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-transparent bg-light-primary dark:bg-dark-primary text-light-text-primary dark:text-dark-text-primary"
                        placeholder={t("admin.postEditor.titlePlaceholder")}
                        required
                      />
                    </div>

                    {/* Slug */}
                    <div>
                      <label
                        htmlFor="slug"
                        className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1"
                      >
                        {t("admin.postEditor.slug")} *
                      </label>
                      <input
                        id="slug"
                        type="text"
                        value={slug}
                        onChange={handleSlugChange}
                        className="w-full px-4 py-2 border-2 border-light-secondary dark:border-dark-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-transparent bg-light-primary dark:bg-dark-primary text-light-text-primary dark:text-dark-text-primary"
                        placeholder={t("admin.postEditor.slugPlaceholder")}
                        required
                      />
                      <p className="mt-1 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                        {t("admin.postEditor.slugHelper")}
                      </p>
                    </div>

                    {/* Excerpt */}
                    <div>
                      <label
                        htmlFor="excerpt"
                        className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1"
                      >
                        {t("admin.postEditor.excerpt")}
                      </label>
                      <textarea
                        id="excerpt"
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-light-secondary dark:border-dark-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-transparent bg-light-primary dark:bg-dark-primary text-light-text-primary dark:text-dark-text-primary"
                        placeholder={t("admin.postEditor.excerptPlaceholder")}
                        rows={2}
                      />
                      <p className="mt-1 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                        {t("admin.postEditor.excerptHelper")}
                      </p>
                    </div>

                    {/* Cover Image */}
                    <div>
                      <label
                        htmlFor="coverImage"
                        className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1"
                      >
                        {t("admin.postEditor.coverImage")}
                      </label>

                      {coverImage ? (
                        <div className="mb-3 relative">
                          <img
                            src={coverImage}
                            alt="Cover"
                            className="w-full h-48 object-cover rounded-md"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/images/blog-placeholder.jpg";
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setCoverImage("")}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                            title={t("admin.postEditor.removeCoverImage")}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ) : (
                        <ImageUploader
                          onImageUploaded={(url) => setCoverImage(url)}
                        />
                      )}

                      <p className="mt-1 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                        {t("admin.postEditor.coverImageHelper")}
                      </p>
                    </div>

                    {/* Tags */}
                    <div>
                      <label
                        htmlFor="tags"
                        className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1"
                      >
                        {t("admin.postEditor.tags")}
                      </label>
                      <div className="flex">
                        <input
                          id="tags"
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                          className="flex-1 px-4 py-2 border-2 border-light-secondary dark:border-dark-secondary rounded-l-md focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-transparent bg-light-primary dark:bg-dark-primary text-light-text-primary dark:text-dark-text-primary"
                          placeholder={t("admin.postEditor.tagsPlaceholder")}
                        />
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className="bg-light-accent dark:bg-dark-accent text-white px-4 py-2 rounded-r-md"
                        >
                          <FaPlus />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag) => (
                          <div
                            key={tag}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-light-primary dark:bg-dark-primary text-light-accent dark:text-dark-accent"
                          >
                            <FaTag className="mr-1 text-xs" />
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 text-light-text-secondary dark:text-dark-text-secondary hover:text-red-500 dark:hover:text-red-400"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Published Status */}
                    <div className="flex items-center">
                      <input
                        id="published"
                        type="checkbox"
                        checked={published}
                        onChange={(e) => setPublished(e.target.checked)}
                        className="h-4 w-4 text-light-accent dark:text-dark-accent focus:ring-light-accent dark:focus:ring-dark-accent rounded"
                      />
                      <label
                        htmlFor="published"
                        className="ml-2 block text-sm text-light-text-primary dark:text-dark-text-primary"
                      >
                        {t("admin.postEditor.publishImmediately")}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Markdown Editor */}
                <div className="bg-light-secondary dark:bg-dark-secondary rounded-lg p-6">
                  <h2 className="text-lg font-semibold mb-4 text-light-text-primary dark:text-dark-text-primary">
                    {t("admin.postEditor.content")} *
                  </h2>

                  <MarkdownEditor
                    value={content}
                    onChange={setContent}
                    theme={
                      document.documentElement.classList.contains("dark")
                        ? "dark"
                        : "light"
                    }
                  />
                </div>

                {/* SEO Settings */}
                <div className="bg-light-secondary dark:bg-dark-secondary rounded-lg p-6">
                  <h2 className="text-lg font-semibold mb-4 text-light-text-primary dark:text-dark-text-primary">
                    {t("admin.postEditor.seoSettings")}
                  </h2>

                  <div className="space-y-4">
                    {/* SEO Title */}
                    <div>
                      <label
                        htmlFor="seoTitle"
                        className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1"
                      >
                        {t("admin.postEditor.seoTitle")}
                      </label>
                      <input
                        id="seoTitle"
                        type="text"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-light-secondary dark:border-dark-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-transparent bg-light-primary dark:bg-dark-primary text-light-text-primary dark:text-dark-text-primary"
                        placeholder={t("admin.postEditor.seoTitlePlaceholder")}
                      />
                    </div>

                    {/* SEO Description */}
                    <div>
                      <label
                        htmlFor="seoDescription"
                        className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1"
                      >
                        {t("admin.postEditor.seoDescription")}
                      </label>
                      <textarea
                        id="seoDescription"
                        value={seoDescription}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-light-secondary dark:border-dark-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-transparent bg-light-primary dark:bg-dark-primary text-light-text-primary dark:text-dark-text-primary"
                        placeholder={t(
                          "admin.postEditor.seoDescriptionPlaceholder"
                        )}
                        rows={2}
                      />
                      <p className="mt-1 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                        {t("admin.postEditor.seoDescriptionHelper")}
                      </p>
                    </div>

                    {/* SEO Keywords */}
                    <div>
                      <label
                        htmlFor="seoKeywords"
                        className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1"
                      >
                        {t("admin.postEditor.seoKeywords")}
                      </label>
                      <input
                        id="seoKeywords"
                        type="text"
                        value={seoKeywords}
                        onChange={(e) => setSeoKeywords(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-light-secondary dark:border-dark-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent focus:border-transparent bg-light-primary dark:bg-dark-primary text-light-text-primary dark:text-dark-text-primary"
                        placeholder={t(
                          "admin.postEditor.seoKeywordsPlaceholder"
                        )}
                      />
                      <p className="mt-1 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                        {t("admin.postEditor.seoKeywordsHelper")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`bg-light-accent dark:bg-dark-accent text-white py-2 px-6 rounded-md font-medium flex items-center transition-colors ${
                      loading
                        ? "opacity-70 cursor-not-allowed"
                        : "hover:opacity-90"
                    }`}
                  >
                    {loading ? (
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
                        {t("admin.postEditor.saving")}
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2" />
                        {isEditMode
                          ? t("admin.postEditor.updatePost")
                          : t("admin.postEditor.savePost")}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Preview pane */}
            {showPreview && (
              <div className="lg:col-span-2">
                <div className="bg-light-secondary dark:bg-dark-secondary rounded-lg p-6 sticky top-24">
                  <h2 className="text-lg font-semibold mb-4 text-light-text-primary dark:text-dark-text-primary">
                    {t("admin.postEditor.preview")}
                  </h2>

                  <div className="bg-light-primary dark:bg-dark-primary rounded-lg p-6 overflow-auto max-h-[calc(100vh-200px)]">
                    <h1 className="text-2xl font-bold mb-4 text-light-text-primary dark:text-dark-text-primary">
                      {title || t("admin.postEditor.untitledPost")}
                    </h1>

                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {tags.map((tag) => (
                          <div
                            key={tag}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-light-secondary dark:bg-dark-secondary text-light-accent dark:text-dark-accent"
                          >
                            <FaTag className="mr-1 text-xs" />
                            {tag}
                          </div>
                        ))}
                      </div>
                    )}

                    {coverImage && (
                      <div className="mb-6">
                        <img
                          src={coverImage}
                          alt={title}
                          className="w-full h-64 object-cover rounded-md"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/images/blog-placeholder.jpg";
                          }}
                        />
                      </div>
                    )}

                    <div className="prose prose-lg dark:prose-invert max-w-none">
                      <MarkdownPreview content={content} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PostEditor;
