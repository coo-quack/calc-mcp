# Project Rules

## Git / GitHub Rules

- Do NOT add `Co-Authored-By` or any co-author trailer to commit messages.
- Do NOT add credit lines like "Generated with Claude Code" or similar AI attribution in PR descriptions, commit messages, or any files.
- Commit messages must be authored solely under the user's name.

## Release Workflow

### Changelog Policy

- Do NOT update `docs/changelog.md` in feature PRs.
- Changelog entries are created only in the release PR.

### Release PR Process

When creating a release, follow this process (reference: v1.7.2 / PR #31):

1. **Branch**: Create `release/vX.Y.Z` from `main`
2. **Version bump**: Update `version` in `package.json`
3. **Changelog**: Update `docs/changelog.md`
   - Move items from `## Unreleased` into a new `## vX.Y.Z (YYYY-MM-DD)` section
   - Categorize changes: Features, Bug Fixes, Improvements, Security, Tests, etc.
   - Reference PR numbers (e.g. `(#34)`)
4. **Documentation review**: Check and update if new features/changes require it:
   - `docs/tools.md` — tool parameters, descriptions
   - `docs/examples.md` — usage examples
   - `README.md` — tool table, examples
5. **Commit**: Single commit with message `chore: release vX.Y.Z`
6. **PR**: Title `chore: release vX.Y.Z`, target `main`
7. **After merge**: `publish.yml` automatically handles:
   - npm publish (`@coo-quack/calc-mcp`)
   - Git tag creation (`vX.Y.Z`)
   - GitHub Release creation with notes from changelog

## Tech Stack

- Runtime: Bun
- Linter/Formatter: Biome
- Test: `bun test`
- Build: `bun run build`
- Lint: `bun run lint`
