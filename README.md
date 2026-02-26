# Calc MCP

[![npm version](https://img.shields.io/npm/v/@coo-quack/calc-mcp)](https://www.npmjs.com/package/@coo-quack/calc-mcp)
[![CI](https://github.com/coo-quack/calc-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/coo-quack/calc-mcp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
<br />
<br />
<img width="100%" alt="Calc MCP demo" src="https://i.imgur.com/DcOhAD4.png" />
<br />
<br />
📖 **[Documentation](https://coo-quack.github.io/calc-mcp/)** — Full tool reference, examples, and install guides.

**21 tools for things AI is not good at** — deterministic math, cryptographic randomness, accurate date arithmetic, encoding, hashing, and more.

LLMs hallucinate calculations, can't generate true random numbers, and struggle with timezones. This MCP server fixes that.

### Quick Start

```bash
# Claude Code
claude mcp add -s user calc-mcp -- npx --prefix /tmp -y @coo-quack/calc-mcp@latest

# Or just run it
npx --prefix /tmp -y @coo-quack/calc-mcp@latest
```

> Works with Claude Desktop, VS Code Copilot, Cursor, Windsurf, and any MCP client — [setup guides below](#install).

---

## Why?

| AI alone                                       | With calc-mcp                                   |
| ---------------------------------------------- | ----------------------------------------------- |
| "10 + 34 × 341 ÷ 23 = 507.8" ❌                | `514.087` ✅ (math)                             |
| "Here's a UUID: 550e8400-..." 🤷 fake          | Cryptographically random UUID v4/v7 ✅ (random) |
| "100 days from now is..." 🤔 guess             | `2026-05-22` ✅ (date)                          |
| "SHA-256 of password123 is..." 💀 hallucinated | `ef92b778bafe...` ✅ (hash)                     |

- **Deterministic** — Same input, same correct output, every time
- **Secure** — Sandboxed math, ReDoS protection, weak hash warnings
- **Private** — All computation runs locally, no data sent to external services
- **No server config** — Install once via npx; MCP client setup required
- **No API key** — No account or API key required for calc-mcp itself; requires Node.js

## Examples

Ask in natural language — your AI assistant selects the appropriate tool.

### Math & Numbers

| You ask                                  | You get    | Tool |
| ---------------------------------------- | ---------- | ---- |
| What's 10 + 34 × 341 ÷ 23?               | `514.087`  | math |
| Convert 255 to binary                    | `11111111` | base |
| Is 4539578763621486 a valid card number? | `true`     | luhn |

### Text & Encoding

| You ask                                    | You get              | Tool   |
| ------------------------------------------ | -------------------- | ------ |
| How many characters in "Hello, World! 🌍"? | `15 chars, 18 bytes` | count  |
| Base64 encode "Hello World"                | `SGVsbG8gV29ybGQ=`   | base64 |
| Base64 decode "eyJhbGciOiJIUzI1NiJ9"       | `{"alg":"HS256"}`    | base64 |
| URL-encode "hello world"                   | `hello%20world`      | encode |
| URL-decode "hello%20world"                 | `hello world`        | encode |
| HTML-decode `&lt;script&gt;`               | `<script>`           | encode |
| SHA-256 hash of "password123"              | `ef92b778bafe...`    | hash   |
| HMAC-SHA256 of "message" with key "secret" | `8b5f48702995...`    | hash   |

### Date & Time

| You ask                           | You get                     | Tool       |
| --------------------------------- | --------------------------- | ---------- |
| What time is it in New York?      | `2026-02-10T19:00:00-05:00` | datetime   |
| What's 100 days after 2026-02-11? | `2026-05-22`                | date       |
| When does "30 9 \* \* 1-5" run?   | `Mon–Fri at 9:30`           | cron_parse |

### Generation

| You ask                              | You get                       | Tool   |
| ------------------------------------ | ----------------------------- | ------ |
| Generate a UUID v7                   | `019c4b54-aad2-7e52-...`      | random |
| Generate a readable 20-char password | `hT9jZDojX6sHRJt8vaKS`        | random |
| Shuffle ["Alice", "Bob", "Charlie"]  | `["Charlie", "Alice", "Bob"]` | random |

### Conversion

| You ask                                     | You get            | Tool    |
| ------------------------------------------- | ------------------ | ------- |
| 100 miles in kilometers?                    | `160.93 km`        | convert |
| 72°F in Celsius?                            | `22.22°C`          | convert |
| Convert #FF5733 to RGB                      | `rgb(255, 87, 51)` | color   |
| Convert rgba(255, 0, 0, 0.5) to 8-digit HEX | `#ff000080`        | color   |

### Analysis & Parsing

| You ask                              | You get                          | Tool          |
| ------------------------------------ | -------------------------------- | ------------- |
| Extract numbers from "abc123def456"  | `123, 456`                       | regex         |
| Does 1.5.3 satisfy ^1.0.0?           | `true`                           | semver        |
| Does 1.8.0 satisfy ">=1.5.0 <2.0.0"? | `true`                           | semver        |
| IP range of 192.168.1.0/24?          | `192.168.1.1 – .254 (254 hosts)` | ip            |
| Edit distance: "kitten" → "sitting"  | `3`                              | diff          |
| Unicode info for "€"                 | `U+20AC, Currency Symbols`       | char_info     |
| Is `{"name":"test"}` valid JSON?     | `valid, object`                  | json_validate |

### Decode & Parse

| You ask                                  | You get                              | Tool       |
| ---------------------------------------- | ------------------------------------ | ---------- |
| Decode this JWT: eyJhbGci...             | `{ alg: "HS256", name: "John Doe" }` | jwt_decode |
| Parse https://example.com/search?q=hello | `host: example.com, q: "hello"`      | url_parse  |

## All 21 Tools

| Tool            | Description                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| `math`          | Evaluate expressions, statistics                                                                     |
| `count`         | Characters (grapheme-aware), words, lines, bytes                                                     |
| `datetime`      | Current time, timezone conversion, UNIX timestamps                                                   |
| `random`        | UUID v4/v7, ULID, passwords (readable, custom charset), random number, shuffle                       |
| `hash`          | MD5, SHA-1, SHA-256, SHA-512, CRC32, HMAC                                                            |
| `base64`        | Encode / decode                                                                                      |
| `encode`        | URL, HTML entity, Unicode escape                                                                     |
| `date`          | Diff, add/subtract, weekday, wareki                                                                  |
| `regex`         | Test, match, matchAll, replace                                                                       |
| `base`          | Number base conversion (2–36)                                                                        |
| `diff`          | Line diff, Levenshtein distance                                                                      |
| `json_validate` | Validate JSON, CSV, XML, YAML                                                                        |
| `cron_parse`    | Human-readable cron + next runs (weekday/month names supported)                                      |
| `luhn`          | Validate / generate check digits                                                                     |
| `ip`            | IPv4/IPv6 info, CIDR contains check, range calculation                                               |
| `color`         | HEX ↔ RGB ↔ HSL (alpha channel supported)                                                            |
| `convert`       | 8 categories, 72 units: length, weight, temperature, area (tsubo, tatami), volume, speed, data, time |
| `char_info`     | Unicode code point, block, category                                                                  |
| `jwt_decode`    | Decode header + payload (no verification)                                                            |
| `url_parse`     | Protocol, host, path, params, hash                                                                   |
| `semver`        | Compare, validate, parse, range satisfaction                                                         |

## Install

### Claude Code

```bash
claude mcp add -s user calc-mcp -- npx --prefix /tmp -y @coo-quack/calc-mcp@latest
```

### Claude Desktop / Cursor / Windsurf

Add to your config file:

| App                      | Config path                                                       |
| ------------------------ | ----------------------------------------------------------------- |
| Claude Desktop (macOS)   | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Claude Desktop (Windows) | `%APPDATA%\Claude\claude_desktop_config.json`                     |
| Cursor                   | `~/.cursor/mcp.json`                                              |
| Windsurf                 | `~/.codeium/windsurf/mcp_config.json`                             |

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

### Docker Image

Calc MCP is available as a Docker image from GitHub Container Registry:

```bash
docker run --rm -i ghcr.io/coo-quack/calc-mcp:latest
```

Or use in MCP client config:

```json
{
  "mcpServers": {
    "calc-mcp": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "ghcr.io/coo-quack/calc-mcp:latest"]
    }
  }
}
```

Available tags:
- `ghcr.io/coo-quack/calc-mcp:latest` — Latest release
- `ghcr.io/coo-quack/calc-mcp:1.8.6` — Specific version

### Other MCP Clients

Calc MCP works with any MCP-compatible client. Run the server via stdio:

```bash
npx --prefix /tmp -y @coo-quack/calc-mcp@latest
```

Point your client's MCP config to the command above. The server communicates over **stdio** using the standard [Model Context Protocol](https://modelcontextprotocol.io/).

## Development

```bash
bun install
bun run dev       # Start dev server
bun test          # Run tests
bun run lint      # Biome
bun run format    # Biome
```

## Security

calc-mcp processes all data **locally** and does **not**:

- ❌ Send data to external servers
- ❌ Log data to files or remote services
- ❌ Store processed data persistently

**For detailed security information, see [SECURITY.md](SECURITY.md).**

### Safe Usage with LLMs

**calc-mcp itself is local-only.** However, when used via an LLM, your inputs are sent to the LLM provider (Anthropic, OpenAI, etc.).

- ✅ **DO:** Use test/sample data when possible
- ✅ **DO:** Use local-only LLMs for sensitive operations
- ❌ **DON'T:** Pass production secrets to MCP tools (they will be sent to your LLM provider)

Example:

```bash
# ❌ Unsafe: Any secret passed to MCP tool is sent to your LLM provider
# Tool: hash
# Input: { "input": "sk-1234567890abcdef", "algorithm": "sha256" }

# ✅ Safe: Use test data only (for learning/development)
# Tool: hash
# Input: { "input": "test-value-123", "algorithm": "sha256" }

# ✅ For production secrets: Use local-only LLMs or process outside MCP
```

**Note:** Error messages are automatically sanitized to prevent accidental data leakage.

For security issues, please see our [Security Policy](SECURITY.md#reporting-security-issues).

## License

MIT
