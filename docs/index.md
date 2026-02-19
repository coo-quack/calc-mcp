---
layout: home

hero:
  name: Calc MCP
  text: 21 tools for things AI is not good at
  tagline: Deterministic math, cryptographic randomness, accurate date arithmetic, encoding, hashing, and more
  actions:
    - theme: brand
      text: Get Started
      link: /install
    - theme: alt
      text: View Tools
      link: /tools
    - theme: alt
      text: GitHub
      link: https://github.com/coo-quack/calc-mcp

features:
  - icon: 🧮
    title: Precise Math
    details: No more hallucinated calculations. Evaluate complex expressions with mathjs, compute statistics, all deterministic.
  - icon: 🎲
    title: True Randomness
    details: Cryptographically secure UUIDs, ULIDs, passwords, and shuffling. No fake random numbers from AI.
  - icon: 📅
    title: Accurate Dates
    details: Timezone conversion, date arithmetic, cron parsing. No more guessing what day it is 100 days from now.
  - icon: 🔐
    title: Hashing & Encoding
    details: SHA-256, Base64, URL encoding, JWT decoding. Real cryptographic operations, not hallucinated hashes.
  - icon: 🌈
    title: Conversions
    details: 8 categories, 72 units. Length, weight, temperature, area, volume, speed, data, time. Including Japanese units (tsubo, tatami).
  - icon: 🔍
    title: Parsing & Validation
    details: IP addresses, URLs, JSON, semver, Luhn checksums. Deterministic validation and parsing.
---

## Why Calc MCP?

LLMs are incredible at natural language understanding, but terrible at things that require **precision**.

| AI alone | With calc-mcp |
|----------|---------------|
| "10 + 34 × 341 ÷ 23 = 507.8" ❌ | `514.087` ✅ (math) |
| "Here's a UUID: 550e8400-..." 🤷 fake | Cryptographically random UUID v4/v7 ✅ (random) |
| "100 days from now is..." 🤔 guess | `2026-05-22` ✅ (date) |
| "SHA-256 of password123 is..." 💀 hallucinated | `ef92b778bafe...` ✅ (hash) |

Calc MCP gives your AI assistant the tools to **delegate** these tasks to deterministic, tested code.

- **Deterministic** — Same input, same correct output, every time. No more "it depends on the run."
- **Secure** — Sandboxed math evaluation, ReDoS protection, weak hash warnings built in.
- **Private** — All computation runs locally. No data sent to external services.
- **No server config** — Install once via npx; MCP client setup required. The AI picks the right tool.
- **No API key** — No account or API key required for calc-mcp itself; requires Node.js.

## Quick Start

```bash
# Claude Code
claude mcp add -s user calc-mcp -- npx --prefix /tmp -y @coo-quack/calc-mcp@latest
```

Works with **Claude Desktop**, **VS Code Copilot**, **Cursor**, **Windsurf** — see [installation guides](/install).

## Usage

Just ask in natural language. The AI picks the right tool automatically:

```
You: What's 10 + 34 × 341 ÷ 23?
AI: [uses math tool] → 514.087

You: Generate a UUID v7
AI: [uses random tool] → 019c4b54-aad2-7e52-8a3b-...

You: What's 100 days after 2026-02-11?
AI: [uses date tool] → 2026-05-22

You: SHA-256 hash of "password123"
AI: [uses hash tool] → ef92b778bafe771e89245b89ec...
```

See more [examples →](/examples)

## All 21 Tools

| Category | Tools |
|----------|-------|
| **Math** | math, count, convert, base |
| **Random** | random (UUID, ULID, password, number, shuffle) |
| **Dates** | datetime, date, cron_parse |
| **Text** | base64, encode, hash, regex, diff, char_info |
| **Validation** | json_validate, luhn, semver |
| **Parsing** | ip, color, jwt_decode, url_parse |

[View all tools →](/tools)

## Features

- ✅ **21 MCP tools** covering calculations, randomness, dates, encoding, parsing
- ✅ **Tested** — 453 tests, 512 assertions across unit and E2E
- ✅ **Fast** — Pure JavaScript/TypeScript, no heavy dependencies
- ✅ **Cross-platform** — Works with Claude Desktop, VS Code, Cursor, Windsurf
- ✅ **MIT Licensed** — Free to use, modify, distribute
