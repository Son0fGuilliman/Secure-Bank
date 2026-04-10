# ── Stage 1: Build React ──────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: Serve dengan Nginx ───────────────────
FROM nginx:alpine AS production

# Install curl untuk healthcheck
RUN apk add --no-cache curl

# Hapus config nginx default
RUN rm /etc/nginx/conf.d/default.conf

# Copy hasil build React
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config dari file terpisah
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD curl -f http://localhost:80 || exit 1