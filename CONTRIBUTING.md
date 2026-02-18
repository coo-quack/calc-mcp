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

## Release Checklist

When bumping a version, create a `release/vX.Y.Z` branch and open a PR with:

1. Update `version` in `package.json`
2. Update `CHANGELOG.md` with a new `## vX.Y.Z (YYYY-MM-DD)` section
   - `docs/changelog.md` is a symlink to `CHANGELOG.md` — do not edit it separately
   - This content is automatically used as the GitHub Release notes by `publish.yml`
3. Review `docs/tools.md` — add/update any changed tool parameters or examples
4. Review `docs/examples.md` — add examples for new features
5. Review `README.md` — update tool table and examples if needed

After merging, `publish.yml` automatically publishes to npm, creates a git tag, and creates a GitHub Release with the notes extracted from `CHANGELOG.md`.

## Pull Requests

- Branch from `main`
- Follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, etc.)
- All tests must pass (`bun test`)
- Lint must pass (`bun run lint`)
- One approval required to merge

## Code Style

Enforced by [Biome](https://biomejs.dev/). Run `bun run format` before committing.
