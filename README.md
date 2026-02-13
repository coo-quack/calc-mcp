# Calc MCP

[![npm version](https://img.shields.io/npm/v/@coo-quack/calc-mcp)](https://www.npmjs.com/package/@coo-quack/calc-mcp)
[![CI](https://github.com/coo-quack/calc-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/coo-quack/calc-mcp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

📖 **[Documentation](https://coo-quack.github.io/calc-mcp/)** — Full tool reference, examples, and install guides.

**21 tools for things AI is bad at** — deterministic math, cryptographic randomness, accurate date arithmetic, encoding, hashing, and more.

LLMs hallucinate calculations, can't generate true random numbers, and struggle with timezones. This MCP server fixes that.

### Quick Start

```bash
# Claude Code
claude mcp add -s user calc-mcp -- npx --prefix /tmp -y @coo-quack/calc-mcp@latest

# Or just run it
npx --prefix /tmp -y @coo-quack/calc-mcp@latest
```

> Works with Claude Desktop, VS Code Copilot, Cursor, Windsurf — [setup guides below](#install).

---

## Why?

| AI alone | With calc-mcp |
|----------|---------------|
| "10 + 34 × 341 ÷ 23 = 507.8" ❌ | `514.087` ✅ (math) |
| "Here's a UUID: 550e8400-..." 🤷 fake | Cryptographically random UUID v4/v7 ✅ (random) |
| "100 days from now is..." 🤔 guess | `2026-05-22` ✅ (date) |
| "SHA-256 of password123 is..." 💀 hallucinated | `ef92b778bafe...` ✅ (hash) |

## Examples

Ask in natural language — the AI picks the right tool automatically.

### Math & Numbers

| You ask | You get | Tool |
|---------|---------|------|
| What's 10 + 34 × 341 ÷ 23? | `514.087` | math |
| Convert 255 to binary | `11111111` | base |
| Is 4539578763621486 a valid card number? | `true` | luhn |

### Text & Encoding

| You ask | You get | Tool |
|---------|---------|------|
| How many characters in "Hello, World! 🌍"? | `15 chars, 18 bytes` | count |
| Base64 encode "Hello World" | `SGVsbG8gV29ybGQ=` | base64 |
| Base64 decode "eyJhbGciOiJIUzI1NiJ9" | `{"alg":"HS256"}` | base64 |
| URL-encode "hello world" | `hello%20world` | encode |
| URL-decode "hello%20world" | `hello world` | encode |
| HTML-decode `&lt;script&gt;` | `<script>` | encode |
| SHA-256 hash of "password123" | `ef92b778bafe...` | hash |
| HMAC-SHA256 of "message" with key "secret" | `8c4d2cdb5e7a...` | hash |

### Date & Time

| You ask | You get | Tool |
|---------|---------|------|
| What time is it in New York? | `2026-02-10T19:00:00-05:00` | datetime |
| What's 100 days after 2026-02-11? | `2026-05-22` | date |
| When does "30 9 * * 1-5" run? | `Mon–Fri at 9:30` | cron_parse |

### Generation

| You ask | You get | Tool |
|---------|---------|------|
| Generate a UUID v7 | `019c4b54-aad2-7e52-...` | random |
| Generate a readable 20-char password | `hT9jZDojX6sHRJt8vaKS` | random |
| Shuffle ["Alice", "Bob", "Charlie"] | `["Charlie", "Alice", "Bob"]` | random |

### Conversion

| You ask | You get | Tool |
|---------|---------|------|
| 100 miles in kilometers? | `160.93 km` | convert |
| 72°F in Celsius? | `22.22°C` | convert |
| Convert #FF5733 to RGB | `rgb(255, 87, 51)` | color |
| Convert rgba(255, 0, 0, 0.5) to 8-digit HEX | `#ff000080` | color |

### Analysis & Parsing

| You ask | You get | Tool |
|---------|---------|------|
| Extract numbers from "abc123def456" | `123, 456` | regex |
| Does 1.5.3 satisfy ^1.0.0? | `true` | semver |
| Does 1.8.0 satisfy ">=1.5.0 <2.0.0"? | `true` | semver |
| IP range of 192.168.1.0/24? | `192.168.1.1 – .254 (254 hosts)` | ip |
| Edit distance: "kitten" → "sitting" | `3` | diff |
| Unicode info for "€" | `U+20AC, Currency Symbols` | char_info |
| Is `{"name":"test"}` valid JSON? | `valid, object` | json_validate |

### Decode & Parse

| You ask | You get | Tool |
|---------|---------|------|
| Decode this JWT: eyJhbGci... | `{ alg: "HS256", name: "John Doe" }` | jwt_decode |
| Parse https://example.com/search?q=hello | `host: example.com, q: "hello"` | url_parse |

## All 21 Tools

| Tool | Description |
|------|-------------|
| `math` | Evaluate expressions, statistics |
| `count` | Characters (grapheme-aware), words, lines, bytes |
| `datetime` | Current time, timezone conversion, UNIX timestamps |
| `random` | UUID v4/v7, ULID, passwords (readable, custom charset), shuffle |
| `hash` | MD5, SHA-1, SHA-256, SHA-512, CRC32 |
| `base64` | Encode / decode |
| `encode` | URL, HTML entity, Unicode escape |
| `date` | Diff, add/subtract, weekday, wareki |
| `regex` | Test, match, matchAll, replace |
| `base` | Number base conversion (2–36) |
| `diff` | Line diff, Levenshtein distance |
| `json_validate` | Validate JSON, CSV, XML, YAML |
| `cron_parse` | Human-readable cron + next runs |
| `luhn` | Validate / generate check digits |
| `ip` | IPv4/IPv6 info, CIDR range |
| `color` | HEX ↔ RGB ↔ HSL |
| `convert` | 8 categories, 72 units: length, weight, temperature, area (tsubo, tatami), volume, speed, data, time |
| `char_info` | Unicode code point, block, category |
| `jwt_decode` | Decode header + payload (no verification) |
| `url_parse` | Protocol, host, path, params, hash |
| `semver` | Compare, validate, range satisfaction |

## Install

### Claude Code

```bash
claude mcp add -s user calc-mcp -- npx --prefix /tmp -y @coo-quack/calc-mcp@latest
```

### Claude Desktop / Cursor / Windsurf

Add to your config file:

| App | Config path |
|-----|-------------|
| Claude Desktop (macOS) | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Claude Desktop (Windows) | `%APPDATA%\Claude\claude_desktop_config.json` |
| Cursor | `~/.cursor/mcp.json` |
| Windsurf | `~/.codeium/windsurf/mcp_config.json` |

```json
{
  "mcpServers": {
    "calc-mcp": {
      "command": "npx",
      "args": ["--prefix", "/tmp", "-y", "@coo-quack/calc-mcp@latest"]
    }
  }
}
```

### VS Code (GitHub Copilot)

Add to `.vscode/mcp.json` in your workspace:

```json
{
  "servers": {
    "calc-mcp": {
      "command": "npx",
      "args": ["--prefix", "/tmp", "-y", "@coo-quack/calc-mcp@latest"]
    }
  }
}
```

## Development

```bash
bun install
bun run dev       # Start dev server
bun test          # Run tests
bun run lint      # Biome
bun run format    # Biome
```

## License

MIT
