# ==============================================================================
# Multi-Stage Production Dockerfile for Manospring Healthcare Platform
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Frontend and Server
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy source code and configuration files
COPY tsconfig.json tsconfig.node.json tsconfig.server.json vite.config.ts tailwind.config.js postcss.config.js index.html ./
COPY src/ ./src/
COPY server/ ./server/
COPY public/ ./public/

# Compile React client (dist/client) and TypeScript server (dist/server)
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Production Runtime
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy manifests and install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Use non-root node user for container security
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "dist/server/server.js"]
