# Troubleshooting

## "npx: command not found"

Make sure Node.js (v18+) is installed:

```bash
node --version
npm --version
```

Install from [nodejs.org](https://nodejs.org/) if needed.

## Tools not showing up

1. **Restart the app** after editing the config file
2. **Check the config path** — make sure you edited the right file
3. **Validate JSON** — use a JSON validator to check for syntax errors
4. **Check logs** — Claude Desktop and other apps may have logs showing connection errors

## "calc-mcp: command not found"

If you run `npx` from a clone of the calc-mcp repository itself, npx may fail with:

```
sh: calc-mcp: command not found
```

npx resolves the local project before the registry. The repository's own `package.json` points the `calc-mcp` binary at `dist/index.js`, which does not exist until the project is built. Either build it first:

```bash
bun run build
```

Or run the command from any directory outside the repository:

```bash
npx -y @coo-quack/calc-mcp@2.1.0
```

Anywhere else this is not an issue. Projects that contain `node_modules`, and projects that depend on `@coo-quack/calc-mcp`, both run the published binary correctly.

## Version info

To check the latest published version:

```bash
npm view @coo-quack/calc-mcp version
```

## Still stuck?

[Open an issue](https://github.com/coo-quack/calc-mcp/issues) on GitHub.
