# Calc MCP Dockerfile
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files
COPY package*.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN bun run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Default environment
ENV NODE_ENV=production

# Run the MCP server
CMD ["node", "dist/index.js"]
