# syntax=docker/dockerfile:1.7

# ─── Builder ────────────────────────────────────────────────────────
FROM node:25-alpine AS builder
WORKDIR /app

# Install deps first for better layer caching.
COPY package.json package-lock.json ./
RUN npm ci

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

# nginx:alpine already sets CMD ["nginx", "-g", "daemon off;"] — keep it.
