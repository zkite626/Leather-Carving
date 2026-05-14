# ============================================================
# 艺育皮韵 - Frontend Dockerfile (Next.js standalone)
# Build context: project root (not frontend/)
# ============================================================

# --- Stage 1: Install dependencies ---
FROM node:20-alpine AS deps

WORKDIR /app/frontend

# Copy only package files first for optimal layer caching
COPY frontend/package.json frontend/package-lock.json* ./

# Install all dependencies (including devDeps needed for build)
RUN npm ci

# --- Stage 2: Build ---
FROM node:20-alpine AS builder

WORKDIR /app/frontend

# Copy dependencies from previous stage
COPY --from=deps /app/frontend/node_modules ./node_modules

# Copy shared types (synced before build)
COPY shared/ ../shared/

# Copy frontend source
COPY frontend/ .

# Ensure shared types are synced to frontend/src/shared
RUN mkdir -p src/shared/types src/shared/validators src/shared/utils \
    && cp -r ../shared/types/* src/shared/types/ \
    && cp -r ../shared/validators/* src/shared/validators/ \
    && cp -r ../shared/utils/* src/shared/utils/

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application (output: 'standalone' in next.config.ts)
RUN npm run build

# --- Stage 3: Production runner ---
FROM node:20-alpine AS runner

WORKDIR /app/frontend

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/frontend/.next/standalone ./
# Copy static assets (CSS, JS chunks, images)
COPY --from=builder /app/frontend/.next/static ./.next/static
# Copy public assets (favicon, SVGs, etc.)
COPY --from=builder /app/frontend/public ./public

# Ensure correct ownership
RUN chown -R nextjs:nodejs /app/frontend

USER nextjs

EXPOSE 3000

# Start the standalone server
CMD ["node", "server.js"]
