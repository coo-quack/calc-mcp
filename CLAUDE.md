# Project Rules

## Overview

MCP (Model Context Protocol) server providing 21 tools for calculations and operations that LLMs struggle with. Published as `@coo-quack/calc-mcp` on npm.

## Tech Stack

- Runtime: Bun
- Language: TypeScript (strict mode)
- Linter/Formatter: Biome (tab indentation)
- Docs: VitePress (`docs/`)
- Dependencies: `@modelcontextprotocol/sdk`, `zod`, `mathjs`, `date-fns`

## Commands

- `bun test` — Run all tests
- `bun run build` — Build for production (minify + sourcemap + shebang)
- `bun run lint` — Biome check
- `bun run format` — Biome format
- `bun run dev` — Start dev server
- `bun run docs:dev` — VitePress dev server

## Project Structure

```
src/index.ts          # MCP server entry, tool registration
src/tools/*.ts        # 21 tool modules (one file per tool)
tests/tools/*.test.ts # Unit tests (one file per tool)
tests/e2e/            # E2E tests (Node.js test runner via MCP protocol)
docs/                 # VitePress documentation site
```

## Tool Architecture

Every tool follows the same pattern:

```typescript
import { z } from "zod";
import type { ToolDefinition } from "../index.js";

const schema = {
  param: z.string().describe("Description"),
};

const inputSchema = z.object(schema);
type Input = z.infer<typeof inputSchema>;

export function execute(input: Input): string {
  // Pure business logic, returns string (JSON or plain text)
}

export const tool: ToolDefinition = {
  name: "tool_name",        // snake_case
  description: "LLM-facing description",
  schema,                   // NOT inputSchema
  handler: async (args: Record<string, unknown>) => {
    const input = inputSchema.parse(args);
    return execute(input);
  },
};
```

Registration: import in `src/index.ts` → add to `tools` array.

## Adding a New Tool

1. Create `src/tools/<name>.ts` — export `execute()` and `tool`
2. Create `tests/tools/<name>.test.ts` — test `execute()` directly
3. Register in `src/index.ts` — import and add to `tools` array
4. Update docs: `README.md`, `docs/tools.md`, `docs/examples.md`

## Test Conventions

- Unit tests: import `execute()` directly, use `describe()` / `test()`
- E2E tests: `tests/e2e/mcp-server.test.mjs` — Node.js test runner, calls via MCP protocol
- Error cases: `expect(() => execute(...)).toThrow(/message/)`
- JSON results: `JSON.parse(execute(...))` then assert fields

## Naming Conventions

- Tool names / file names: `snake_case` (e.g. `json_validate`, `cron_parse`)
- Schema properties: `camelCase`
- Imports: `import { tool as <camelCase>Tool } from "./tools/<name>.js"`

## Code Style

- Indentation: tabs (enforced by Biome)
- Follow Biome rules (`bun run lint`); all warnings are treated as errors in CI

## Git / GitHub Rules

- Commit style: [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `docs:`, `chore:`, `test:`
- Scoped commits: `feat(tool-name): description`

## CI/CD Workflows

| Workflow | Trigger | Purpose |
|---|---|---|
| `ci.yml` | push to main / PR to main | lint + unit test + e2e test |
| `release.yml` | push to main | npm publish (only if version is new) + git tag + GitHub Release + MCP Registry |
| `docs.yml` | push to main / manual | Build & deploy VitePress docs to GitHub Pages |

## Release Workflow

### Changelog Policy

- Do NOT update `CHANGELOG.md` in feature PRs
- Changelog entries are created only in the release PR
- The canonical changelog file is `CHANGELOG.md` (root); `docs/changelog.md` is a symlink to it for VitePress

### Release PR Process

1. **Branch**: Create `release/vX.Y.Z` from `main`
2. **Version bump**: Update `version` in `package.json`
3. **Changelog**: Update `CHANGELOG.md`
   - Add a new `## vX.Y.Z (YYYY-MM-DD)` section at the top (below the heading)
   - Categorize entries: Features, Bug Fixes, Improvements, Security, Tests, Documentation, etc.
   - Reference PR numbers (e.g. `(#34)`)
   - This content is automatically extracted and used as the GitHub Release notes by `release.yml`
4. **Documentation review**: Update if new features/changes require it:
   - `docs/tools.md` — tool parameters, descriptions
   - `docs/examples.md` — usage examples
   - `README.md` — tool table, examples
5. **Commit**: Single commit with message `chore: release vX.Y.Z`
6. **PR**: Title `chore: release vX.Y.Z`, target `main`
7. **After merge**: `release.yml` automatically handles npm publish, git tag, and GitHub Release
   - GitHub Release notes are extracted from the `## vX.Y.Z` section in `CHANGELOG.md`

### Release Notes Format

```markdown
## vX.Y.Z (YYYY-MM-DD)

### Features

- **tool-name** — Description of new feature (#PR)

### Bug Fixes

- **tool-name** — Description of fix (#PR)

### Improvements

- Description of improvement (#PR)

### Security

- Description of security fix (#PR)

### Tests

- Description of test additions (#PR)

### Documentation

- Description of doc changes (#PR)
```
