# @coo-quack/calc-mcp

A Model Context Protocol (MCP) server that provides 21 calculation, conversion, and utility tools for AI assistants. Designed to supplement areas where LLMs are unreliable — random generation, hashing, encoding, date math, and more.

## Tools

| Tool | Description |
|------|-------------|
| `random` | Generate UUID, ULID, secure passwords, or random numbers |
| `hash` | Compute MD5, SHA1, SHA256, SHA512, or CRC32 hashes |
| `base64` | Encode/decode Base64 strings |
| `encode` | URL, HTML entity, and Unicode escape encoding/decoding |
| `datetime` | Get current datetime, convert timezones, format dates, UNIX timestamps |
| `count` | Count characters (grapheme clusters), words, lines, bytes |
| `math` | Evaluate math expressions or compute statistics |
| `date` | Date diff, add, weekday, and Japanese wareki conversion |
| `regex` | Test, match, matchAll, or replace with regular expressions |
| `base` | Convert numbers between bases (2-36) with BigInt support |
| `diff` | Line-by-line text diff or Levenshtein distance |
| `json_validate` | Validate and parse JSON, CSV, XML, or YAML |
| `cron_parse` | Parse cron expressions and return next N execution times |
| `luhn` | Validate or generate Luhn check digits |
| `ip` | IP address info, CIDR contains check, range calculation |
| `color` | Convert colors between HEX, RGB, and HSL |
| `convert` | Unit conversion: length, weight, temperature, area, volume, speed, data |
| `char_info` | Unicode character information (code point, block, category) |
| `jwt_decode` | Decode JWT header and payload (no signature verification) |
| `url_parse` | Parse URL into components (protocol, host, path, params) |
| `semver` | Semantic versioning: compare, validate, range satisfaction |

## Installation

```bash
npm install @coo-quack/calc-mcp
```

Or from source:

```bash
bun install
bun run build
```

## Usage

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "calc": {
      "command": "bun",
      "args": ["run", "/path/to/calc/src/index.ts"]
    }
  }
}
```

### Cursor / Other MCP Clients

```json
{
  "command": "bun",
  "args": ["run", "/path/to/calc/src/index.ts"],
  "transport": "stdio"
}
```

### Using Built Version

```bash
bun run build
node dist/index.js
```

## Tool Examples

### random

```json
{ "type": "uuid" }
{ "type": "ulid" }
{ "type": "password", "length": 32, "charset": "abc123" }
{ "type": "number", "min": 1, "max": 100 }
```

### hash

```json
{ "input": "hello", "algorithm": "sha256" }
```

### base64

```json
{ "input": "hello world", "action": "encode" }
{ "input": "aGVsbG8gd29ybGQ=", "action": "decode" }
```

### encode

```json
{ "input": "hello world", "action": "encode", "type": "url" }
{ "input": "<script>", "action": "encode", "type": "html" }
```

### datetime

```json
{ "action": "now", "timezone": "Asia/Tokyo" }
{ "action": "convert", "datetime": "2024-01-01T00:00:00Z", "toTimezone": "America/New_York" }
{ "action": "timestamp", "timestamp": 1704067200 }
```

### count

```json
{ "text": "こんにちは世界" }
{ "text": "Hello World", "encoding": "shift_jis" }
```

### math

```json
{ "expression": "sqrt(16) + 2^3" }
{ "action": "statistics", "values": [1, 2, 3, 4, 5] }
```

### date

```json
{ "action": "diff", "date": "2024-01-01", "date2": "2024-12-31" }
{ "action": "add", "date": "2024-01-01", "amount": 30, "unit": "days" }
{ "action": "weekday", "date": "2024-01-01" }
{ "action": "wareki", "date": "2024-06-15" }
```

### regex

```json
{ "pattern": "\\d+", "text": "abc123", "action": "test" }
{ "pattern": "\\d+", "flags": "g", "text": "a1b2c3", "action": "matchAll" }
```

### base

```json
{ "value": "255", "from": 10, "to": 16 }
{ "value": "ff", "from": 16, "to": 2 }
```

### diff

```json
{ "text1": "hello\nworld", "text2": "hello\nearth" }
{ "text1": "kitten", "text2": "sitting", "action": "distance" }
```

### json_validate

```json
{ "input": "{\"key\": \"value\"}", "format": "json" }
{ "input": "name,age\nAlice,30", "format": "csv" }
```

### cron_parse

```json
{ "expression": "30 9 * * 1-5", "count": 5 }
```

### luhn

```json
{ "number": "4539578763621486", "action": "validate" }
{ "number": "453957876362148", "action": "generate" }
```

### ip

```json
{ "action": "info", "ip": "192.168.1.1" }
{ "action": "contains", "cidr": "192.168.1.0/24", "target": "192.168.1.100" }
{ "action": "range", "cidr": "10.0.0.0/24" }
```

### color

```json
{ "color": "#ff0000", "to": "hsl" }
{ "color": "rgb(0, 255, 0)", "to": "hex" }
```

### convert

```json
{ "value": 100, "from": "km", "to": "mi" }
{ "value": 72, "from": "F", "to": "C", "category": "temperature" }
```

### char_info

```json
{ "char": "漢" }
{ "char": "😀" }
```

### jwt_decode

```json
{ "token": "eyJhbGciOiJIUzI1NiIs..." }
```

### url_parse

```json
{ "url": "https://example.com/path?q=hello&lang=en#section" }
```

### semver

```json
{ "action": "compare", "version": "2.0.0", "version2": "1.5.0" }
{ "action": "satisfies", "version": "1.5.0", "range": "^1.0.0" }
{ "action": "valid", "version": "1.2.3-alpha.1" }
```

## Development

```bash
bun run dev     # Run dev server
bun test        # Run tests (157 tests)
bun run lint    # Lint with Biome
bun run format  # Format with Biome
```

## License

MIT
