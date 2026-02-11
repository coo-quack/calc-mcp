# Changelog

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

- **random**: Add UUID v7 support (`uuidVersion: "v7"`) — time-ordered UUIDs, ideal for database primary keys

## v1.0.0 (2026-02-11)

### Features

- **21 MCP tools** for calculations and operations AI models struggle with:
  - `random` — UUID (v4), ULID, secure password, random number
  - `hash` — SHA-1, SHA-256, SHA-512, MD5
  - `base64` — Encode/decode Base64
  - `encode` — URL encode/decode, HTML entity encode/decode
  - `datetime` — Current time, convert, format, Unix timestamp
  - `count` — Character, word, line, byte counting (grapheme-aware)
  - `math` — Precise math evaluation via mathjs
  - `date` — Date arithmetic (add/subtract/diff)
  - `regex` — Test, match, replace with regex
  - `base` — Number base conversion (bin/oct/dec/hex/custom)
  - `diff` — Text diff between two strings
  - `json_validate` — JSON schema validation
  - `cron_parse` — Cron expression to human-readable description
  - `luhn` — Luhn algorithm validation (credit cards, etc.)
  - `ip` — IPv4/IPv6 parsing, CIDR subnet info
  - `color` — Color format conversion (hex/rgb/hsl/hwb)
  - `convert` — Unit conversion (length, weight, temp, data, time)
  - `char_info` — Unicode character info (codepoint, name, category)
  - `jwt_decode` — Decode JWT tokens (header + payload)
  - `url_parse` — URL parsing into components
  - `semver` — Semantic versioning operations (compare, satisfy, sort)

### CI/CD

- GitHub Actions: test + lint on push/PR
- Publish workflow: test + lint gate before npm publish on tag

### Infrastructure

- Biome for linting and formatting
- Renovate with OSV vulnerability alerts
- 160 tests, 92%+ line coverage
