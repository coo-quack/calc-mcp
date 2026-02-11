# @coo-quack/calc-mcp

An MCP server with 21 tools for things AI is bad at — math, hashing, encoding, date arithmetic, and more.

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
| Base64 decode "5pel5pys6Kqe" | `日本語` | base64 |
| URL-encode "hello world" | `hello%20world` | encode |
| URL-decode "hello%20world" | `hello world` | encode |
| HTML-decode `&lt;script&gt;` | `<script>` | encode |
| SHA-256 hash of "password123" | `ef92b778bafe...` | hash |

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
| Generate a 20-char password | `h#tjZDojX6sH!RJt8vaS` | random |

### Conversion

| You ask | You get | Tool |
|---------|---------|------|
| 100 miles in kilometers? | `160.93 km` | convert |
| 72°F in Celsius? | `22.22°C` | convert |
| Convert #FF5733 to RGB | `rgb(255, 87, 51)` | color |

### Analysis & Parsing

| You ask | You get | Tool |
|---------|---------|------|
| Extract numbers from "abc123def456" | `123, 456` | regex |
| Does 1.5.3 satisfy ^1.0.0? | `true` | semver |
| IP range of 192.168.1.0/24? | `192.168.1.1 – .254 (254 hosts)` | ip |
| Edit distance: "kitten" → "sitting" | `3` | diff |
| Unicode info for "漢" | `U+6F22, CJK Unified Ideographs` | char_info |
| Is `{"name":"test"}` valid JSON? | `valid, object` | json_validate |

### Decode & Parse

| You ask | You get | Tool |
|---------|---------|------|
| Decode this JWT: eyJhbGci... | `{ alg: "HS256", name: "John Doe" }` | jwt_decode |
| Parse https://example.com/search?q=hello | `host: example.com, q: "hello"` | url_parse |

## All Tools

| Tool | Description |
|------|-------------|
| `math` | Evaluate expressions, statistics |
| `count` | Characters (grapheme-aware), words, lines, bytes |
| `datetime` | Current time, timezone conversion, UNIX timestamps |
| `random` | UUID v4/v7, ULID, passwords, random numbers |
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
| `convert` | 7 categories, 58 units: length (m, km, mi, ft, ...), weight (kg, lb, oz, ...), temperature (°C, °F, K), area (m², ha, acre, tsubo, tatami), volume (l, gal, cup, tbsp, ...), speed (km/h, mph, kn, ...), data (kb, mb, gb, tb, ...) |
| `char_info` | Unicode code point, block, category |
| `jwt_decode` | Decode header + payload (no verification) |
| `url_parse` | Protocol, host, path, params, hash |
| `semver` | Compare, validate, range satisfaction |

## Install

### Claude Code

```bash
claude mcp add -s user calc-mcp -- npx -y @coo-quack/calc-mcp
```

### Claude Desktop

Add to your config file:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "calc-mcp": {
      "command": "npx",
      "args": ["-y", "@coo-quack/calc-mcp"]
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
      "args": ["-y", "@coo-quack/calc-mcp"]
    }
  }
}
```

Or add globally via settings.json:

```json
{
  "mcp": {
    "servers": {
      "calc-mcp": {
        "command": "npx",
        "args": ["-y", "@coo-quack/calc-mcp"]
      }
    }
  }
}
```

### Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "calc-mcp": {
      "command": "npx",
      "args": ["-y", "@coo-quack/calc-mcp"]
    }
  }
}
```

### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "calc-mcp": {
      "command": "npx",
      "args": ["-y", "@coo-quack/calc-mcp"]
    }
  }
}
```

## Development

```bash
bun install
bun run dev       # Start dev server
bun test          # 160 tests
bun run lint      # Biome
bun run format    # Biome
```

## License

MIT
