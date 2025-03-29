// server/index.js - Main Express server
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { supabase } from "./utils/supabase.js";
import logger from "./utils/logger.js";
import blogRoutes from "./routes/blog.js";
import authRoutes from "./routes/auth.js";

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPaths = [
  path.join(__dirname, ".env"),
  path.join(__dirname, "../.env"),
  path.join(__dirname, "../.env.local"),
];

// Try each path until we find one that exists
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    logger.info(`Loading environment variables from ${envPath}`);
    dotenv.config({ path: envPath });
    break;
  }
}

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";

// Security middleware
if (isProduction) {
  // Set security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
          ],
          imgSrc: [
            "'self'",
            "data:",
            "https://etyutaeoblbixarewyrv.supabase.co",
          ],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          connectSrc: ["'self'", "https://etyutaeoblbixarewyrv.supabase.co"],
        },
      },
    })
  );

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests from this IP, please try again later.",
  });
  app.use("/api/", limiter);
}

// Response compression
app.use(compression());

// CORS configuration
app.use(
  cors({
    origin: isProduction
      ? ["https://cjoga.cloud", "https://www.cjoga.cloud"]
      : true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Pass supabase client to routes
app.use((req, res, next) => {
  req.supabase = supabase;
  next();
});

// Routes
app.use("/api/blog", blogRoutes);
app.use("/api/auth", authRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });

  // Don't expose error details in production
  const message = isProduction ? "Internal server error" : err.message;
  res.status(err.status || 500).json({ error: message });
});

// Serve static frontend files in production
if (isProduction) {
  const distPath = path.join(__dirname, "../dist");
  if (fs.existsSync(distPath)) {
    app.use(
      express.static(distPath, {
        maxAge: "1y",
        etag: true,
        lastModified: true,
      })
    );

    // For any route not matching an API route, serve the React app
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

// Start server
app.listen(PORT, () => {
  logger.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception:", err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled rejection at:", promise, "reason:", reason);
  process.exit(1);
});
