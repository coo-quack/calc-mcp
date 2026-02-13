# Examples

Ask in natural language — the AI picks the right tool automatically. Here are real examples you can try:

## Math & Numbers

### Calculations

```
What's 10 + 34 × 341 ÷ 23?
→ 514.087 (math)

Calculate sqrt(144) + 2^8
→ 268 (math)

What's the sum of [10, 20, 30, 40, 50]?
→ 150 (math)
```

### Statistics

```
Calculate mean and stddev of [1, 2, 3, 4, 5]
→ { mean: 3, median: 3, stddev: 1.414, min: 1, max: 5 } (math)

What's the median of [100, 50, 200, 75, 150]?
→ 100 (math)
```

### Base Conversion

```
Convert 255 to binary
→ 11111111 (base)

Convert FF from hex to decimal
→ 255 (base)

Convert 12 from decimal to base 5
→ 22 (base)
```

### Card Validation

```
Is 4539578763621486 a valid card number?
→ true (luhn)

Generate check digit for 453957876362148
→ 6 (luhn)
```

## Text & Encoding

### Counting

```
How many characters in "Hello, World! 🌍"?
→ 15 chars, 18 bytes (count)

Count words in "The quick brown fox jumps"
→ 5 words (count)

How many lines in this text? (multiline input)
→ 10 lines (count)
```

### Base64

```
Base64 encode "Hello World"
→ SGVsbG8gV29ybGQ= (base64)

Base64 decode "eyJhbGciOiJIUzI1NiJ9"
→ {"alg":"HS256"} (base64)
```

### URL Encoding

```
URL-encode "hello world"
→ hello%20world (encode)

URL-decode "hello%20world"
→ "hello world" (encode)

HTML-encode "<script>alert('XSS')</script>"
→ &lt;script&gt;alert(&#39;XSS&#39;)&lt;/script&gt; (encode)

HTML-decode "&lt;script&gt;"
→ <script> (encode)
```

### Hashing

```
SHA-256 hash of "password123"
→ ef92b778bafe771e89b862eebf... (hash)

HMAC-SHA256 of "message" with key "secret"
→ 8b5f48702995c159... (hash with action=hmac)

MD5 of "hello world" (⚠️ warning about MD5 weakness is logged on the server, not included in the tool result)
→ 5eb63bbbe01eeed093cb22bb8f5acdc3 (hash)

CRC32 checksum of "test"
→ d87f7e0c (hash)
```

## Date & Time

### Current Time

```
What time is it in New York?
→ 2026-02-10T19:00:00-05:00 (datetime)

What time is it in Tokyo?
→ 2026-02-11T09:00:00+09:00 (datetime)

What's the current UNIX timestamp?
→ 1707638400 (datetime)
```

### Date Arithmetic

```
What's 100 days after 2026-02-11?
→ 2026-05-22 (date)

What's 30 days before 2026-03-01?
→ 2026-01-30 (date)

Add 6 months to 2026-01-15
→ 2026-07-15 (date)
```

### Date Differences

```
How many days between 2026-01-01 and 2026-12-31?
→ 364 days (date)

Difference in months between 2025-01-01 and 2026-01-01
→ 12 months (date)
```

### Weekdays

```
What day of the week is 2026-02-11?
→ Wednesday (水曜日) (date)
```

### Cron Expressions

```
When does "30 9 * * 1-5" run?
→ Mon–Fri at 9:30 (cron_parse)

Parse "0 0 1 * *"
→ Monthly on the 1st at midnight (cron_parse)

Next 5 runs of "*/15 * * * *"
→ Every 15 minutes: 10:00, 10:15, 10:30... (cron_parse)
```

## Generation

### UUIDs

```
Generate a UUID v4
→ 550e8400-e29b-41d4-a716-446655440000 (random)

Generate a UUID v7 (time-ordered)
→ 019c4b54-aad2-7e52-8a3b-... (random)

Generate a ULID
→ 01HN8B6ZK9PQRSTVWXY0123456 (random)
```

### Passwords

```
Generate a 20-character password
→ hT9jZDojX6sHRJt8vaKS (random)

Generate a readable password (no ambiguous chars)
→ rTbPkWnF8sHuDxYz (random)

Generate a 16-char password with only letters and numbers
→ aB3dE5fG7hJ9kL2m (random)

Generate a password without symbols
→ xYz4AbC8DeFgHiJk (random)
```

### Random Numbers

```
Random number between 1 and 100
→ 42 (random)

Random number between 1 and 6 (dice roll)
→ 4 (random)
```

### Shuffle

```
Shuffle ["Alice", "Bob", "Charlie"]
→ ["Charlie", "Alice", "Bob"] (random)

Randomize order: ["A", "B", "C", "D", "E"]
→ ["D", "A", "E", "B", "C"] (random)
```

## Conversion

### Length

```
100 miles in kilometers?
→ 160.93 km (convert)

5 feet in meters?
→ 1.524 m (convert)
```

### Temperature

```
72°F in Celsius?
→ 22.22°C (convert)

100°C in Fahrenheit?
→ 212°F (convert)

300 Kelvin in Celsius?
→ 26.85°C (convert)
```

### Weight

```
10 pounds in kilograms?
→ 4.536 kg (convert)

500 grams in ounces?
→ 17.637 oz (convert)
```

### Area (including Japanese units)

```
10 tsubo in square meters?
→ 33.06 m² (convert)

100 m² in tatami?
→ 60.5 tatami (convert)

1 acre in square meters?
→ 4046.86 m² (convert)
```

### Data

```
5 GB in megabytes?
→ 5120 MB (convert)

1000 kilobytes in bits?
→ 8192000 bits (convert)
```

### Time

```
3600 seconds in hours?
→ 1 hour (convert)

2 weeks in days?
→ 14 days (convert)

1000000 milliseconds in minutes?
→ 16.667 minutes (convert)
```

## Analysis & Parsing

### Regular Expressions

```
Extract numbers from "abc123def456"
→ ["123", "456"] (regex)

Does "hello@example.com" match an email pattern?
→ true (regex)

Replace all spaces with dashes in "hello world"
→ "hello-world" (regex)
```

### Text Diff

```
Edit distance: "kitten" → "sitting"
→ 3 (diff)

Line diff between two code snippets
→ - old line
→ + new line
→   unchanged line
(diff)
```

### IP Addresses

```
IP range of 192.168.1.0/24?
→ 192.168.1.1 – .254 (254 hosts) (ip)

Is 192.168.1.50 in 192.168.1.0/24?
→ true (ip)

Parse IPv6 address 2001:db8::1
→ { version: 6, address: "2001:0db8:0000:..." } (ip)
```

### Colors

```
Convert #FF5733 to RGB
→ rgb(255, 87, 51) (color)

Convert rgb(100, 200, 50) to HSL
→ hsl(100, 60%, 49%) (color)

Convert hsl(120, 100%, 50%) to HEX
→ #00FF00 (color)

Convert #FF573380 to RGBA (8-digit HEX with 50% opacity)
→ rgba(255, 87, 51, 0.5019607843137255) (color)

Convert rgba(255, 0, 0, 0.5) to 8-digit HEX
→ #ff000080 (color)
```

### Semver

```
Does 1.5.3 satisfy ^1.0.0?
→ true (semver)

Does 1.8.0 satisfy ">=1.5.0 <2.0.0"? (AND range)
→ true (semver)

Does 2.1.0 satisfy "^1.0.0 || ^2.0.0"? (OR range)
→ true (semver)

Does 1.5.0 satisfy "1.0.0 - 2.0.0"? (hyphen range)
→ true (semver)

Compare 2.0.0 and 1.9.9
→ 2.0.0 is greater (semver)

Is "1.2.3-beta.1" a valid semver?
→ true (semver)
```

## Decode & Parse

### JSON Validation

```
Is '{"name":"test"}' valid JSON?
→ valid, object, keys: ["name"] (json_validate)

Validate CSV with 3 columns
→ valid, 10 rows, 3 columns (json_validate)

Is this valid XML? (XML input)
→ valid (json_validate)
```

### JWT Decoding

```
Decode this JWT: eyJhbGci...
→ { 
    header: { alg: "HS256", typ: "JWT" }, 
    payload: { sub: "1234567890", name: "John Doe" } 
  }
(jwt_decode)
```

### URL Parsing

```
Parse https://example.com/search?q=hello&lang=en
→ {
    host: "example.com",
    pathname: "/search",
    searchParams: { q: "hello", lang: "en" }
  }
(url_parse)

Extract query params from https://api.github.com/search?q=mcp&sort=stars
→ { q: "mcp", sort: "stars" } (url_parse)
```

### Unicode Info

```
Unicode info for "€"
→ U+20AC, Currency Symbols (char_info)

What's the code point for "🌍"?
→ U+1F30D, Miscellaneous Symbols and Pictographs (char_info)

Character info for "あ"
→ U+3042, Hiragana (char_info)
```

---

## Tips for Natural Language Queries

The AI automatically selects the right tool based on your question. For best results:

1. **Be specific** — "Convert 100°F to Celsius" is better than "temperature conversion"
2. **Include units** — "5 miles in km" is clearer than "5 miles"
3. **Use examples** — "Extract numbers from 'abc123'" shows what you want
4. **Ask naturally** — The AI understands conversational queries

Try asking in your own words — the AI will figure it out! 🚀
