import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaCalendarAlt,
  FaClock,
  FaTag,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaLink,
  FaArrowLeft,
} from "react-icons/fa";
import BlogSidebar from "./BlogSidebar";
import TableOfContents from "./TableOfContents";
import RelatedPosts from "./RelatedPosts";
import blogApi from "../../services/blogApi";

function BlogPost() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const contentRef = useRef(null);
  const tocItems = useRef([]);

  // Fetch blog post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const { post, relatedPosts } = await blogApi.getPost(slug);
        setPost(post);
        setRelatedPosts(relatedPosts);

        // Parse headings for table of contents after post is loaded
        setTimeout(() => {
          if (contentRef.current) {
            const headings = Array.from(
              contentRef.current.querySelectorAll("h2, h3, h4")
            );
            tocItems.current = headings.map((heading) => ({
              id: heading.id,
              text: heading.textContent,
              level: parseInt(heading.tagName.substring(1)),
            }));
          }
        }, 100);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(t("blog.error.post"));
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
    window.scrollTo(0, 0);
  }, [slug, t]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(i18n.language, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  // Share functionality
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleShare = (platform) => {
    const title = post?.title;
    let shareWindow;

    switch (platform) {
      case "facebook":
        shareWindow = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          shareUrl
        )}`;
        break;
      case "twitter":
        shareWindow = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          shareUrl
        )}&text=${encodeURIComponent(title)}`;
        break;
      case "linkedin":
        shareWindow = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          shareUrl
        )}`;
        break;
      case "copy":
        navigator.clipboard.writeText(shareUrl);
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 2000);
        return;
      default:
        return;
    }

    window.open(shareWindow, "_blank", "width=600,height=400");
  };

  if (loading) {
    return (
      <section className="py-20">
        <div className="section-inner">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-light-accent dark:border-dark-accent"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !post) {
    return (
      <section className="py-20">
        <div className="section-inner">
          <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-md mb-4">
            {error || t("blog.error.postNotFound")}
          </div>
          <button
            onClick={() => navigate("/blog")}
            className="cta-button flex items-center"
          >
            <FaArrowLeft className="mr-2" />
            {t("blog.backToBlog")}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="blog-post" className="py-20">
      <div className="section-inner">
        {/* Back button */}
        <div className="mb-8">
          <Link
            to="/blog"
            className="inline-flex items-center font-mono text-sm text-light-accent dark:text-dark-accent hover:underline"
          >
            <FaArrowLeft className="mr-2" />
            {t("blog.backToBlog")}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main content */}
          <div className="lg:col-span-3">
            <article className="bg-light-secondary dark:bg-dark-secondary rounded-md overflow-hidden shadow-custom-light dark:shadow-custom-dark">
              {/* Cover Image */}
              {post.cover_image && (
                <div className="w-full">
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full h-64 md:h-96 object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-6 md:p-8">
                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-light-text-primary dark:text-dark-text-primary">
                  {post.title}
                </h1>

                {/* Meta */}
                <div className="flex flex-wrap items-center mb-6 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  <span className="flex items-center mr-4 mb-2">
                    <FaCalendarAlt className="mr-1" />
                    {formatDate(post.published_at)}
                  </span>

                  <span className="flex items-center mb-2">
                    <FaClock className="mr-1" />
                    {t("blog.readingTime", { minutes: post.reading_time })}
                  </span>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap mb-6 gap-2">
                    {post.tags.map((tag, index) => (
                      <Link
                        key={index}
                        to={`/blog?tag=${tag}`}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-light-primary dark:bg-dark-primary text-light-accent dark:text-dark-accent hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 transition-colors"
                      >
                        <FaTag className="mr-1 text-xs" />
                        {tag}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Table of Contents */}
                {tocItems.current.length > 0 && (
                  <div className="my-6 p-4 bg-light-primary dark:bg-dark-primary rounded-md">
                    <h3 className="text-lg font-semibold mb-3 text-light-text-primary dark:text-dark-text-primary">
                      {t("blog.tableOfContents")}
                    </h3>
                    <TableOfContents items={tocItems.current} />
                  </div>
                )}

                {/* Content */}
                <div
                  ref={contentRef}
                  className="prose prose-lg dark:prose-invert max-w-none prose-a:text-light-accent dark:prose-a:text-dark-accent prose-img:rounded-md prose-headings:scroll-mt-24"
                  dangerouslySetInnerHTML={{ __html: post.html_content }}
                />

                {/* Share buttons */}
                <div className="border-t border-light-accent/20 dark:border-dark-accent/20 mt-8 pt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {t("blog.sharePost")}
                  </h3>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleShare("facebook")}
                      className="w-10 h-10 rounded-full bg-light-primary dark:bg-dark-primary flex items-center justify-center text-light-text-primary dark:text-dark-text-primary hover:text-light-accent dark:hover:text-dark-accent transition-colors"
                      aria-label="Share on Facebook"
                    >
                      <FaFacebookF />
                    </button>
                    <button
                      onClick={() => handleShare("twitter")}
                      className="w-10 h-10 rounded-full bg-light-primary dark:bg-dark-primary flex items-center justify-center text-light-text-primary dark:text-dark-text-primary hover:text-light-accent dark:hover:text-dark-accent transition-colors"
                      aria-label="Share on Twitter"
                    >
                      <FaTwitter />
                    </button>
                    <button
                      onClick={() => handleShare("linkedin")}
                      className="w-10 h-10 rounded-full bg-light-primary dark:bg-dark-primary flex items-center justify-center text-light-text-primary dark:text-dark-text-primary hover:text-light-accent dark:hover:text-dark-accent transition-colors"
                      aria-label="Share on LinkedIn"
                    >
                      <FaLinkedinIn />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => handleShare("copy")}
                        className="w-10 h-10 rounded-full bg-light-primary dark:bg-dark-primary flex items-center justify-center text-light-text-primary dark:text-dark-text-primary hover:text-light-accent dark:hover:text-dark-accent transition-colors"
                        aria-label="Copy link"
                      >
                        <FaLink />
                      </button>
                      {showTooltip && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-light-accent dark:bg-dark-accent text-white text-xs rounded whitespace-nowrap">
                          {t("blog.linkCopied")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-semibold mb-6">
                  {t("blog.relatedPosts")}
                </h2>
                <RelatedPosts posts={relatedPosts} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BlogSidebar />
          </div>
        </div>
      </div>
    </section>
  );
}

export default BlogPost;
