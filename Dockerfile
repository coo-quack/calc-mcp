# Calc MCP Dockerfile
#
# Both base images are pinned by digest and pulled from somewhere other than
# Docker Hub, which rate limits unauthenticated pulls per IP — and GitHub's
# runners share those. The digests are the multi-arch indexes, since the
# release builds linux/amd64 and linux/arm64.
#
# bun is not a Docker Official Image, so AWS does not mirror it and there is no
# `ghcr.io/oven-sh/bun`. Google's mirror is a pull-through cache rather than an
# independent copy: a cache hit never touches Docker Hub, a miss still does.
# Partial, but better than pulling from Docker Hub every time. Same image
# either way — verified that this digest resolves identically on both.
FROM mirror.gcr.io/oven/bun:1@sha256:e10577f0db68676a7024391c6e5cb4b879ebd17188ab750cf10024a6d700e5c4 AS builder

WORKDIR /app

# Copy package files
COPY package*.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN bun run build

# Production image.
#
# node *is* a Docker Official Image, so this comes from AWS's mirror of those —
# an independent copy, not a cache of Docker Hub. Verified that the digest
# resolves identically on `docker.io`, `public.ecr.aws` and `mirror.gcr.io`.
FROM public.ecr.aws/docker/library/node:24-alpine@sha256:a0b9bf06e4e6193cf7a0f58816cc935ff8c2a908f81e6f1a95432d679c54fbfd

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
