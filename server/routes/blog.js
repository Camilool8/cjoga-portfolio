import express from "express";
import { marked } from "marked";
import slugify from "slugify";
import multer from "multer";
import path from "path";
import Prism from "prismjs";
import { authenticateAdmin } from "../middleware/auth.js";
import logger from "../utils/logger.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

router.get("/posts", async (req, res) => {
  try {
    const { page = 1, limit = 10, tag } = req.query;
    const offset = (page - 1) * limit;

    logger.info("Fetching blog posts", { page, limit, tag });

    let query = req.supabase
      .from("posts")
      .select(
        "id, title, slug, excerpt, cover_image, published_at, reading_time, tags",
        { count: "exact" }
      )
      .eq("published", true)
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (tag) {
      query = query.contains("tags", [tag]);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      posts: data,
      totalPosts: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    logger.error("Error fetching blog posts:", error);
    res.status(500).json({ error: "Failed to fetch blog posts" });
  }
});

router.get("/posts/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    logger.info("Fetching blog post", { slug });

    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        slug
      );

    let query = req.supabase.from("posts").select("*");

    if (isUUID) {
      query = query.eq("id", slug);
    } else {
      query = query.eq("slug", slug).eq("published", true);
    }

    const { data: post, error } = await query.single();

    if (error) {
      if (error.code === "PGRST116") {
        logger.warn("Post not found", { slug });
        return res.status(404).json({ error: "Post not found" });
      }
      throw error;
    }

    marked.setOptions({
      highlight: function (code, lang) {
        if (Prism.languages[lang]) {
          return Prism.highlight(code, Prism.languages[lang], lang);
        } else {
          return code;
        }
      },
      gfm: true,
      breaks: true,
      headerIds: true,
      mangle: false,
    });

    post.html_content = marked.parse(post.content);

    if (!isUUID) {
      await req.supabase
        .from("posts")
        .update({ views: (post.views || 0) + 1 })
        .eq("id", post.id);
    }

    const { data: relatedPosts } = await req.supabase
      .from("posts")
      .select("id, title, slug, excerpt, cover_image, published_at")
      .eq("published", true)
      .neq("id", post.id)
      .contains("tags", post.tags)
      .limit(3);

    res.json({
      post,
      relatedPosts: relatedPosts || [],
    });
  } catch (error) {
    logger.error("Error fetching blog post:", error);
    res.status(500).json({ error: "Failed to fetch blog post" });
  }
});

router.get("/tags", async (req, res) => {
  try {
    logger.info("Fetching blog tags");

    const { data: posts, error } = await req.supabase
      .from("posts")
      .select("tags")
      .eq("published", true);

    if (error) throw error;

    const tagCounts = {};
    posts.forEach((post) => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    const tags = Object.keys(tagCounts)
      .map((tag) => ({
        name: tag,
        count: tagCounts[tag],
      }))
      .sort((a, b) => b.count - a.count);

    res.json({ tags });
  } catch (error) {
    logger.error("Error fetching tags:", error);
    res.status(500).json({ error: "Failed to fetch tags" });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    logger.info("Searching blog posts", { query });

    const { data, error } = await req.supabase
      .from("posts")
      .select("id, title, slug, excerpt, published_at")
      .eq("published", true)
      .or(
        `title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`
      )
      .order("published_at", { ascending: false })
      .limit(10);

    if (error) throw error;

    res.json({ results: data });
  } catch (error) {
    logger.error("Error searching blog posts:", error);
    res.status(500).json({ error: "Failed to search blog posts" });
  }
});

router.get("/admin/posts", authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    logger.info("Admin fetching all blog posts", { page, limit });

    const { data, error, count } = await req.supabase
      .from("posts")
      .select(
        "id, title, slug, excerpt, cover_image, published, published_at, views, tags, updated_at",
        { count: "exact" }
      )
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      posts: data,
      totalPosts: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    logger.error("Error fetching admin blog posts:", error);
    res.status(500).json({ error: "Failed to fetch admin blog posts" });
  }
});

router.get("/admin/posts/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    logger.info("Admin fetching blog post", { id });

    const { data: post, error } = await req.supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        logger.warn("Post not found", { id });
        return res.status(404).json({ error: "Post not found" });
      }
      throw error;
    }

    logger.info("Admin post found", { postId: post.id, title: post.title });

    res.json({ post });
  } catch (error) {
    logger.error("Error fetching admin blog post:", error);
    res.status(500).json({ error: "Failed to fetch blog post" });
  }
});

router.get("/posts/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    logger.info("Fetching blog post", { slug });

    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        slug
      );

    let query = req.supabase.from("posts").select("*");

    if (isUUID) {
      query = query.eq("id", slug);
    } else {
      query = query.eq("slug", slug).eq("published", true);
    }

    const { data: post, error } = await query.single();

    if (error) {
      if (error.code === "PGRST116") {
        logger.warn("Post not found", { slug });
        return res.status(404).json({ error: "Post not found" });
      }
      throw error;
    }

    logger.info("Post found", { postId: post.id, title: post.title });

    if (!isUUID) {
      marked.setOptions({
        highlight: function (code, lang) {
          if (Prism.languages[lang]) {
            return Prism.highlight(code, Prism.languages[lang], lang);
          } else {
            return code;
          }
        },
        gfm: true,
        breaks: true,
        headerIds: true,
        mangle: false,
      });

      post.html_content = marked.parse(post.content || "");

      await req.supabase
        .from("posts")
        .update({ views: (post.views || 0) + 1 })
        .eq("id", post.id);
    }

    let relatedPosts = [];
    if (!isUUID && post.tags && post.tags.length > 0) {
      const { data: relatedPostsData } = await req.supabase
        .from("posts")
        .select("id, title, slug, excerpt, cover_image, published_at")
        .eq("published", true)
        .neq("id", post.id)
        .contains("tags", post.tags)
        .limit(3);

      relatedPosts = relatedPostsData || [];
    }

    res.json({
      post,
      relatedPosts,
    });
  } catch (error) {
    logger.error("Error fetching blog post:", error);
    res.status(500).json({ error: "Failed to fetch blog post" });
  }
});

router.post("/admin/posts", authenticateAdmin, async (req, res) => {
  try {
    const {
      title,
      slug: requestedSlug,
      content,
      excerpt,
      cover_image,
      published,
      tags,
      seo_title,
      seo_description,
      seo_keywords,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    logger.info("Creating new blog post", { title });

    let slug = requestedSlug;
    if (!slug) {
      slug = slugify(title, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
      });
    }

    const { data: existingPost, error: slugCheckError } = await req.supabase
      .from("posts")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (slugCheckError) throw slugCheckError;

    if (existingPost) {
      slug = `${slug}-${Date.now()}`;
    }

    const { data, error } = await req.supabase
      .from("posts")
      .insert({
        title,
        slug,
        content,
        excerpt: excerpt || title.substring(0, 160),
        cover_image,
        published: published || false,
        published_at: published ? new Date().toISOString() : null,
        tags: tags || [],
        seo_title: seo_title || title,
        seo_description: seo_description || excerpt || title.substring(0, 160),
        seo_keywords: seo_keywords || [],
      })
      .select()
      .single();

    if (error) throw error;

    logger.info("Blog post created successfully", {
      id: data.id,
      slug: data.slug,
    });
    res.status(201).json({ post: data });
  } catch (error) {
    logger.error("Error creating blog post:", error);
    res.status(500).json({ error: "Failed to create blog post" });
  }
});

router.put("/admin/posts/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug: requestedSlug,
      content,
      excerpt,
      cover_image,
      published,
      tags,
      seo_title,
      seo_description,
      seo_keywords,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    logger.info("Updating blog post", { id, title });

    let slug = requestedSlug;
    if (!slug) {
      slug = slugify(title, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
      });
    }

    const { data: existingPost, error: slugCheckError } = await req.supabase
      .from("posts")
      .select("id")
      .eq("slug", slug)
      .neq("id", id)
      .maybeSingle();

    if (slugCheckError) throw slugCheckError;

    if (existingPost) {
      slug = `${slug}-${Date.now()}`;
    }

    const { data: currentPost, error: currentPostError } = await req.supabase
      .from("posts")
      .select("published")
      .eq("id", id)
      .single();

    if (currentPostError) throw currentPostError;

    const updateData = {
      title,
      slug,
      content,
      excerpt: excerpt || title.substring(0, 160),
      cover_image,
      published: published !== undefined ? published : false,
      updated_at: new Date().toISOString(),
      tags: tags || [],
      seo_title: seo_title || title,
      seo_description: seo_description || excerpt || title.substring(0, 160),
      seo_keywords: seo_keywords || [],
    };

    if (!currentPost.published && published) {
      updateData.published_at = new Date().toISOString();
    }

    const { data, error } = await req.supabase
      .from("posts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    logger.info("Blog post updated successfully", { id });
    res.json({ post: data });
  } catch (error) {
    logger.error("Error updating blog post:", error);
    res.status(500).json({ error: "Failed to update blog post" });
  }
});

router.delete("/admin/posts/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    logger.info("Deleting blog post", { id });

    const { error } = await req.supabase.from("posts").delete().eq("id", id);

    if (error) throw error;

    logger.info("Blog post deleted successfully", { id });
    res.json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    logger.error("Error deleting blog post:", error);
    res.status(500).json({ error: "Failed to delete blog post" });
  }
});

router.patch("/admin/posts/:id/status", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { published } = req.body;

    if (published === undefined) {
      return res.status(400).json({ error: "Published status is required" });
    }

    logger.info("Updating blog post status", { id, published });

    const { data: currentPost, error: currentPostError } = await req.supabase
      .from("posts")
      .select("published")
      .eq("id", id)
      .single();

    if (currentPostError) throw currentPostError;

    const updateData = {
      published,
      updated_at: new Date().toISOString(),
    };

    if (!currentPost.published && published) {
      updateData.published_at = new Date().toISOString();
    }

    const { data, error } = await req.supabase
      .from("posts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    logger.info("Blog post status updated successfully", { id, published });
    res.json({ post: data });
  } catch (error) {
    logger.error("Error updating blog post status:", error);
    res.status(500).json({ error: "Failed to update blog post status" });
  }
});

router.post(
  "/admin/upload",
  authenticateAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      logger.info("Uploading image for blog", {
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      });

      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const fileExt = path
        .extname(req.file.originalname || ".jpg")
        .toLowerCase();
      const filename = `blog-${uniqueSuffix}${fileExt}`;

      const BUCKET_NAME = "cjoga-portfolio-images";
      const FILE_PATH = `blog/${filename}`;

      const { data, error } = await req.supabase.storage
        .from(BUCKET_NAME)
        .upload(FILE_PATH, req.file.buffer, {
          contentType: req.file.mimetype,
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        logger.error("Supabase storage upload error:", error);
        throw error;
      }

      const { data: publicUrlData } = req.supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(FILE_PATH);

      logger.info("Image uploaded successfully", {
        filename,
        url: publicUrlData.publicUrl,
      });

      res.json({
        url: publicUrlData.publicUrl,
        filename: filename,
      });
    } catch (error) {
      logger.error("Error uploading image:", error);
      res
        .status(500)
        .json({ error: "Failed to upload image", details: error.message });
    }
  }
);

export default router;
