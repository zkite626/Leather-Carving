# ============================================================
# 艺育皮韵 - Backend Dockerfile (NestJS)
# Build context: project root (not backend/)
# ============================================================

# --- Stage 1: Install dependencies ---
FROM node:20-alpine AS deps

# Install OpenSSL for Prisma engine compatibility on Alpine
RUN apk add --no-cache openssl

WORKDIR /app/backend

# Copy package files first for optimal layer caching
COPY backend/package.json backend/package-lock.json* ./
COPY backend/prisma ./prisma
COPY backend/scripts ./scripts

# Install all dependencies (including devDeps for build)
RUN npm ci

# --- Stage 2: Build ---
FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app/backend

# Copy dependencies from previous stage
COPY --from=deps /app/backend/node_modules ./node_modules

# Copy shared types
COPY shared/ ../shared/

# Copy backend source
COPY backend/ .

# Sync shared types into backend/src/shared
RUN mkdir -p src/shared/types src/shared/validators src/shared/utils \
    && cp -r ../shared/types/* src/shared/types/ \
    && cp -r ../shared/validators/* src/shared/validators/ \
    && cp -r ../shared/utils/* src/shared/utils/

# Generate Prisma client (requires prisma schema + node_modules)
RUN npx prisma generate

# Build NestJS (produces dist/)
RUN npm run build

# Prune devDependencies after build
RUN npm prune --production

# --- Stage 3: Production runner ---
FROM node:20-alpine AS runner

RUN apk add --no-cache openssl

WORKDIR /app/backend

ENV NODE_ENV=production
ENV PORT=3001

# Create non-root user
RUN addgroup --system --gid 1001 nestjs \
    && adduser --system --uid 1001 nestjs

# Copy built application and pruned node_modules
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package.json ./

# Copy Prisma schema (required at runtime for migrations / introspection)
COPY --from=builder /app/backend/prisma ./prisma

# Ensure correct ownership
RUN chown -R nestjs:nestjs /app/backend

USER nestjs

EXPOSE 3001

# Start NestJS production server
CMD ["node", "dist/main.js"]
