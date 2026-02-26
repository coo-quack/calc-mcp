# Calc MCP Dockerfile
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files
COPY package*.json bun.lock* ./

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

# Ensure application files are owned by the non-root user
RUN chown -R node:node /app

# Default environment
ENV NODE_ENV=production

# Run the MCP server as a non-root user
USER node
CMD ["node", "dist/index.js"]
