# @chatalaw/calc-mcp

A Model Context Protocol (MCP) server that provides calculation and conversion tools for AI assistants. Designed to supplement areas where LLMs are unreliable — random generation, hashing, encoding, etc.

## Tools

| Tool | Description |
|------|-------------|
| `random` | Generate UUID, ULID, secure passwords, or random numbers |
| `hash` | Compute MD5, SHA1, SHA256, SHA512, or CRC32 hashes |
| `base64` | Encode/decode Base64 strings |
| `encode` | URL, HTML entity, and Unicode escape encoding/decoding |

> Currently 4 tools, expanding to 20+ in the future.

## Installation

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

## Development

```bash
# Run dev server
bun run dev

# Run tests
bun test

# Lint
bun run lint

# Format
bun run format
```

## Tool Details

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

Supported algorithms: `md5`, `sha1`, `sha256`, `sha512`, `crc32`

### base64

```json
{ "input": "hello world", "action": "encode" }
{ "input": "aGVsbG8gd29ybGQ=", "action": "decode" }
```

### encode

```json
{ "input": "hello world", "action": "encode", "type": "url" }
{ "input": "<script>", "action": "encode", "type": "html" }
{ "input": "こんにちは", "action": "encode", "type": "unicode" }
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass (`bun test`)
5. Ensure linting passes (`bun run lint`)
6. Submit a pull request

## License

MIT
