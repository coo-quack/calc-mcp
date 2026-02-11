# @coo-quack/calc-mcp

An MCP server with 21 tools for things AI is bad at — math, hashing, encoding, date arithmetic, and more.

## Install

### Claude Code (CLI)

```bash
claude mcp add -s user calc-mcp -- npx -y @coo-quack/calc-mcp
```

### Claude Desktop

Add to `claude_desktop_config.json`:

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

### Other MCP Clients (Cursor, etc.)

```json
{
  "command": "npx",
  "args": ["-y", "@coo-quack/calc-mcp"],
  "transport": "stdio"
}
```

## What You Can Ask

> What's 10 + 34 × 341 ÷ 23?

→ `514.087` (via **math**)

> How many characters in "Hello, World! 🌍"?

→ `15 characters, 18 bytes` (via **count** — grapheme-aware)

> What time is it in New York?

→ `2026-02-10T19:00:00-05:00` (via **datetime**)

> Generate a UUID v7.

→ `019c4b54-aad2-7e52-95a3-f150f7c74254` (via **random**)

> SHA-256 hash of "password123"?

→ `ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f` (via **hash**)

> Base64 encode "Hello World".

→ `SGVsbG8gV29ybGQ=` (via **base64**)

> Convert 255 to binary.

→ `11111111` (via **base**)

> Convert #FF5733 to RGB.

→ `rgb(255, 87, 51)` (via **color**)

> 100 miles in kilometers?

→ `160.93 km` (via **convert**)

> 72°F in Celsius?

→ `22.22°C` (via **convert**)

> What's 100 days after 2026-02-11?

→ `2026-05-22` (via **date**)

> Extract all numbers from "abc123def456".

→ `123, 456` (via **regex**)

> Does 1.5.3 satisfy ^1.0.0?

→ `true` (via **semver**)

> IP range of 192.168.1.0/24?

→ `192.168.1.1 – 192.168.1.254 (254 hosts)` (via **ip**)

> Is 4539578763621486 a valid card number?

→ `true` (via **luhn**)

> Edit distance between "kitten" and "sitting"?

→ `3` (via **diff**)

> When does "30 9 * * 1-5" run?

→ `Mon–Fri at 9:30` (via **cron_parse**)

> Unicode info for "漢"?

→ `U+6F22, CJK Unified Ideographs, Letter` (via **char_info**)

> URL-encode "hello world".

→ `hello%20world` (via **encode**)

> Decode this JWT: eyJhbGciOiJIUzI1NiIs...

→ `{ alg: "HS256", sub: "1234567890", name: "John Doe" }` (via **jwt_decode**)

> Parse https://example.com/search?q=hello&lang=en#results

→ `host: example.com, params: { q: "hello", lang: "en" }, hash: "#results"` (via **url_parse**)

> Is this valid JSON? {"name": "test", "count": 42}

→ `valid, object with keys: name, count` (via **json_validate**)

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
| `convert` | Length, weight, temp, area, volume, speed, data |
| `char_info` | Unicode code point, block, category |
| `jwt_decode` | Decode header + payload (no verification) |
| `url_parse` | Protocol, host, path, params, hash |
| `semver` | Compare, validate, range satisfaction |

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
