import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaLink,
  FaWhatsapp,
  FaReddit,
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaTag,
  FaEye,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import BlogSidebar from "./BlogSidebar";
import TableOfContents from "./TableOfContents";
import RelatedPosts from "./RelatedPosts";
import blogApi from "../../services/blogApi";
import SimpleMarkdownRenderer from "../Utils/SimpleMarkdownRenderer";

function BlogPost() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const contentRef = useRef(null);
  const tocItems = useRef([]);
  const [, setTocReady] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const { post, relatedPosts } = await blogApi.getPost(slug);
        setPost(post);
        setRelatedPosts(relatedPosts);

        setTimeout(() => {
          if (contentRef.current) {
            const content = contentRef.current;

            const headings = content.querySelectorAll("h2, h3, h4");
            headings.forEach((heading) => {
              if (!heading.id) {
                const id = heading.textContent
                  .toLowerCase()
                  .replace(/[^\w\s-]/g, "")
                  .replace(/\s+/g, "-")
                  .replace(/-+/g, "-");

                heading.id = id;
              }
            });

            const tocData = Array.from(headings).map((heading) => ({
              id: heading.id,
              text: heading.textContent,
              level: parseInt(heading.tagName.substring(1)),
            }));

            tocItems.current = tocData;
            setTocReady(true);
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

  const ReadingProgressBar = () => {
    const [readingProgress, setReadingProgress] = useState(0);

    useEffect(() => {
      const scrollListener = () => {
        const totalHeight =
          document.documentElement.scrollHeight -
          document.documentElement.clientHeight;
        const windowScroll = window.scrollY;

        if (windowScroll === 0) {
          setReadingProgress(0);
          return;
        }

        const scrolled = (windowScroll / totalHeight) * 100;
        setReadingProgress(scrolled);
      };

      window.addEventListener("scroll", scrollListener);
      return () => window.removeEventListener("scroll", scrollListener);
    }, []);

    return (
      <div
        className="sticky top-0 left-0 z-50 w-full h-1"
        style={{ background: "var(--bg-elevated)" }}
      >
        <div
          className="h-full"
          style={{
            background: "var(--gradient-accent)",
            width: `${readingProgress}%`,
            transition: "width 0.15s linear",
          }}
        />
      </div>
    );
  };

  useEffect(() => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    setShareUrl(shareUrl);
  }, []);

  const SocialShareButtons = ({ title, url }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const handleShare = (platform) => {
      let shareWindow;

      switch (platform) {
        case "facebook":
          shareWindow = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url
          )}`;
          break;
        case "twitter":
          shareWindow = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
            url
          )}&text=${encodeURIComponent(title)}`;
          break;
        case "linkedin":
          shareWindow = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            url
          )}`;
          break;
        case "reddit":
          shareWindow = `https://www.reddit.com/submit?url=${encodeURIComponent(
            url
          )}&title=${encodeURIComponent(title)}`;
          break;
        case "whatsapp":
          shareWindow = `https://api.whatsapp.com/send?text=${encodeURIComponent(
            title + " " + url
          )}`;
          break;
        case "copy":
          navigator.clipboard.writeText(url);
          setShowTooltip(true);
          setTimeout(() => setShowTooltip(false), 2000);
          return;
        default:
          return;
      }

      window.open(shareWindow, "_blank", "width=600,height=400");
    };

    const shareButtonBase = {
      width: "40px",
      height: "40px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--text-primary)",
      border: "1px solid var(--border-subtle)",
      background: "var(--bg-elevated)",
      transition: "all 0.3s var(--ease-out-expo)",
      cursor: "pointer",
    };

    return (
      <div
        className="mt-8 pt-6"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        <h3
          className="text-lg font-semibold mb-4 flex items-center"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--text-primary)",
          }}
        >
          {t("blog.sharePost")}
        </h3>
        <motion.div
          className="flex flex-wrap gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleShare("facebook")}
            style={shareButtonBase}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#1877f2";
              e.currentTarget.style.color = "#1877f2";
              e.currentTarget.style.background = "rgba(24, 119, 242, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-subtle)";
              e.currentTarget.style.color = "var(--text-primary)";
              e.currentTarget.style.background = "var(--bg-elevated)";
            }}
            aria-label="Share on Facebook"
          >
            <FaFacebookF />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleShare("twitter")}
            style={shareButtonBase}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#1da1f2";
              e.currentTarget.style.color = "#1da1f2";
              e.currentTarget.style.background = "rgba(29, 161, 242, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-subtle)";
              e.currentTarget.style.color = "var(--text-primary)";
              e.currentTarget.style.background = "var(--bg-elevated)";
            }}
            aria-label="Share on Twitter"
          >
            <FaTwitter />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleShare("linkedin")}
            style={shareButtonBase}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#0a66c2";
              e.currentTarget.style.color = "#0a66c2";
              e.currentTarget.style.background = "rgba(10, 102, 194, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-subtle)";
              e.currentTarget.style.color = "var(--text-primary)";
              e.currentTarget.style.background = "var(--bg-elevated)";
            }}
            aria-label="Share on LinkedIn"
          >
            <FaLinkedinIn />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleShare("whatsapp")}
            style={shareButtonBase}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#25d366";
              e.currentTarget.style.color = "#25d366";
              e.currentTarget.style.background = "rgba(37, 211, 102, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-subtle)";
              e.currentTarget.style.color = "var(--text-primary)";
              e.currentTarget.style.background = "var(--bg-elevated)";
            }}
            aria-label="Share on WhatsApp"
          >
            <FaWhatsapp />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleShare("reddit")}
            style={shareButtonBase}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#ff4500";
              e.currentTarget.style.color = "#ff4500";
              e.currentTarget.style.background = "rgba(255, 69, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-subtle)";
              e.currentTarget.style.color = "var(--text-primary)";
              e.currentTarget.style.background = "var(--bg-elevated)";
            }}
            aria-label="Share on Reddit"
          >
            <FaReddit />
          </motion.button>

          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleShare("copy")}
              style={shareButtonBase}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.color = "var(--accent)";
                e.currentTarget.style.background = "var(--accent-dim)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-subtle)";
                e.currentTarget.style.color = "var(--text-primary)";
                e.currentTarget.style.background = "var(--bg-elevated)";
              }}
              aria-label="Copy link"
            >
              <FaLink />
            </motion.button>
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 text-xs rounded-lg whitespace-nowrap"
                  style={{
                    background: "var(--accent)",
                    color: "var(--bg-primary)",
                    fontFamily: "var(--font-mono)",
                    boxShadow: "0 4px 20px var(--accent-glow)",
                  }}
                >
                  {t("blog.linkCopied")}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    );
  };

  if (loading) {
    return (
      <section className="py-20">
        <div className="section-inner">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div
              className="animate-spin rounded-full h-12 w-12"
              style={{
                borderTop: "2px solid var(--accent)",
                borderBottom: "2px solid var(--accent)",
                borderLeft: "2px solid transparent",
                borderRight: "2px solid transparent",
              }}
            />
          </div>
        </div>
      </section>
    );
  }

  if (error || !post) {
    return (
      <section className="py-20">
        <div className="section-inner">
          <div
            className="p-4 rounded-lg mb-4"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              color: "#f87171",
              border: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            {error || t("blog.error.postNotFound")}
          </div>
          <button
            onClick={() => navigate("/blog")}
            className="btn btn-outline flex items-center"
          >
            <FaArrowLeft className="mr-2" />
            {t("blog.backToBlog")}
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      <ReadingProgressBar />
      <section id="blog-post" className="py-20">
        <div className="section-inner">
          <div className="mb-8">
            <Link
              to="/blog"
              className="inline-flex items-center text-sm"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--accent)",
                transition: "opacity 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              <FaArrowLeft className="mr-2" />
              {t("blog.backToBlog")}
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="rounded-xl overflow-hidden"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                }}
              >
                {post.cover_image && (
                  <div className="w-full">
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-64 md:h-96 object-cover"
                    />
                  </div>
                )}

                <div className="p-6 md:p-8">
                  <h1
                    className="text-3xl md:text-4xl font-bold mb-4"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--text-primary)",
                      lineHeight: 1.15,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {post.title}
                  </h1>

                  <div
                    className="flex flex-wrap items-center mb-6 text-sm"
                    style={{
                      color: "var(--text-tertiary)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.8rem",
                    }}
                  >
                    <span className="flex items-center mr-4 mb-2">
                      <FaCalendarAlt className="mr-1" />
                      {formatDate(post.published_at)}
                    </span>

                    <span className="flex items-center mr-4 mb-2">
                      <FaClock className="mr-1" />
                      {t("blog.readingTime", { minutes: post.reading_time })}
                    </span>

                    <span className="flex items-center mb-2">
                      <FaEye className="mr-1" />
                      {t("blog.views", {
                        count: post.views || 0,
                        defaultValue: "{{count}} views",
                      })}
                    </span>
                  </div>

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap mb-6 gap-2">
                      {post.tags.map((tag, index) => (
                        <Link
                          key={index}
                          to={`/blog?tag=${tag}`}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs"
                          style={{
                            fontFamily: "var(--font-mono)",
                            background: "var(--accent-dim)",
                            color: "var(--accent)",
                            border: "1px solid var(--border-subtle)",
                            transition: "all 0.3s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor =
                              "var(--border-active)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor =
                              "var(--border-subtle)";
                          }}
                        >
                          <FaTag className="mr-1 text-xs" />
                          {tag}
                        </Link>
                      ))}
                    </div>
                  )}

                  {tocItems.current.length > 0 && (
                    <div
                      className="my-6 p-4 rounded-xl"
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      <h3
                        className="text-lg font-semibold mb-3"
                        style={{
                          fontFamily: "var(--font-display)",
                          color: "var(--text-primary)",
                        }}
                      >
                        {t("blog.tableOfContents")}
                      </h3>
                      <TableOfContents items={tocItems.current} />
                    </div>
                  )}

                  <SimpleMarkdownRenderer
                    content={post.content}
                    onHeadingsExtracted={(items) => {
                      tocItems.current = items;
                      setTocReady(true);
                    }}
                    className="prose prose-lg dark:prose-invert"
                  />

                  <SocialShareButtons title={post.title} url={shareUrl || ""} />
                </div>
              </motion.article>

              {relatedPosts.length > 0 && (
                <div className="mt-12">
                  <h2
                    className="text-2xl font-semibold mb-6"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {t("blog.relatedPosts")}
                  </h2>
                  <RelatedPosts posts={relatedPosts} />
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <BlogSidebar />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default BlogPost;
