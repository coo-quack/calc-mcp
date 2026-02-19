# All Tools

Calc MCP provides 21 tools for operations that AI models can struggle with. Tools are invoked by your AI assistant in response to natural language requests.

## Math & Numbers

### math

Evaluate mathematical expressions or compute statistics on numbers.

::: tip Security
Expressions are evaluated in a sandboxed environment. Dangerous functions like `import`, `eval`, `require`, `process`, and `child_process` are blocked.
:::

**Parameters:**
- `expression` (string, optional) — Math expression to evaluate
- `action` (enum, optional) — `eval` (default) or `statistics`
- `values` (array of numbers, optional) — Array of numbers for statistics

**Examples:**
```
What's 10 + 34 × 341 ÷ 23?
→ 514.087

Calculate mean and stddev of [1, 2, 3, 4, 5]
→ { mean: 3, median: 3, stddev: 1.414, ... }
```

### count

Count characters (grapheme-aware), words, lines, and bytes in text.

**Parameters:**
- `text` (string) — Text to analyze
- `encoding` (enum, optional) — `utf8` (default) or `shift_jis` for byte count

**Examples:**
```
How many characters in "Hello, World! 🌍"?
→ 15 chars, 18 bytes

Count words in "The quick brown fox"
→ 4 words
```

### base

Convert numbers between different bases (2–36).

**Parameters:**
- `value` (string | number) — Value to convert
- `from` (number) — Source base (2–36)
- `to` (number) — Target base (2–36)

**Examples:**
```
Convert 255 to binary
→ 11111111

Convert FF from hex to decimal
→ 255
```

### convert

Convert between units across 8 categories: length, weight, temperature, area, volume, speed, data, time.

**Parameters:**
- `value` (number) — Value to convert
- `from` (string) — Source unit
- `to` (string) — Target unit
- `category` (enum, optional) — Category (auto-detected if omitted)

**Supported units:**
- **Length:** m, km, cm, mm, in, ft, yd, mi, nm, um
- **Weight:** kg, g, mg, lb, oz, t, st
- **Temperature:** c, f, k (Celsius, Fahrenheit, Kelvin)
- **Area:** m2, km2, cm2, ha, acre, ft2, in2, tsubo, jo, tatami
- **Volume:** l, ml, m3, gal, qt, pt, cup, floz, tbsp, tsp
- **Speed:** m/s, km/h, mph, kn, ft/s
- **Data:** b, kb, mb, gb, tb, pb, bit, kbit, mbit
- **Time:** ms, s, min, h, d, wk, mo, yr

**Examples:**
```
100 miles in kilometers?
→ 160.93 km

72°F in Celsius?
→ 22.22°C

10 tsubo in square meters?
→ 33.06 m²
```

## Random Generation

### random

Generate cryptographically random values: UUID, ULID, password, number, or shuffle a list.

**Parameters:**
- `type` (enum) — `uuid`, `ulid`, `password`, `number`, or `shuffle`
- `uuidVersion` (enum, optional) — `v4` (random, default) or `v7` (time-ordered)
- `length` (number, optional) — Length for password (default: 16, max: 256)
- `min` (number, optional) — Minimum value for number (default: 0)
- `max` (number, optional) — Maximum value for number (default: 100)
- `charset` (string, optional) — Custom character set for password
- `uppercase` (boolean, optional) — Include uppercase letters (default: true)
- `numbers` (boolean, optional) — Include numbers (default: true)
- `symbols` (boolean, optional) — Include symbols (default: true)
- `excludeChars` (string, optional) — Characters to exclude (e.g., `"\\|{}"`)
- `readable` (boolean, optional) — Exclude ambiguous characters (l/1/I/O/0/o)
- `items` (array of strings, optional) — Items to shuffle (for `type=shuffle`)

**Examples:**
```
Generate a UUID v7
→ 019c4b54-aad2-7e52-8a3b-...

Generate a readable 20-char password
→ hT9jZDojX6sHRJt8vaKS

Shuffle ["Alice", "Bob", "Charlie"]
→ ["Charlie", "Alice", "Bob"]

Random number between 1 and 100
→ 42
```

## Date & Time

### datetime

Get current time, convert timezones, format datetime, or work with UNIX timestamps.

**Parameters:**
- `action` (enum) — `now`, `convert`, `format`, or `timestamp`
- `timezone` (string, optional) — IANA timezone (e.g., `Asia/Tokyo`, `America/New_York`)
- `datetime` (string, optional) — ISO8601 datetime string for convert/format
- `fromTimezone` (string, optional) — Source timezone for conversion
- `toTimezone` (string, optional) — Target timezone for conversion
- `format` (string, optional) — Output format: `iso`, `date`, `time`, `full`, `short`, date-fns pattern (e.g. `yyyy/MM/dd HH:mm`), or Intl JSON options
- `timestamp` (number, optional) — UNIX timestamp in seconds for timestamp action

**Examples:**
```
What time is it in New York?
→ 2026-02-10T19:00:00-05:00

Convert 1609459200 to ISO8601
→ 2021-01-01T00:00:00Z
```

### date

Perform date arithmetic: difference, add/subtract, get weekday, or convert to wareki (Japanese era).

**Parameters:**
- `action` (enum) — `diff`, `add`, `weekday`, or `wareki`
- `date` (string) — Date string (ISO8601)
- `date2` (string, optional) — Second date for diff
- `amount` (number, optional) — Amount to add
- `unit` (enum, optional) — `days`, `months`, `years`, `hours`, `minutes`

**Examples:**
```
What's 100 days after 2026-02-11?
→ 2026-05-22

Difference between 2026-01-01 and 2026-12-31
→ 364 days

What day of the week is 2026-02-11?
→ Wednesday (水曜日)
```

### cron_parse

Parse cron expressions into human-readable descriptions and get next occurrences.

**Parameters:**
- `expression` (string) — Cron expression (5 fields: min hour dom mon dow). Supports weekday names (`MON`–`SUN`), month names (`JAN`–`DEC`), ranges (`MON-FRI`, `JAN-MAR`), and aliases (`@daily`, `@hourly`, `@weekly`, `@monthly`, `@yearly`)
- `count` (number, optional) — Number of next occurrences to return (default: 5)
- `timezone` (string, optional) — IANA timezone (default: UTC)

**Examples:**
```
When does "30 9 * * 1-5" run?
→ Mon–Fri at 9:30, next runs: ...

When does "0 9 * * MON-FRI" run?
→ Mon–Fri at 9:00

When does "0 0 1 JAN-MAR *" run?
→ 1st of Jan, Feb, Mar at midnight
```

## Text Processing

### hash

Compute hashes, checksums, or HMAC signatures: MD5, SHA-1, SHA-256, SHA-512, CRC32 (non-cryptographic checksum).

::: warning Security Notice
MD5 and SHA-1 (`sha1`) are cryptographically weak. Use SHA-256 or SHA-512 for security-sensitive applications.
:::

**Parameters:**
- `input` (string) — String to hash
- `algorithm` (enum) — `md5`, `sha1`, `sha256`, `sha512`, or `crc32` (`crc32` is supported only with `action=hash`, not with `action=hmac`)
- `action` (enum, optional) — `hash` (default) or `hmac`
- `key` (string, optional) — Secret key for HMAC (required when action=hmac; HMAC is not available with `crc32`)

**Examples:**
```
SHA-256 hash of "password123"
→ ef92b778bafe771e89245b89ec...

HMAC-SHA256 of "message" with key "secret"
→ 8b5f48702995c159...

MD5 of "hello world" (MD5 is cryptographically weak; avoid for security-sensitive uses)
→ 5eb63bbbe01eeed093cb22bb8f5acdc3
```

### base64

Encode or decode Base64 strings.

**Parameters:**
- `input` (string) — String to encode or decode
- `action` (enum) — `encode` or `decode`

**Examples:**
```
Base64 encode "Hello World"
→ SGVsbG8gV29ybGQ=

Base64 decode "eyJhbGciOiJIUzI1NiJ9"
→ {"alg":"HS256"}
```

### encode

URL, HTML entity, or Unicode escape encoding/decoding.

**Parameters:**
- `input` (string) — String to encode or decode
- `action` (enum) — `encode` or `decode`
- `type` (enum) — `url`, `html`, or `unicode`

**Examples:**
```
URL-encode "hello world"
→ hello%20world

HTML-decode "&lt;script&gt;"
→ <script>
```

### regex

Test, match, or replace with regular expressions.

::: tip Security
Patterns are analyzed for potential ReDoS (Regular Expression Denial of Service) vulnerabilities. Catastrophic backtracking patterns are detected and rejected.
:::

**Parameters:**
- `pattern` (string) — Regular expression pattern
- `flags` (string, optional) — Regex flags (g, i, m, etc.)
- `text` (string) — Text to search
- `action` (enum) — `match`, `test`, `replace`, or `matchAll`
- `replacement` (string, optional) — Replacement string for replace

**Examples:**
```
Extract numbers from "abc123def456"
→ ["123", "456"]

Replace all spaces with dashes in "hello world"
→ "hello-world"
```

### diff

Line diff or Levenshtein distance between two texts.

**Parameters:**
- `text1` (string) — First text
- `text2` (string) — Second text
- `action` (enum, optional) — `diff` (line diff, default) or `distance` (Levenshtein)

**Examples:**
```
Edit distance: "kitten" → "sitting"
→ 3

Line diff between two texts
→ - old line
→ + new line
```

### char_info

Get Unicode information about characters.

**Parameters:**
- `char` (string) — Character(s) to get info about

**Examples:**
```
Unicode info for "€"
→ U+20AC, Currency Symbols

What's the code point for "🌍"?
→ U+1F30D, Miscellaneous Symbols and Pictographs
```

## Validation & Parsing

### json_validate

Validate JSON, CSV, XML, or YAML format.

**Parameters:**
- `input` (string) — String to validate/parse
- `format` (enum) — `json`, `csv`, `xml`, or `yaml`

**Examples:**
```
Is '{"name":"test"}' valid JSON?
→ valid, object, keys: ["name"]

Validate CSV with 3 columns
→ valid, 10 rows, 3 columns
```

### luhn

Validate or generate Luhn check digits (credit cards, etc.).

**Parameters:**
- `number` (string) — Number string to validate or generate check digit for
- `action` (enum, optional) — `validate` (default) or `generate`

**Examples:**
```
Is 4539578763621486 a valid card number?
→ true

Generate check digit for 453957876362148
→ 6
```

### semver

Semantic versioning operations: compare, validate, parse, or check range satisfaction.

Supports common npm-style range patterns: OR (`||`), AND (space-separated), and hyphen ranges. Other npm/semver range features may not be supported.

**Parameters:**
- `action` (enum) — `compare`, `valid`, `satisfies`, or `parse`
- `version` (string) — Semver version string
- `version2` (string, optional) — Second version for compare
- `range` (string, optional) — Version range for satisfies (e.g., `^1.0.0`, `>=1.0.0 <2.0.0`, `1.0.0 - 2.0.0`)

**Examples:**
```
Does 1.5.3 satisfy ^1.0.0?
→ true

Does 1.8.0 satisfy ">=1.5.0 <2.0.0"? (AND range)
→ true

Does 2.1.0 satisfy "^1.0.0 || ^2.0.0"? (OR range)
→ true

Does 1.5.0 satisfy "1.0.0 - 2.0.0"? (hyphen range)
→ true

Compare 2.0.0 and 1.9.9
→ 2.0.0 is greater
```

### ip

IPv4/IPv6 address information, CIDR range calculations, and membership checks.

**Parameters:**
- `action` (enum) — `info`, `contains`, or `range`
- `ip` (string, optional) — IP address
- `cidr` (string, optional) — CIDR notation (e.g., `192.168.1.0/24`)
- `target` (string, optional) — Target IP to check against CIDR

**Examples:**
```
IP range of 192.168.1.0/24?
→ 192.168.1.1 – .254 (254 hosts)

Is 192.168.1.50 in 192.168.1.0/24?
→ true
```

### color

Convert between color formats: HEX ↔ RGB ↔ HSL. Supports alpha channel for transparency.

**Parameters:**
- `color` (string) — Color value: `#hex` (3/4/6/8 digits), `rgb(r,g,b)`, `rgba(r,g,b,a)`, `hsl(h,s%,l%)`, `hsla(h,s%,l%,a)`, or named color
- `to` (enum, optional) — `hex`, `rgb`, or `hsl` (returns all if omitted)

**Examples:**
```
Convert #FF5733 to RGB
→ rgb(255, 87, 51)

Convert rgb(100, 200, 50) to HSL
→ hsl(100, 60%, 49%)

Convert #FF573380 to RGBA (8-digit HEX with alpha)
→ rgba(255, 87, 51, 0.5019607843137255)

Convert rgba(255, 0, 0, 0.5) to 8-digit HEX
→ #ff000080
```

### jwt_decode

Decode JWT tokens (header + payload, no signature verification).

**Parameters:**
- `token` (string) — JWT token to decode

**Examples:**
```
Decode this JWT: eyJhbGci...
→ { header: { alg: "HS256" }, payload: { name: "John Doe" } }
```

### url_parse

Parse URLs into components.

**Parameters:**
- `url` (string) — URL to parse

**Examples:**
```
Parse https://example.com/search?q=hello
→ host: example.com, pathname: /search, q: "hello"
```

---

## Tool Categories Summary

| Category | Count | Tools |
|----------|-------|-------|
| Math & Numbers | 4 | math, count, base, convert |
| Random | 1 | random (5 types) |
| Date & Time | 3 | datetime, date, cron_parse |
| Text Processing | 6 | hash, base64, encode, regex, diff, char_info |
| Validation & Parsing | 7 | json_validate, luhn, semver, ip, color, jwt_decode, url_parse |

**Total: 21 tools**
