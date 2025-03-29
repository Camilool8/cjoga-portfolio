import express from "express";
import { authenticate } from "../middleware/auth.js";
import logger from "../utils/logger.js";

const router = express.Router();

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Attempt login with Supabase
    const { data, error } = await req.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.warn("Login failed", { email, error: error.message });
      return res.status(401).json({ error: "Invalid login credentials" });
    }

    logger.info("User logged in successfully", { email });
    res.json(data);
  } catch (error) {
    logger.error("Login error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

// Logout route
router.post("/logout", authenticate, async (req, res) => {
  try {
    const { error } = await req.supabase.auth.signOut();

    if (error) {
      throw error;
    }

    logger.info("User logged out successfully", { userId: req.user.id });
    res.json({ success: true });
  } catch (error) {
    logger.error("Logout error:", error);
    res.status(500).json({ error: "Failed to log out" });
  }
});

// Get user data route
router.get("/user", authenticate, async (req, res) => {
  try {
    // User data is already in req.user from authenticate middleware
    // Remove sensitive data
    const { email, id, user_metadata } = req.user;

    res.json({
      user: {
        id,
        email,
        role: user?.role || "user",
      },
    });
  } catch (error) {
    logger.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user data" });
  }
});

// Check if user is admin
router.get("/admin", authenticate, async (req, res) => {
  try {
    const isAdmin = req.user?.role === "authenticated";
    res.json({ isAdmin });
  } catch (error) {
    logger.error("Admin check error:", error);
    res.status(500).json({ error: "Failed to check admin status" });
  }
});

// Password reset request
router.post("/reset-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const { error } = await req.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${
        process.env.FRONTEND_URL || "https://cjoga.cloud"
      }/reset-password`,
    });

    if (error) {
      logger.warn("Password reset request failed", {
        email,
        error: error.message,
      });
      throw error;
    }

    logger.info("Password reset email sent", { email });
    res.json({ success: true, message: "Password reset email sent" });
  } catch (error) {
    logger.error("Password reset error:", error);
    // Don't reveal if the email exists or not for security
    res.json({
      success: true,
      message:
        "If your email exists in our system, you will receive a password reset link",
    });
  }
});

// Update password after reset
router.post("/update-password", authenticate, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters long" });
    }

    const { error } = await req.supabase.auth.updateUser({
      password,
    });

    if (error) {
      logger.warn("Password update failed", {
        userId: req.user.id,
        error: error.message,
      });
      throw error;
    }

    logger.info("Password updated successfully", { userId: req.user.id });
    res.json({ success: true });
  } catch (error) {
    logger.error("Password update error:", error);
    res.status(500).json({ error: "Failed to update password" });
  }
});

export default router;
