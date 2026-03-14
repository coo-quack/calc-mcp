# Installation

Calc MCP works with any MCP-compatible client. Below are setup guides for popular AI assistants.

## Claude Code

The fastest way to add Calc MCP to Claude Code:

```bash
claude mcp add -s user calc-mcp -- npx --prefix /tmp -y @coo-quack/calc-mcp@latest
```

This adds the server to your user-level MCP configuration.

To verify it's working:

```bash
claude mcp list
```

You should see `calc-mcp` in the list.

## Claude Desktop

Add to your Claude Desktop config file:

**macOS:**
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```bash
%APPDATA%\Claude\claude_desktop_config.json
```

**Config:**
```json
{
  "mcpServers": {
    "calc-mcp": {
      "command": "npx",
      "args": ["--prefix", "/tmp", "-y", "@coo-quack/calc-mcp@latest"]
    }
  }
}
```

After editing, restart Claude Desktop. The 21 calc-mcp tools will be available.

## Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "calc-mcp": {
      "command": "npx",
      "args": ["--prefix", "/tmp", "-y", "@coo-quack/calc-mcp@latest"]
    }
  }
}
```

Restart Cursor after adding the config.

## Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "calc-mcp": {
      "command": "npx",
      "args": ["--prefix", "/tmp", "-y", "@coo-quack/calc-mcp@latest"]
    }
  }
}
```

Restart Windsurf after adding the config.

## VS Code (GitHub Copilot)

For workspace-specific setup, add `.vscode/mcp.json` in your project:

```json
{
  "servers": {
    "calc-mcp": {
      "command": "npx",
      "args": ["--prefix", "/tmp", "-y", "@coo-quack/calc-mcp@latest"]
    }
  }
}
```

Reload VS Code after creating the file.

## Docker Image

Calc MCP is also available as a Docker image from GitHub Container Registry:

```bash
docker run --rm -i ghcr.io/coo-quack/calc-mcp:latest
```

For MCP clients, use:

```json
{
  "mcpServers": {
    "calc-mcp": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "ghcr.io/coo-quack/calc-mcp:latest"]
    }
  }
}
```

Available tags:
- `ghcr.io/coo-quack/calc-mcp:latest` — Latest release
- `ghcr.io/coo-quack/calc-mcp:X.Y.Z` — Specific version (replace X.Y.Z with the desired version)

## Other MCP Clients

Calc MCP works with any MCP-compatible client that supports stdio transport. To integrate with a client not listed above, configure it to run:

```bash
npx --prefix /tmp -y @coo-quack/calc-mcp@latest
```

The server communicates over **stdio** using the standard [Model Context Protocol](https://modelcontextprotocol.io/). Most clients accept a `command` + `args` configuration similar to the examples above.

## Direct Usage

You can also run the server directly for testing:

```bash
npx --prefix /tmp -y @coo-quack/calc-mcp@latest
```

Or install globally:

```bash
npm install -g @coo-quack/calc-mcp@latest
calc-mcp
```

## Next Steps

- [Getting Started](/getting-started) — your first tool call
- [All Tools](/tools) — complete tool reference
- [Troubleshooting](/troubleshooting) — common issues and solutions
