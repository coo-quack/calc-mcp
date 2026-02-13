# Changelog

All notable changes to Calc MCP are documented here.

## v1.8.0 (2026-02-13)

### Features

- **hash** — HMAC support (SHA-256, SHA-512, SHA-1, MD5) with `action=hmac` and `key` parameter (#34)
- **hash** — Security warnings for weak algorithms (MD5, SHA-1) logged to console (#34)
- **semver** — npm-style complex range support: OR (`||`), AND (space-separated), hyphen ranges (`1.0.0 - 2.0.0`) (#35)
- **color** — Alpha channel support: 8-digit HEX (`#RRGGBBAA`), 4-digit shorthand (`#RGBA`), `rgba()`, `hsla()` (#36)

### Security

- **math** — Sandbox dangerous functions (`import`, `createUnit`) to prevent code injection in MCP environments (#32)
- **regex** — Strengthen ReDoS protection with pre-execution pattern validation (nested quantifiers, max length) (#33)

### Improvements

- **regex** — Enhanced timeout error messages with elapsed time and threshold (#33)
- **hash** — Tool description now indicates MD5/SHA1 weaknesses (#34)

### Tests

- Added 86 new tests covering HMAC, complex semver ranges, alpha channels, sandboxing, and ReDoS protection
- All 386 tests passing

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
