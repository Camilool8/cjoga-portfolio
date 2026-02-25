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
import terminalRoutes from "./routes/terminal.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPaths = [
  path.join(__dirname, ".env"),
  path.join(__dirname, "../.env"),
  path.join(__dirname, "../.env.local"),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    logger.info(`Loading environment variables from ${envPath}`);
    dotenv.config({ path: envPath });
    break;
  }
}

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";

if (isProduction) {
  app.set("trust proxy", 1);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          connectSrc: [
            "'self'",
            "https://etyutaeoblbixarewyrv.supabase.co",
            "data:",
            "https://cdnjs.cloudflare.com",
          ],
          fontSrc: [
            "'self'",
            "https://fonts.gstatic.com",
            "https://cdnjs.cloudflare.com",
          ],
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
        },
      },
    })
  );

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests from this IP, please try again later.",
  });
  app.use("/api/", limiter);

  const terminalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: JSON.stringify({
      output: "Rate limit exceeded. Please wait before sending more commands.",
      type: "error",
    }),
  });
  app.use("/api/terminal", terminalLimiter);
}

app.use(compression());

app.use(
  cors({
    origin: isProduction
      ? ["https://cjoga.cloud", "https://www.cjoga.cloud"]
      : true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

app.use((req, res, next) => {
  req.supabase = supabase;
  next();
});

app.use("/api/blog", blogRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/terminal", terminalRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });
  const message = isProduction ? "Internal server error" : err.message;
  res.status(err.status || 500).json({ error: message });
});

const distPath = path.join(__dirname, "../dist");
if (fs.existsSync(distPath)) {
  const staticOptions = isProduction
    ? { maxAge: "1y", etag: true, lastModified: true }
    : {};

  app.use(express.static(distPath, staticOptions));

  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  logger.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled rejection at:", promise, "reason:", reason);
  process.exit(1);
});
