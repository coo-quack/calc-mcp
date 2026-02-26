# Changelog

All notable changes to Calc MCP are documented here.

## v1.9.0 (2026-02-27)

### Features

- Add Docker image support with multi-stage builds (#67)
- Publish Docker images to GitHub Container Registry (ghcr.io)
- Add automated Docker build & test workflow

### Security

- Run Docker container as non-root user (`node`)

### Improvements

- Add `.dockerignore` for optimized Docker builds
- Add GitHub Actions cache for Docker builds

## v1.8.6 (2026-02-24)

### Documentation

- Switch README image hosting to imgur for better reliability (#64)

## v1.8.5 (2026-02-23)

### Improvements

- Rename `publish.yml` to `release.yml` to align with sensitive-canary workflow naming (#60)
- Add dual version check (git tag + npm) for more robust release gating (#60)
- Add `ci` script to package.json for unified CI execution (#60)
- Add backport workflow to auto-sync main to develop (#56)

## v1.8.4 (2026-02-20)

### Documentation

- Add `mcpName` to `package.json` for MCP Registry listing (`io.github.coo-quack/calc-mcp`)

## v1.8.3 (2026-02-20)

### Documentation

- Use generic MCP client examples in `SECURITY.md` and `README.md` — replaced tool-specific CLI invocations with client-agnostic `Tool: / Input:` format (#50)
- Clarify security model: calc-mcp itself is local-only; inputs are sent to the LLM provider (Anthropic, OpenAI, etc.) when used via a cloud LLM (#50)
- Remove misleading guidance suggesting environment variables prevent LLM provider exposure (#50)
- Fix factually inaccurate claims: "Zero config", "Works offline", "no external dependencies" (#50)
- Replace subjective/unverifiable phrasing ("incredible", "terrible", "automatically picks the right tool") with factual descriptions (#50)
- Remove outdated test count from documentation (#50)
- Fix UI-specific description in install guide ("bottom-right corner") with version-independent wording (#50)

## v1.8.2 (2026-02-19)

### Documentation

- Add missing changelog entry for v1.8.1 (#48)
- Update `CLAUDE.md` to document release note format, correct `CHANGELOG.md` location, and reflect current `noUncheckedIndexedAccess` coding conventions (#48)

## v1.8.1 (2026-02-19)

### Security

- Add `SECURITY.md` with vulnerability reporting policy, sensitive data handling guidelines, and LLM integration considerations (#46)
- Add error sanitization to prevent accidental leakage of sensitive input values (tokens, keys, passwords) in error messages for `jwt_decode`, `hash`, `base64`, and `encode` tools (#46)

### Improvements

- **color** — Replace non-null assertions with type-safe alternatives (`objGet`, `Array.from`, destructuring) (#46)
- **diff** — Rewrite LCS and Levenshtein DP tables as flat 1D arrays for better cache efficiency and type safety (#46)
- **ip** — Fix double-parsing of IPv4 address in `ipInfo()` (#46)
- **jwt_decode** — Use destructuring with defaults to safely access JWT parts without type assertions (#46)
- **cron_parse** — Use local variable narrowing to eliminate redundant nullish coalescing (#46)
- **random** — Restore idiomatic Fisher-Yates destructuring swap (#46)

### Tests

- Add `tests/sanitization.test.ts` covering `sanitizeErrorMessage` for all sensitive tools (#46)
- Add `tests/security.test.ts` verifying that sensitive input values are not leaked in error messages (#46)

## v1.8.0 (2026-02-14)

### Features

- **math** — Add sandbox to block dangerous functions (e.g. `import`, `eval`, `require`) (#32)
- **regex** — Strengthen ReDoS protection with enhanced pattern analysis (#33)
- **hash** — Add HMAC support (`action: "hmac"` with `key` parameter) and weak algorithm warnings for MD5/SHA-1 (#34)
- **semver** — Support OR (`||`), AND (space-separated), and hyphen range patterns (#35)
- **color** — Support 8-digit HEX with alpha channel (e.g. `#FF573380`) and `rgba()`/`hsla()` formats (#36)
- **cron_parse** — Support weekday names (`MON`, `MON-FRI`) and month names (`JAN`, `JAN-MAR`) with ranges (#38)
- **json_validate** — Use `yaml` package for proper YAML validation (#39)

### Improvements

- Enable minification and source maps for production builds (#40)
- TypeScript strict mode (`noUncheckedIndexedAccess`) with full type safety (#41)
- Exclude unused mathjs functions and dev files from npm package for reduced bundle size (#41)
- Exclude source maps from npm package (#41)

### Documentation

- Add CLAUDE.md with project rules and release workflow (#42)
- Update tool reference, examples, and README for v1.8.0 features (#37)

### Tests

- E2E: expanded to cover HMAC, alpha colors, semver OR/AND/hyphen ranges, cron weekday/month names
- Unit: additional tests for strict mode type assertions

## v1.7.2 (2026-02-13)

### Bug Fixes

- **cron_parse** — Now respects the `timezone` parameter (was previously ignored; all calculations used local time)
- **count** — Improve Shift_JIS byte calculation accuracy (handle ¥, ‾, and supplementary plane characters correctly)

## v1.7.1 (2026-02-12)

### Bug Fixes

- **regex** — Auto-add `g` flag for `matchAll` action, consistent with `match` and `replace` (#25)

## v1.7.0 (2026-02-12)

### Features

- **math** — BigNumber mode (64-digit precision) eliminates floating-point drift (`0.1 + 0.2 = 0.3`, `mean([0.1,0.2,0.3]) = 0.2`)
- **url_parse** — Auto-add `https://` for URLs without protocol
- **color** — Support CSS named colors (red, blue, green, etc.)
- **regex** — Global match/replace (auto-add `g` flag) for all occurrences
- **cron_parse** — Support `@daily`, `@hourly`, `@weekly`, `@monthly`, `@yearly` aliases
- **semver** — Add `parse` action to extract version components

### Tests

- E2E: 137 tests covering all 21 tools' every action/option
- Unit: 222 tests across all tools
- Total: 359 tests passing

## v1.6.2 (2026-02-12)

### Fixes

- **ci** — Publish workflow now skips tag/release creation if already exists (idempotent) (#20)
- **npm** — Trim package size by excluding docs, images from npm tarball (#20)

## v1.6.1 (2026-02-12)

### Bug Fixes

- **hash** — Replace `Bun.CryptoHasher` with `node:crypto` for Node.js compatibility (#18)

## v1.6.0 (2026-02-12)

### Features

- **Documentation site** — Full VitePress-powered docs at [coo-quack.github.io/calc-mcp](https://coo-quack.github.io/calc-mcp/) with tool reference, examples, install guides, and changelog (#13)

### Documentation

- Added documentation site link to README
- Added release checklist to CONTRIBUTING.md (#15)
- Updated npx examples with `--prefix /tmp` for better node_modules compatibility
- Added common ignore patterns to .gitignore

## v1.5.0 (2026-02-11)

### Features

- **Password generation** — Fine-grained options: `uppercase`, `numbers`, `symbols` (on/off), `readable` mode (excludes ambiguous chars like l/1/I/O/0/o), `excludeChars` for custom exclusions
- **Shuffle** — Fisher-Yates algorithm with `crypto.getRandomValues` for unbiased list shuffling

### Documentation

- README title: `@coo-quack/calc-mcp` → `Calc MCP`
- Added "Why?" section with AI-alone vs calc-mcp comparison
- Quick Start moved to top
- Install guides consolidated (Claude Desktop/Cursor/Windsurf share same JSON format)

### Tests

- Random tool tests: 12 → 27 (+15)
- Total: 194 tests, 280 assertions

## v1.4.0 (2026-02-11)

### Features

- **Time conversion** — ms, s, min, h, d, wk, mo, yr (now 8 categories, 72 units)
- **`--version` flag** — `npx @coo-quack/calc-mcp --version`

### Improvements

- serverInfo.version synced with package.json (was hardcoded "0.1.0")
- Error messages now list all supported units on unknown unit
- Semver test coverage: 9 → 23 tests
- CI git config for tag authoring
- README badges (npm, CI, license)
- CONTRIBUTING.md added
- GitHub topics set
- README examples: Japanese text replaced with English alternatives

## v1.3.0 (2026-02-11)

### Documentation

- Overhaul README with natural language examples (22 verified examples)
- Add install guides for Claude Code, Claude Desktop, VS Code, Cursor, Windsurf
- Add unit conversion coverage details (7 categories, 58 units)
- Add encode/decode examples (Base64, URL, HTML)

## v1.1.0 (2026-02-11)

### Features

- **random**: Add UUID v7 support (`uuidVersion: "v7"`) — Time-ordered UUIDs, ideal for database primary keys

## v1.0.0 (2026-02-11)

### Features

Initial release with **21 MCP tools** for calculations and operations AI models struggle with:

- **random** — UUID (v4), ULID, secure password, random number
- **hash** — SHA-1, SHA-256, SHA-512, MD5
- **base64** — Encode/decode Base64
- **encode** — URL encode/decode, HTML entity encode/decode
- **datetime** — Current time, convert, format, Unix timestamp
- **count** — Character, word, line, byte counting (grapheme-aware)
- **math** — Precise math evaluation via mathjs
- **date** — Date arithmetic (add/subtract/diff)
- **regex** — Test, match, replace with regex
- **base** — Number base conversion (bin/oct/dec/hex/custom)
- **diff** — Text diff between two strings
- **json_validate** — JSON schema validation
- **cron_parse** — Cron expression to human-readable description
- **luhn** — Luhn algorithm validation (credit cards, etc.)
- **ip** — IPv4/IPv6 parsing, CIDR subnet info
- **color** — Color format conversion (hex/rgb/hsl/hwb)
- **convert** — Unit conversion (length, weight, temp, data, time)
- **char_info** — Unicode character info (codepoint, name, category)
- **jwt_decode** — Decode JWT tokens (header + payload)
- **url_parse** — URL parsing into components
- **semver** — Semantic versioning operations (compare, satisfy, sort)

### CI/CD

- GitHub Actions: test + lint on push/PR
- Publish workflow: test + lint gate before npm publish on tag

### Infrastructure

- Biome for linting and formatting
- Renovate with OSV vulnerability alerts
- 160 tests, 92%+ line coverage

---

For the latest changes, see [GitHub Releases](https://github.com/coo-quack/calc-mcp/releases).
