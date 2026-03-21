# Build stage
FROM node:20-alpine AS builder

# Install git and pnpm
RUN apk add --no-cache git && npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Runtime stage
FROM node:20-alpine

# Install git and pnpm
RUN apk add --no-cache git && npm install -g pnpm

WORKDIR /app

# Copy package files from builder
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including dev for drizzle-kit migrations)
RUN pnpm install --frozen-lockfile

# Copy built application from builder
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/public ./public
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./

# Create data directory for documents repo
RUN mkdir -p ./data/docs-repo

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Run migrations then start the application
CMD ["sh", "-c", "pnpm db:migrate && node .output/server/index.mjs"]
