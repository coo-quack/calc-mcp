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

## "calc-mcp: command not found" inside a Node.js project

If you run `npx` inside a directory that contains `node_modules`, npx may fail with:

```
sh: calc-mcp: command not found
```

This happens because npx resolves the scoped package locally but fails to link the binary correctly. All the examples on this page already include the fix (`--prefix /tmp`), which forces npx to use a separate directory for package resolution:

```bash
npx --prefix /tmp -y @coo-quack/calc-mcp@latest
```

## Version info

To check the installed version:

```bash
npx --prefix /tmp @coo-quack/calc-mcp@latest --version
```

## Still stuck?

[Open an issue](https://github.com/coo-quack/calc-mcp/issues) on GitHub.
