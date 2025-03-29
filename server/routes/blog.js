// server/routes/blog.js - Blog routes
import express from "express";
import { marked } from "marked";
import slugify from "slugify";
import multer from "multer";
import path from "path";
import { authenticateAdmin } from "../middleware/auth.js";
import logger from "../utils/logger.js";

const router = express.Router();

// Configure multer for memory storage (not disk storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// PUBLIC ROUTES

// Get all blog posts (with pagination)
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

    // Filter by tag if provided
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

// Get a single blog post by slug
router.get("/posts/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    logger.info("Fetching blog post", { slug });

    // Check if the slug is a UUID (for admin edit functionality)
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

    // Parse markdown content to HTML
    post.html_content = marked.parse(post.content);

    // Increment view count for public (non-admin) requests
    if (!isUUID) {
      await req.supabase
        .from("posts")
        .update({ views: (post.views || 0) + 1 })
        .eq("id", post.id);
    }

    // Get related posts based on tags
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

// Get all tags with post counts
router.get("/tags", async (req, res) => {
  try {
    logger.info("Fetching blog tags");

    const { data: posts, error } = await req.supabase
      .from("posts")
      .select("tags")
      .eq("published", true);

    if (error) throw error;

    // Count occurrences of each tag
    const tagCounts = {};
    posts.forEach((post) => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    // Format for response
    const tags = Object.keys(tagCounts)
      .map((tag) => ({
        name: tag,
        count: tagCounts[tag],
      }))
      .sort((a, b) => b.count - a.count); // Sort by popularity

    res.json({ tags });
  } catch (error) {
    logger.error("Error fetching tags:", error);
    res.status(500).json({ error: "Failed to fetch tags" });
  }
});

// Search blog posts
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

// ADMIN ROUTES

// Get all blog posts for admin (including drafts)
router.get("/admin/posts", authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    logger.info("Admin fetching all blog posts", { page, limit });

    const { data, error, count } = await req.supabase
      .from("posts")
      .select(
        "id, title, slug, excerpt, cover_image, published, published_at, views, tags",
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

// Create a new blog post
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

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    logger.info("Creating new blog post", { title });

    // Generate a slug if not provided
    let slug = requestedSlug;
    if (!slug) {
      slug = slugify(title, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
      });
    }

    // Check if slug already exists
    const { data: existingPost, error: slugCheckError } = await req.supabase
      .from("posts")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (slugCheckError) throw slugCheckError;

    // If slug exists, append a timestamp to make it unique
    if (existingPost) {
      slug = `${slug}-${Date.now()}`;
    }

    // Insert new post
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

// Update an existing blog post
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

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    logger.info("Updating blog post", { id, title });

    // Generate a slug if not provided
    let slug = requestedSlug;
    if (!slug) {
      slug = slugify(title, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
      });
    }

    // Check if slug already exists (excluding the current post)
    const { data: existingPost, error: slugCheckError } = await req.supabase
      .from("posts")
      .select("id")
      .eq("slug", slug)
      .neq("id", id)
      .maybeSingle();

    if (slugCheckError) throw slugCheckError;

    // If slug exists, append a timestamp to make it unique
    if (existingPost) {
      slug = `${slug}-${Date.now()}`;
    }

    // Get current post to check publication status
    const { data: currentPost, error: currentPostError } = await req.supabase
      .from("posts")
      .select("published")
      .eq("id", id)
      .single();

    if (currentPostError) throw currentPostError;

    // Update published_at only if post is being published for the first time
    const updateData = {
      title,
      slug,
      content,
      excerpt: excerpt || title.substring(0, 160),
      cover_image,
      published: published || false,
      updated_at: new Date().toISOString(),
      tags: tags || [],
      seo_title: seo_title || title,
      seo_description: seo_description || excerpt || title.substring(0, 160),
      seo_keywords: seo_keywords || [],
    };

    // If post wasn't published before but is being published now, set published_at
    if (!currentPost.published && published) {
      updateData.published_at = new Date().toISOString();
    }

    // Update post
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

// Delete a blog post
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

// Update post status (publish/unpublish)
router.patch("/admin/posts/:id/status", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { published } = req.body;

    if (published === undefined) {
      return res.status(400).json({ error: "Published status is required" });
    }

    logger.info("Updating blog post status", { id, published });

    // Get current post to check publication status
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

    // If post wasn't published before but is being published now, set published_at
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

// Upload an image to Supabase Storage
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

      // Generate a unique filename
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(req.file.originalname || ".jpg").toLowerCase();
      const filename = `blog-${uniqueSuffix}${ext}`;

      // Upload file to Supabase Storage
      const { data, error } = await req.supabase.storage
        .from("cjoga-portfolio-images")
        .upload(`blog/${filename}`, req.file.buffer, {
          contentType: req.file.mimetype,
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // Get the public URL for the uploaded file
      const { data: publicUrlData } = req.supabase.storage
        .from("cjoga-portfolio-images")
        .getPublicUrl(`blog/${filename}`);

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
      res.status(500).json({ error: "Failed to upload image" });
    }
  }
);

export default router;
