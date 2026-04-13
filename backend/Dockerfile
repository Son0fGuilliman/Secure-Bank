# ── Stage 1: Build ────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

# ── Stage 2: Production ───────────────────────────
FROM node:20-alpine AS production

# Install OpenSSL untuk Prisma dan keygen
RUN apk add --no-cache openssl

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

# Generate RSA keys saat build
# Di production nyata, gunakan Docker Secrets atau vault
RUN mkdir -p keys && \
    openssl genrsa -out keys/private.key 2048 && \
    openssl rsa -in keys/private.key -pubout -out keys/public.key && \
    chown -R nodeuser:nodejs keys/

USER nodeuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

COPY --chown=nodeuser:nodejs start.sh ./start.sh
RUN chmod +x start.sh
CMD ["./start.sh"]