/**
 * E2E test: starts the MCP server via `npx @coo-quack/calc-mcp` and exercises
 * every tool action through the real MCP JSON-RPC protocol over stdio.
 *
 * Runs on Node.js only (no Bun required) to match real user environments.
 * Usage: node --test tests/e2e/mcp-server.test.mjs
 */
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "../..");

let client;
let transport;

before(async () => {
	transport = new StdioClientTransport({
		command: "node",
		args: [resolve(projectRoot, "dist/index.js")],
	});
	client = new Client({ name: "e2e-test", version: "1.0.0" });
	await client.connect(transport);
});

after(async () => {
	await client.close();
});

async function callTool(name, args) {
	const result = await client.callTool({ name, arguments: args });
	const content = result.content;
	assert.ok(content, `${name}: content should be defined`);
	assert.ok(content.length > 0, `${name}: content should not be empty`);
	assert.equal(content[0].type, "text");
	return content[0].text;
}

// ─── Tool listing ───

describe("MCP Server E2E", () => {
	it("lists all 21 tools", async () => {
		const result = await client.listTools();
		assert.equal(result.tools.length, 21);
		const names = result.tools.map((t) => t.name).sort();
		assert.deepEqual(names, [
			"base", "base64", "char_info", "color", "convert", "count",
			"cron_parse", "date", "datetime", "diff", "encode", "hash",
			"ip", "json_validate", "jwt_decode", "luhn", "math", "random",
			"regex", "semver", "url_parse",
		]);
	});

	// ─── math ───

	it("math — eval", async () => {
		const text = await callTool("math", { expression: "2 + 3 * 4" });
		assert.ok(text.includes("14"));
	});

	it("math — statistics", async () => {
		const text = await callTool("math", { action: "statistics", values: [1, 2, 3, 4, 5] });
		assert.ok(text.includes("3")); // mean
	});

	// ─── hash ───

	it("hash — md5", async () => {
		const text = await callTool("hash", { input: "hello", algorithm: "md5" });
		assert.equal(text, "5d41402abc4b2a76b9719d911017c592");
	});

	it("hash — sha1", async () => {
		const text = await callTool("hash", { input: "hello", algorithm: "sha1" });
		assert.equal(text, "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d");
	});

	it("hash — sha256", async () => {
		const text = await callTool("hash", { input: "hello", algorithm: "sha256" });
		assert.equal(text, "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
	});

	it("hash — sha512", async () => {
		const text = await callTool("hash", { input: "hello", algorithm: "sha512" });
		assert.ok(text.startsWith("9b71d224bd62f378"));
	});

	it("hash — crc32", async () => {
		const text = await callTool("hash", { input: "hello", algorithm: "crc32" });
		assert.equal(text, "3610a686");
	});

	// ─── base64 ───

	it("base64 — encode", async () => {
		const text = await callTool("base64", { input: "Hello, World!", action: "encode" });
		assert.equal(text, "SGVsbG8sIFdvcmxkIQ==");
	});

	it("base64 — decode", async () => {
		const text = await callTool("base64", { input: "SGVsbG8sIFdvcmxkIQ==", action: "decode" });
		assert.equal(text, "Hello, World!");
	});

	// ─── encode ───

	it("encode — URL encode", async () => {
		const text = await callTool("encode", { input: "hello world", type: "url", action: "encode" });
		assert.equal(text, "hello%20world");
	});

	it("encode — URL decode", async () => {
		const text = await callTool("encode", { input: "hello%20world", type: "url", action: "decode" });
		assert.equal(text, "hello world");
	});

	it("encode — HTML encode", async () => {
		const text = await callTool("encode", { input: "<div>", type: "html", action: "encode" });
		assert.equal(text, "&lt;div&gt;");
	});

	it("encode — HTML decode", async () => {
		const text = await callTool("encode", { input: "&lt;div&gt;", type: "html", action: "decode" });
		assert.equal(text, "<div>");
	});

	it("encode — Unicode encode (non-ASCII)", async () => {
		const text = await callTool("encode", { input: "こんにちは", type: "unicode", action: "encode" });
		assert.ok(text.includes("\\u"));
	});

	it("encode — Unicode encode (ASCII)", async () => {
		const text = await callTool("encode", { input: "A", type: "unicode", action: "encode" });
		assert.equal(text, "\\u0041");
	});

	it("encode — Unicode decode", async () => {
		const text = await callTool("encode", { input: "\\u0041", type: "unicode", action: "decode" });
		assert.equal(text, "A");
	});

	// ─── datetime ───

	it("datetime — now", async () => {
		const text = await callTool("datetime", { action: "now" });
		assert.match(text, /\d{4}/);
	});

	it("datetime — format (default ISO)", async () => {
		const text = await callTool("datetime", {
			action: "format",
			datetime: "2026-01-15T10:30:00Z",
		});
		assert.ok(text.includes("2026-01-15"));
	});

	it("datetime — format (date-fns pattern)", async () => {
		const text = await callTool("datetime", {
			action: "format",
			datetime: "2026-01-15T10:30:00Z",
			format: "yyyy/MM/dd",
		});
		assert.equal(text, "2026/01/15");
	});

	it("datetime — format (short)", async () => {
		const text = await callTool("datetime", {
			action: "format",
			datetime: "2026-12-25T10:30:00Z",
			timezone: "UTC",
			format: "short",
		});
		assert.ok(text.includes("Dec") && text.includes("25"));
	});

	it("datetime — convert timezone", async () => {
		const text = await callTool("datetime", {
			action: "convert",
			datetime: "2026-01-15T10:00:00Z",
			toTimezone: "Asia/Tokyo",
		});
		assert.ok(text.includes("19:00") || text.includes("19"));
	});

	it("datetime — timestamp from date", async () => {
		const text = await callTool("datetime", {
			action: "timestamp",
			datetime: "2026-01-01T00:00:00Z",
		});
		assert.ok(text.includes("1767225600"));
	});

	it("datetime — timestamp to date", async () => {
		const text = await callTool("datetime", {
			action: "timestamp",
			timestamp: 1767225600,
		});
		assert.ok(text.includes("2026"));
	});

	// ─── count ───

	it("count — characters", async () => {
		const text = await callTool("count", { text: "Hello" });
		assert.ok(text.includes("5"));
	});

	it("count — words", async () => {
		const text = await callTool("count", { text: "hello world foo" });
		assert.ok(text.includes("3"));
	});

	it("count — grapheme clusters (emoji)", async () => {
		const text = await callTool("count", { text: "👨‍👩‍👧‍👦" });
		assert.ok(text.includes("1"));
	});

	// ─── date ───

	it("date — add days", async () => {
		const text = await callTool("date", {
			action: "add",
			date: "2026-01-01",
			amount: 10,
			unit: "days",
		});
		assert.ok(text.includes("2026-01-11"));
	});

	it("date — diff", async () => {
		const text = await callTool("date", {
			action: "diff",
			date: "2026-01-01",
			date2: "2026-01-31",
			unit: "days",
		});
		assert.ok(text.includes("30"));
	});

	it("date — weekday", async () => {
		const text = await callTool("date", {
			action: "weekday",
			date: "2026-01-01",
		});
		assert.ok(text.toLowerCase().includes("thu"));
	});

	it("date — wareki", async () => {
		const text = await callTool("date", {
			action: "wareki",
			date: "2026-01-01",
		});
		assert.ok(text.includes("令和") || text.includes("8") || text.includes("Reiwa"));
	});

	// ─── regex ───

	it("regex — test (match)", async () => {
		const text = await callTool("regex", {
			action: "test",
			text: "hello123",
			pattern: "\\d+",
		});
		assert.ok(text.toLowerCase().includes("true"));
	});

	it("regex — test (no match)", async () => {
		const text = await callTool("regex", {
			action: "test",
			text: "hello",
			pattern: "\\d+",
		});
		assert.ok(text.toLowerCase().includes("false"));
	});

	it("regex — match", async () => {
		const text = await callTool("regex", {
			action: "match",
			text: "hello123world",
			pattern: "\\d+",
		});
		assert.ok(text.includes("123"));
	});

	it("regex — matchAll", async () => {
		const text = await callTool("regex", {
			action: "matchAll",
			text: "a1b2c3",
			pattern: "\\d",
			flags: "g",
		});
		assert.ok(text.includes("1"));
		assert.ok(text.includes("2"));
		assert.ok(text.includes("3"));
	});

	it("regex — replace", async () => {
		const text = await callTool("regex", {
			action: "replace",
			text: "foo bar baz",
			pattern: "bar",
			replacement: "qux",
		});
		assert.ok(text.includes("foo qux baz"));
	});

	// ─── base ───

	it("base — decimal to hex", async () => {
		const text = await callTool("base", { value: "255", from: 10, to: 16 });
		assert.ok(text.toLowerCase().includes("ff"));
	});

	it("base — binary to decimal", async () => {
		const text = await callTool("base", { value: "1010", from: 2, to: 10 });
		assert.ok(text.includes("10"));
	});

	it("base — hex to binary", async () => {
		const text = await callTool("base", { value: "ff", from: 16, to: 2 });
		assert.ok(text.includes("11111111"));
	});

	// ─── diff ───

	it("diff — text diff", async () => {
		const text = await callTool("diff", { text1: "hello", text2: "hallo" });
		assert.ok(text.length > 0);
	});

	it("diff — levenshtein distance", async () => {
		const text = await callTool("diff", { text1: "kitten", text2: "sitting", action: "distance" });
		assert.ok(text.includes("3"));
	});

	// ─── json_validate ───

	it("json_validate — valid JSON with schema", async () => {
		const text = await callTool("json_validate", {
			input: '{"name": "test"}',
			schema: '{"type": "object", "properties": {"name": {"type": "string"}}, "required": ["name"]}',
		});
		assert.ok(text.toLowerCase().includes("valid"));
	});

	it("json_validate — invalid JSON", async () => {
		const text = await callTool("json_validate", {
			input: "{broken",
		});
		assert.ok(text.toLowerCase().includes("invalid") || text.toLowerCase().includes("error"));
	});

	// ─── cron_parse ───

	it("cron_parse — every minute", async () => {
		const text = await callTool("cron_parse", { expression: "* * * * *" });
		assert.ok(text.toLowerCase().includes("minute"));
	});

	it("cron_parse — specific schedule", async () => {
		const text = await callTool("cron_parse", { expression: "0 9 * * 1" });
		assert.ok(text.includes("9") || text.includes("Monday") || text.includes("mon"));
	});

	// ─── luhn ───

	it("luhn — validate (valid)", async () => {
		const text = await callTool("luhn", { number: "4532015112830366" });
		assert.ok(text.toLowerCase().includes("valid"));
	});

	it("luhn — validate (invalid)", async () => {
		const text = await callTool("luhn", { number: "1234567890123456" });
		assert.ok(text.toLowerCase().includes("invalid") || text.toLowerCase().includes("false"));
	});

	it("luhn — generate check digit", async () => {
		const text = await callTool("luhn", { number: "453201511283036", action: "generate" });
		assert.ok(text.includes("6"));
	});

	// ─── ip ───

	it("ip — info", async () => {
		const text = await callTool("ip", { action: "info", ip: "192.168.1.1" });
		assert.ok(text.includes("192.168.1"));
	});

	it("ip — contains (in range)", async () => {
		const text = await callTool("ip", { action: "contains", cidr: "192.168.1.0/24", target: "192.168.1.50" });
		assert.ok(text.toLowerCase().includes("true") || text.toLowerCase().includes("yes") || text.toLowerCase().includes("contain"));
	});

	it("ip — range", async () => {
		const text = await callTool("ip", { action: "range", cidr: "10.0.0.0/8" });
		assert.ok(text.includes("10."));
	});

	// ─── color ───

	it("color — hex to rgb", async () => {
		const text = await callTool("color", { color: "#ff0000", to: "rgb" });
		assert.ok(text.includes("255"));
	});

	it("color — hex to hsl", async () => {
		const text = await callTool("color", { color: "#ff0000", to: "hsl" });
		assert.ok(text.includes("0"));
	});

	it("color — rgb to hex", async () => {
		const text = await callTool("color", { color: "rgb(255, 0, 0)", to: "hex" });
		assert.ok(text.toLowerCase().includes("ff0000") || text.toLowerCase().includes("#ff0000"));
	});

	// ─── convert ───

	it("convert — length (km to mi)", async () => {
		const text = await callTool("convert", { value: 1, from: "km", to: "mi" });
		assert.ok(text.includes("0.6"));
	});

	it("convert — temperature (C to F)", async () => {
		const text = await callTool("convert", { value: 100, from: "C", to: "F" });
		assert.ok(text.includes("212"));
	});

	it("convert — weight (kg to lb)", async () => {
		const text = await callTool("convert", { value: 1, from: "kg", to: "lb" });
		assert.ok(text.includes("2.2"));
	});

	it("convert — data (GB to MB)", async () => {
		const text = await callTool("convert", { value: 1, from: "GB", to: "MB" });
		assert.ok(text.includes("1000") || text.includes("1024"));
	});

	it("convert — time (h to min)", async () => {
		const text = await callTool("convert", { value: 2, from: "h", to: "min" });
		assert.ok(text.includes("120"));
	});

	// ─── char_info ───

	it("char_info — ASCII", async () => {
		const text = await callTool("char_info", { char: "A" });
		assert.ok(text.includes("U+0041"));
	});

	it("char_info — emoji", async () => {
		const text = await callTool("char_info", { char: "🎉" });
		assert.ok(text.includes("U+1F389") || text.includes("PARTY"));
	});

	// ─── jwt_decode ───

	it("jwt_decode — decode token", async () => {
		const token =
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QiLCJpYXQiOjE1MTYyMzkwMjJ9.XXXXXXX";
		const text = await callTool("jwt_decode", { token });
		assert.ok(text.includes("HS256"));
		assert.ok(text.includes("1234567890"));
	});

	// ─── url_parse ───

	it("url_parse — full URL", async () => {
		const text = await callTool("url_parse", {
			url: "https://user:pass@example.com:8080/path?q=test#hash",
		});
		assert.ok(text.includes("example.com"));
		assert.ok(text.includes("8080"));
		assert.ok(text.includes("q=test") || text.includes("test"));
	});

	// ─── semver ───

	it("semver — compare (less than)", async () => {
		const text = await callTool("semver", {
			action: "compare",
			version: "1.2.3",
			version2: "1.3.0",
		});
		assert.ok(text.includes("-1"));
	});

	it("semver — compare (greater than)", async () => {
		const text = await callTool("semver", {
			action: "compare",
			version: "2.0.0",
			version2: "1.9.9",
		});
		assert.ok(text.includes("1"));
	});

	it("semver — valid", async () => {
		const text = await callTool("semver", {
			action: "valid",
			version: "1.2.3",
		});
		assert.ok(text.includes("1.2.3") || text.toLowerCase().includes("valid"));
	});

	it("semver — satisfies", async () => {
		const text = await callTool("semver", {
			action: "satisfies",
			version: "1.2.3",
			range: "^1.0.0",
		});
		assert.ok(text.toLowerCase().includes("true") || text.toLowerCase().includes("satisf"));
	});

	// ─── random ───

	it("random — UUID v4", async () => {
		const text = await callTool("random", { type: "uuid" });
		assert.match(text, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
	});

	it("random — UUID v7", async () => {
		const text = await callTool("random", { type: "uuid", uuidVersion: "v7" });
		assert.match(text, /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
	});

	it("random — ULID", async () => {
		const text = await callTool("random", { type: "ulid" });
		assert.match(text, /^[0-9A-Z]{26}$/);
	});

	it("random — password", async () => {
		const text = await callTool("random", { type: "password", length: 20 });
		assert.equal(text.length, 20);
	});

	it("random — password (readable)", async () => {
		const text = await callTool("random", { type: "password", length: 16, readable: true });
		assert.equal(text.length, 16);
		// readable mode excludes ambiguous chars: l, 1, I, O, 0, o
		assert.ok(!text.includes("l") && !text.includes("I") && !text.includes("O"));
	});

	it("random — number", async () => {
		const text = await callTool("random", { type: "number", min: 1, max: 100 });
		const num = Number(text);
		assert.ok(num >= 1 && num <= 100);
	});

	it("random — number (min equals max)", async () => {
		const text = await callTool("random", { type: "number", min: 42, max: 42 });
		assert.equal(Number(text), 42);
	});

	it("random — shuffle", async () => {
		const text = await callTool("random", { type: "shuffle", items: ["a", "b", "c", "d"] });
		assert.ok(text.includes("a") && text.includes("b") && text.includes("c") && text.includes("d"));
	});
});
