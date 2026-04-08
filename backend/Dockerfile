# ── Stage 1: Build ────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files dulu (layer caching)
COPY package*.json ./
COPY prisma ./prisma/

# Install semua dependencies (termasuk devDependencies untuk build)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Compile TypeScript ke JavaScript
RUN npm run build

# ── Stage 2: Production ───────────────────────────
FROM node:20-alpine AS production

# Keamanan: jalankan sebagai non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install HANYA production dependencies
RUN npm ci --only=production

# Generate Prisma client di production stage
RUN npx prisma generate

# Copy hasil build dari stage 1
COPY --from=builder /app/dist ./dist

# Copy RSA keys (akan di-mount via Docker secret di production)
# Untuk development/CI, copy langsung
COPY --chown=nodeuser:nodejs keys ./keys

# Ganti ke non-root user
USER nodeuser

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/src/app.js"]