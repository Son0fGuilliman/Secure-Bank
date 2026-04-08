# ── Stage 1: Build React ──────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build untuk production (Vite akan minify dan bundle)
RUN npm run build

# ── Stage 2: Serve dengan Nginx ───────────────────
FROM nginx:alpine AS production

# Hapus config nginx default
RUN rm /etc/nginx/conf.d/default.conf

# Copy config nginx kita
COPY --from=builder /app/dist /usr/share/nginx/html

# Config nginx untuk React SPA (handle client-side routing)
RUN cat > /etc/nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # Handle React client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|svg|ico|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s \
  CMD wget -qO- http://localhost:80 || exit 1