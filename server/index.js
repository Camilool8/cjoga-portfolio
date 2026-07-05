import express from "express";
import path from "path";
import fs from "fs";
import net from "net";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import logger from "./utils/logger.js";
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

// Normalize an IP for use as a rate-limit key. IPv6 clients get bucketed by
// their /64 so a host can't rotate through its allocation to dodge limits.
// (express-rate-limit 7.5.0 doesn't export ipKeyGenerator yet.)
const normalizeIpKey = (ip) => {
  if (typeof ip !== "string" || !ip) return "unknown";
  const clean = ip.trim().slice(0, 100);
  if (net.isIPv4(clean)) return clean;
  const mapped = clean.match(/(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (mapped && net.isIPv4(mapped[1])) return mapped[1];
  if (net.isIPv6(clean)) {
    const [head, tail = ""] = clean.split("::");
    const headParts = head ? head.split(":") : [];
    const tailParts = tail ? tail.split(":") : [];
    const missing = Math.max(8 - headParts.length - tailParts.length, 0);
    const full = [...headParts, ...Array(missing).fill("0"), ...tailParts];
    return `${full.slice(0, 4).join(":")}::/64`;
  }
  return clean;
};

// Cloudflare terminates the client connection at the edge and sets
// CF-Connecting-IP authoritatively; behind tunnel + Envoy the XFF hop count
// is fragile, so rate limiting keys off CF-Connecting-IP when present and
// falls back to req.ip.
const clientIpKey = (req) => {
  const cfIp = req.headers["cf-connecting-ip"];
  return normalizeIpKey(typeof cfIp === "string" && cfIp ? cfIp : req.ip);
};

// Kubernetes liveness/readiness probes hit /api/health every few seconds —
// they must never consume (or trip) the public rate-limit budget. This is
// what lets the k8s manifests use a plain httpGet probe again.
const isHealthCheck = (req) =>
  req.method === "GET" && req.originalUrl.split("?")[0] === "/api/health";

if (isProduction) {
  app.set("trust proxy", 1);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          // 'unsafe-inline' stays for the theme bootstrap; 'unsafe-eval'
          // is not needed by the Vite production build.
          scriptSrc: ["'self'", "'unsafe-inline'"],
          connectSrc: ["'self'", "data:", "https://cdnjs.cloudflare.com"],
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
          imgSrc: ["'self'", "data:"],
        },
      },
    })
  );

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: clientIpKey,
    skip: isHealthCheck,
    message: "Too many requests from this IP, please try again later.",
  });
  app.use("/api/", limiter);

  const terminalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: clientIpKey,
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

app.use("/api/terminal", terminalRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

// Unknown API paths are a JSON 404, never the SPA shell.
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

const distPath = path.join(__dirname, "../dist");

// The SPA only owns these routes; everything else that isn't a real static
// file is a 404 (no more soft-200s for crawlers).
const SPA_ROUTES = ["/", "/terminal", "/es", "/es/terminal"];

if (fs.existsSync(distPath)) {
  // index: false prevents express.static from serving index.html directly,
  // so it won't inherit the 1y cache. Hashed JS/CSS/image assets still get
  // 1y + immutable (filenames change on every deploy).
  const staticOptions = isProduction
    ? { maxAge: "1y", immutable: true, etag: true, lastModified: true, index: false }
    : { index: false };

  app.use(express.static(distPath, staticOptions));

  const sendSpa = (req, res, status) => {
    if (isProduction) {
      // Always serve HTML with no-cache so deploys take effect immediately.
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    }
    // Prefer a prerendered snapshot for the route when the build produced
    // one (e.g. dist/es/index.html); otherwise fall back to the SPA shell.
    const route = req.path.replace(/^\/+|\/+$/g, "");
    const prerendered = path.join(distPath, route, "index.html");
    const file =
      route && fs.existsSync(prerendered)
        ? prerendered
        : path.join(distPath, "index.html");
    res.status(status).sendFile(file);
  };

  app.get(SPA_ROUTES, (req, res) => sendSpa(req, res, 200));

  // Anything else: same shell for humans, 404 status for crawlers.
  app.use((req, res) => sendSpa(req, res, 404));
}

app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });
  const message = isProduction ? "Internal server error" : err.message;
  res.status(err.status || 500).json({ error: message });
});

// Only bind a port when run as the entrypoint (node server/index.js);
// importing the app (tests, tooling) must not start a listener.
const isMain =
  process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (isMain) {
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
}

export default app;
