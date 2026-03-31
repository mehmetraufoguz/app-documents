# Dependencies stage
FROM node:20-alpine AS deps

# Install git, build tools for native modules, and pnpm
RUN --mount=type=cache,target=/var/cache/apk \
    apk add --no-cache git python3 make g++ && npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json .npmrc* ./

# Install all dependencies with cache mount
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm install

# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Runtime stage
FROM node:20-alpine

# Install git (for simple-git) and wget (for health check)
RUN --mount=type=cache,target=/var/cache/apk \
    apk add --no-cache git wget

WORKDIR /app

# Copy package files and dependencies from deps stage
COPY --from=deps /app/package.json ./
COPY --from=deps /app/node_modules ./node_modules

# Copy built application from builder
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/public ./public
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./

# Create data directory for documents repo and set permissions
RUN mkdir -p ./data/docs-repo && chown -R node:node /app

# Use non-root user
USER node

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Run migrations then start the application
CMD ["sh", "-c", "node node_modules/drizzle-kit/bin.cjs migrate && node .output/server/index.mjs"]
