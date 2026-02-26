# Calc MCP Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install the package directly from npm
RUN npm install -g @coo-quack/calc-mcp@latest

# Default environment
ENV NODE_ENV=production

# Run the MCP server via npx
CMD ["npx", "@coo-quack/calc-mcp@latest"]
