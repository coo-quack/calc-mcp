---
layout: home

hero:
  name: Calc MCP
  text: 21 tools for things AI is not good at
  tagline: Deterministic math, cryptographic randomness, accurate date arithmetic, encoding, hashing, and more
  image:
    src: /logo.svg
    alt: Calc MCP
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: View Tools
      link: /tools
    - theme: alt
      text: GitHub
      link: https://github.com/coo-quack/calc-mcp

features:
  - icon: 🧮
    title: Precise Math
    details: Evaluate complex expressions and compute statistics using mathjs. Results are always deterministic.
  - icon: 🎲
    title: True Randomness
    details: Cryptographically secure UUIDs, ULIDs, passwords, and shuffling using the platform's crypto API.
  - icon: 📅
    title: Accurate Dates
    details: Timezone conversion, date arithmetic, and cron parsing with deterministic, accurate results.
  - icon: 🔐
    title: Hashing & Encoding
    details: SHA-256, Base64, URL encoding, JWT decoding. Deterministic cryptographic operations.
  - icon: 🌈
    title: Conversions
    details: 8 categories, 72 units. Length, weight, temperature, area, volume, speed, data, time. Including Japanese units (tsubo, tatami).
  - icon: 🔍
    title: Parsing & Validation
    details: IP addresses, URLs, JSON, semver, Luhn checksums. Deterministic validation and parsing.
---

## Why Calc MCP?

LLMs excel at natural language understanding, but can produce incorrect results for tasks that require **precision**.

| AI alone | With calc-mcp |
|----------|---------------|
| "10 + 34 × 341 ÷ 23 = 507.8" ❌ | `514.087` ✅ (math) |
| "Here's a UUID: 550e8400-..." 🤷 fake | Cryptographically random UUID v4/v7 ✅ (random) |
| "100 days from now is..." 🤔 guess | `2026-05-22` ✅ (date) |
| "SHA-256 of password123 is..." 💀 hallucinated | `{"hash": "ef92b778bafe..."}` ✅ (hash) |

Calc MCP gives your AI assistant the tools to **delegate** these tasks to deterministic, tested code.

- **Deterministic** — Same input, same correct output, every time. No more "it depends on the run."
- **Secure** — Sandboxed math evaluation, ReDoS protection, weak hash warnings built in.
- **Private** — All computation runs locally. No data sent to external services.
- **No server config** — Install once via npx; MCP client setup required.
- **No API key** — No account or API key required for calc-mcp itself; requires Node.js.
