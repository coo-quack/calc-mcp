# Installation

Calc MCP works with any MCP-compatible client. Below are setup guides for popular AI assistants.

## Claude Code

The fastest way to add Calc MCP to Claude Code:

```bash
claude mcp add -s user calc-mcp -- npx --prefix /tmp -y @coo-quack/calc-mcp
```

This adds the server to your user config (`~/.config/openclaw/config.yml`).

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
      "args": ["--prefix", "/tmp", "-y", "@coo-quack/calc-mcp"]
    }
  }
}
```

After editing, restart Claude Desktop. You should see "MCP" in the bottom-right corner with the 21 tools available.

## Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "calc-mcp": {
      "command": "npx",
      "args": ["--prefix", "/tmp", "-y", "@coo-quack/calc-mcp"]
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
      "args": ["--prefix", "/tmp", "-y", "@coo-quack/calc-mcp"]
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
      "args": ["--prefix", "/tmp", "-y", "@coo-quack/calc-mcp"]
    }
  }
}
```

Reload VS Code after creating the file.

## Direct Usage

You can also run the server directly for testing:

```bash
npx --prefix /tmp -y @coo-quack/calc-mcp
```

Or install globally:

```bash
npm install -g @coo-quack/calc-mcp
calc-mcp
```

## Troubleshooting

### "npx: command not found"

Make sure Node.js (v18+) is installed:

```bash
node --version
npm --version
```

Install from [nodejs.org](https://nodejs.org/) if needed.

### Tools not showing up

1. **Restart the app** after editing the config file
2. **Check the config path** — make sure you edited the right file
3. **Validate JSON** — use a JSON validator to check for syntax errors
4. **Check logs** — Claude Desktop and other apps may have logs showing connection errors

### "calc-mcp: command not found" inside a Node.js project

If you run `npx` inside a directory that contains `node_modules`, npx may fail with:

```
sh: calc-mcp: command not found
```

This happens because npx resolves the scoped package locally but fails to link the binary correctly. All the examples on this page already include the fix (`--prefix /tmp`), which forces npx to use a separate directory for package resolution:

```bash
npx --prefix /tmp -y @coo-quack/calc-mcp
```

### Version info

To check the installed version:

```bash
npx --prefix /tmp @coo-quack/calc-mcp --version
```

## Next Steps

- [View all tools →](/tools)
- [See examples →](/examples)
- [Read the changelog →](/changelog)
