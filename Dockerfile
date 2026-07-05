# syntax=docker/dockerfile:1.7

# ─── Builder ────────────────────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app

# Install deps first for layer caching; cache mount keeps repeat
# builds off the network.
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit --no-fund

# Rest of the source + production build.
COPY . .
RUN npm run build

# ─── Runtime ────────────────────────────────────────────────────────
FROM node:24-alpine AS runtime
WORKDIR /app

# Production deps only, with cache mount. No `npm cache clean` —
# the cache lives in a mount, not in the image layer.
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --prefer-offline --no-audit --no-fund

# Built frontend + Express server, owned by the unprivileged node user.
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --chown=node:node server ./server

# Unprivileged: non-root user + a port that doesn't need CAP_NET_BIND_SERVICE.
# NOTE: this port change ships together with the kp-k8s-dev manifests
# (containerPort/probes → 8080) — see deploy/kp-k8s-dev/README.md.
ENV NODE_ENV=production \
    PORT=8080

USER node

EXPOSE 8080

# Healthcheck against the Express /api/health endpoint (exempt from the
# app's rate limiter, so this never burns the public request budget).
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget --quiet --spider http://localhost:8080/api/health || exit 1

LABEL org.opencontainers.image.title="cjoga.cloud portfolio" \
      org.opencontainers.image.description="Personal portfolio site — React frontend + Express server" \
      org.opencontainers.image.source="https://github.com/Camilool8/cjoga-portfolio" \
      org.opencontainers.image.licenses="MIT"

CMD ["node", "server/index.js"]
