# Changelog

## v1.2.0 (2026-02-11)

### Documentation

- Overhaul README with `claude mcp add` install command and npx-based setup
- Replace JSON examples with 22 natural language "What You Can Ask" examples (all verified)
- Compact tool reference table
- 242 lines → 127 lines

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
