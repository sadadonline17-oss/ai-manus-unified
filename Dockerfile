# ============================================================================
# AI Manus Unified - Multi-stage Dockerfile
# Production-ready container for the AI Agent Enterprise Platform
# ============================================================================

# Stage 1: Base image with Node.js
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    build-base \
    git \
    curl \
    bash

WORKDIR /app

# ============================================================================
# Stage 2: Dependencies
# ============================================================================
FROM base AS deps

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --include=dev

# ============================================================================
# Stage 3: Builder
# ============================================================================
FROM base AS builder

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build TypeScript
RUN npm run build

# ============================================================================
# Stage 4: Production
# ============================================================================
FROM node:20-alpine AS production

# Install runtime dependencies only
RUN apk add --no-cache \
    curl \
    bash \
    tini

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S manus -u 1001 -G nodejs

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Copy environment example (should be overridden at runtime)
COPY .env.example ./.env.example

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Switch to non-root user
USER manus

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Use tini as init system
ENTRYPOINT ["/sbin/tini", "--"]

# Start the application
CMD ["node", "dist/index.js"]

# ============================================================================
# Stage 5: Development
# ============================================================================
FROM base AS development

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies including dev
RUN npm install

# Copy source code
COPY . .

# Set environment variables
ENV NODE_ENV=development
ENV PORT=3000
ENV HOST=0.0.0.0

# Expose port
EXPOSE 3000

# Start in development mode with hot reload
CMD ["npm", "run", "dev"]