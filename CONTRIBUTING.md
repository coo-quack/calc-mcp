# Contributing

Thanks for your interest in contributing to calc-mcp!

## Development Setup

```bash
git clone https://github.com/coo-quack/calc-mcp.git
cd calc-mcp
bun install
```

## Commands

```bash
bun run dev       # Start dev server
bun test          # Run tests
bun run lint      # Check with Biome
bun run format    # Format with Biome
bun run build     # Build for production
```

## Adding a New Tool

1. Create `src/tools/your_tool.ts` — export `execute()` and `tool`
2. Create `tests/tools/your_tool.test.ts` — cover all branches
3. Register in `src/index.ts` — import and add to the `tools` array
4. Update `README.md` — add to examples and tool table

## Pull Requests

- Branch from `main`
- Follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, etc.)
- All tests must pass (`bun test`)
- Lint must pass (`bun run lint`)
- One approval required to merge

## Code Style

Enforced by [Biome](https://biomejs.dev/). Run `bun run format` before committing.
