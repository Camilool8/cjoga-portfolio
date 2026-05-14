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

# Built frontend + Express server.
COPY --from=builder /app/dist ./dist
COPY server ./server

ENV NODE_ENV=production \
    PORT=80

EXPOSE 80

# Healthcheck against the Express /api/health endpoint.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget --quiet --spider http://localhost:80/api/health || exit 1

LABEL org.opencontainers.image.title="cjoga.cloud portfolio" \
      org.opencontainers.image.description="Personal portfolio site — React frontend + Express server" \
      org.opencontainers.image.source="https://github.com/Camilool8/cjoga-portfolio" \
      org.opencontainers.image.licenses="MIT"

CMD ["node", "server/index.js"]
