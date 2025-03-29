import logger from "../utils/logger.js";

/**
 * Middleware to authenticate all requests
 * Checks for valid JWT in Authorization header
 */
export const authenticate = async (req, res, next) => {
  try {
    // Check if Supabase client is available
    if (!req.supabase) {
      logger.error("Supabase client not available in auth middleware");
      return res.status(500).json({ error: "Server configuration error" });
    }

    // Get Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Extract and verify token
    const token = authHeader.split(" ")[1];
    const { data, error } = await req.supabase.auth.getUser(token);

    if (error || !data.user) {
      logger.warn("Invalid authentication token", { error });
      return res.status(401).json({ error: "Invalid authentication token" });
    }

    // Add user to request
    req.user = data.user;
    next();
  } catch (error) {
    logger.error("Authentication error:", error);
    res.status(500).json({ error: "Authentication process failed" });
  }
};

/**
 * Middleware to verify admin privileges
 * Must be used after authenticate middleware
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // Check for admin role in user metadata
  if (req.user?.role !== "authenticated") {
    logger.warn("Unauthorized admin access attempt", {
      userId: req.user.id,
      email: req.user.email,
    });
    return res.status(403).json({ error: "Administrator privileges required" });
  }

  next();
};

/**
 * Combined middleware for admin routes
 * Handles both authentication and admin role verification
 */
export const authenticateAdmin = async (req, res, next) => {
  try {
    // Check if Supabase client is available
    if (!req.supabase) {
      logger.error("Supabase client not available in admin auth middleware");
      return res.status(500).json({ error: "Server configuration error" });
    }

    // Get Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Extract and verify token
    const token = authHeader.split(" ")[1];
    const { data, error } = await req.supabase.auth.getUser(token);

    if (error || !data.user) {
      logger.warn("Invalid authentication token", { error });
      return res.status(401).json({ error: "Invalid authentication token" });
    }

    // Check admin privileges
    if (data.user?.role !== "authenticated") {
      logger.warn("Unauthorized admin access attempt", {
        userId: data.user.id,
        email: data.user.email,
      });
      return res
        .status(403)
        .json({ error: "Administrator privileges required" });
    }

    // Add user to request
    req.user = data.user;
    next();
  } catch (error) {
    logger.error("Admin authentication error:", error);
    res.status(500).json({ error: "Authentication process failed" });
  }
};
