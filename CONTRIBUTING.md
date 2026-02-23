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

## Branching Strategy

```
main
 ├── develop          ← integration branch
 │    └── feature/*  ← new features and non-urgent fixes
 └── hotfix/*        ← urgent production fixes
```

### Normal development

```
feature/your-feature  →  develop  →  main (release)
```

1. Branch from `develop`: `git checkout -b feature/your-feature develop`
2. Open a PR targeting `develop`
3. After review and approval, merge into `develop`
4. When ready to release, open a PR from `develop` → `main`

### Hotfix

For urgent fixes that must go directly to production:

1. Branch from `main`: `git checkout -b hotfix/fix-description main`
2. Apply the fix and open a PR targeting `main`
3. After review and approval, merge into `main`
4. A backport PR to `develop` is created automatically by CI

If the backport PR has conflicts, resolve them manually before merging.

## Adding a New Tool

1. Create `src/tools/your_tool.ts` — export `execute()` and `tool`
2. Create `tests/tools/your_tool.test.ts` — cover all branches
3. Register in `src/index.ts` — import and add to the `tools` array
4. Update `README.md` — add to examples and tool table

## Release Checklist

When bumping a version, open a PR from `develop` → `main` with:

1. Update `version` in `package.json`
2. Update `CHANGELOG.md` with a new `## vX.Y.Z (YYYY-MM-DD)` section
   - `docs/changelog.md` is a symlink to `CHANGELOG.md` — do not edit it separately
   - This content is automatically used as the GitHub Release notes by `release.yml`
3. Review `docs/tools.md` — add/update any changed tool parameters or examples
4. Review `docs/examples.md` — add examples for new features
5. Review `README.md` — update tool table and examples if needed

After merging into `main`, `release.yml` automatically:
- Publishes to npm with provenance
- Creates a git tag `vX.Y.Z`
- Creates a GitHub Release with notes extracted from `CHANGELOG.md`
- Publishes to MCP Registry

The documentation site is also redeployed automatically on merge to `main`.

## Pull Requests

- Feature PRs target `develop`, release/hotfix PRs target `main`
- Follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, etc.)
- All tests must pass (`bun test`)
- Lint must pass (`bun run lint`)
- One approval required to merge

## Code Style

Enforced by [Biome](https://biomejs.dev/). Run `bun run format` before committing.
