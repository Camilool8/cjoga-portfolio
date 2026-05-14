# syntax=docker/dockerfile:1.7

# ─── Builder ────────────────────────────────────────────────────────
FROM node:25-alpine AS builder
WORKDIR /app

# Install deps first for layer caching; cache mount keeps repeat
# builds off the network.
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit --no-fund

# Bring in the rest of the source and build the static site.
COPY . .
RUN npm run build

# ─── Runtime ────────────────────────────────────────────────────────
FROM nginx:alpine AS runtime

# Replace the default nginx config with ours (gzip, caching, healthz).
COPY nginx.conf /etc/nginx/nginx.conf

# Static site output from the builder stage.
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

# Healthcheck hits the /healthz route configured in nginx.conf.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --quiet --spider http://localhost:80/healthz || exit 1

LABEL org.opencontainers.image.title="blog.cjoga.cloud handbook" \
      org.opencontainers.image.description="Docusaurus-built technical handbook served via nginx" \
      org.opencontainers.image.source="https://github.com/Camilool8/cjoga-portfolio" \
      org.opencontainers.image.licenses="MIT"

# nginx:alpine already sets CMD ["nginx", "-g", "daemon off;"] — keep it.
