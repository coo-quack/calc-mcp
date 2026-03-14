# Getting Started

Get Calc MCP running in under 2 minutes.

## Install

The fastest way to add Calc MCP is via Claude Code:

```bash
claude mcp add -s user calc-mcp -- npx --prefix /tmp -y @coo-quack/calc-mcp@latest
```

For other clients (Claude Desktop, VS Code, Cursor, Windsurf, Docker), see the [Installation](/install) page.

## Your First Tool Call

Once installed, just ask in natural language. Your AI assistant selects the appropriate tool:

```
You: What's 10 + 34 x 341 / 23?
AI: [uses math tool] → 514.087

You: Generate a UUID v7
AI: [uses random tool] → 019c4b54-aad2-7e52-8a3b-...

You: What's 100 days after 2026-02-11?
AI: [uses date tool] → 2026-05-22

You: SHA-256 hash of "password123"
AI: [uses hash tool] → {"hash": "ef92b778bafe771e89245b89ec..."}
```

See more [examples →](/examples)

## All 21 Tools

| Category | Tools |
|----------|-------|
| **Math** | math, count, convert, base |
| **Random** | random (UUID, ULID, password, number, shuffle) |
| **Dates** | datetime, date, cron_parse |
| **Text** | base64, encode, hash, regex, diff, char_info |
| **Validation** | format_validate, luhn, semver |
| **Parsing** | ip, color, jwt_decode, url_parse |

[View all tools →](/tools)

## Next Steps

- [Installation guides](/install) — detailed setup for each platform
- [Examples](/examples) — real-world usage patterns
- [All Tools](/tools) — complete tool reference
