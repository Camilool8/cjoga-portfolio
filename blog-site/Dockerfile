# syntax=docker/dockerfile:1.7

# ─── Builder ────────────────────────────────────────────────────────
FROM node:25-alpine AS builder
WORKDIR /app

# rehype-mermaid renders diagrams to static SVG at build time and needs a
# real browser. Use the distro chromium instead of a playwright download —
# the SKIP env must be set BEFORE `npm ci` (the playwright package downloads
# browsers in its postinstall), and the executable path is wired through
# rehype-mermaid's launchOptions in docusaurus.config.js (unset locally, so
# dev machines keep using the playwright cache).
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser
RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont

# Install deps first for layer caching; cache mount keeps repeat
# builds off the network.
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit --no-fund

# Bring in the rest of the source and build the static site.
COPY . .
RUN npm run build

# ─── Runtime ────────────────────────────────────────────────────────
# nginx-unprivileged runs as uid 101 (nginx) and listens on 8080 —
# no root process in the container at all.
# NOTE: the 8080 port change ships together with the kp-k8s-dev manifests
# (containerPort/probes → 8080) — see deploy/kp-k8s-dev/README.md.
FROM nginxinc/nginx-unprivileged:1-alpine AS runtime

# Replace the default nginx config with ours (gzip, caching, security
# headers, healthz). Config keeps pid/temp paths under /tmp so the
# container also works with readOnlyRootFilesystem.
COPY nginx.conf /etc/nginx/nginx.conf

# Static site output from the builder stage.
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 8080

# Healthcheck hits the /healthz route configured in nginx.conf.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --quiet --spider http://localhost:8080/healthz || exit 1

LABEL org.opencontainers.image.title="blog.cjoga.cloud handbook" \
      org.opencontainers.image.description="Docusaurus-built technical handbook served via nginx" \
      org.opencontainers.image.source="https://github.com/Camilool8/cjoga-portfolio" \
      org.opencontainers.image.licenses="MIT"

# nginx-unprivileged already sets CMD ["nginx", "-g", "daemon off;"] — keep it.
