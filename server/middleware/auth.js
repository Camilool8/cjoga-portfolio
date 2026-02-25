import logger from "../utils/logger.js";

export const authenticate = async (req, res, next) => {
  try {
    if (!req.supabase) {
      logger.error("Supabase client not available in auth middleware");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    const { data, error } = await req.supabase.auth.getUser(token);

    if (error || !data.user) {
      logger.warn("Invalid authentication token", { error });
      return res.status(401).json({ error: "Invalid authentication token" });
    }

    req.user = data.user;
    next();
  } catch (error) {
    logger.error("Authentication error:", error);
    res.status(500).json({ error: "Authentication process failed" });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (req.user?.role !== "authenticated") {
    logger.warn("Unauthorized admin access attempt", {
      userId: req.user.id,
      email: req.user.email,
    });
    return res.status(403).json({ error: "Administrator privileges required" });
  }

  next();
};

export const authenticateAdmin = async (req, res, next) => {
  try {
    if (!req.supabase) {
      logger.error("Supabase client not available in admin auth middleware");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    const { data, error } = await req.supabase.auth.getUser(token);

    if (error || !data.user) {
      logger.warn("Invalid authentication token", { error });
      return res.status(401).json({ error: "Invalid authentication token" });
    }

    if (data.user?.role !== "authenticated") {
      logger.warn("Unauthorized admin access attempt", {
        userId: data.user.id,
        email: data.user.email,
      });
      return res
        .status(403)
        .json({ error: "Administrator privileges required" });
    }

    req.user = data.user;
    next();
  } catch (error) {
    logger.error("Admin authentication error:", error);
    res.status(500).json({ error: "Authentication process failed" });
  }
};
