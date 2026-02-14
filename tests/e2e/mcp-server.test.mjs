/**
 * E2E test: starts the MCP server via `npx @coo-quack/calc-mcp` and exercises
 * every tool action through the real MCP JSON-RPC protocol over stdio.
 *
 * Runs on Node.js only (no Bun required) to match real user environments.
 * Usage: node --test tests/e2e/mcp-server.test.mjs
 */

import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

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

async function callToolRaw(name, args) {
	try {
		const result = await client.callTool({ name, arguments: args });
		const content = result.content;
		if (!content || content.length === 0) return "";
		return content[0].text;
	} catch (e) {
		return e.message || String(e);
	}
}

// ─── Tool listing ───

describe("MCP Server E2E", () => {
	it("lists all 21 tools", async () => {
		const result = await client.listTools();
		assert.equal(result.tools.length, 21);
		const names = result.tools.map((t) => t.name).sort();
		assert.deepEqual(names, [
			"base",
			"base64",
			"char_info",
			"color",
			"convert",
			"count",
			"cron_parse",
			"date",
			"datetime",
			"diff",
			"encode",
			"hash",
			"ip",
			"json_validate",
			"jwt_decode",
			"luhn",
			"math",
			"random",
			"regex",
			"semver",
			"url_parse",
		]);
	});

	// ─── math ───

	it("math — eval", async () => {
		const text = await callTool("math", { expression: "2 + 3 * 4" });
		assert.ok(text.includes("14"));
	});

	it("math — statistics", async () => {
		const text = await callTool("math", {
			action: "statistics",
			values: [1, 2, 3, 4, 5],
		});
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
		const text = await callTool("hash", {
			input: "hello",
			algorithm: "sha256",
		});
		assert.equal(
			text,
			"2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
		);
	});

	it("hash — sha512", async () => {
		const text = await callTool("hash", {
			input: "hello",
			algorithm: "sha512",
		});
		assert.ok(text.startsWith("9b71d224bd62f378"));
	});

	it("hash — crc32", async () => {
		const text = await callTool("hash", { input: "hello", algorithm: "crc32" });
		assert.equal(text, "3610a686");
	});

	// ─── base64 ───

	it("base64 — encode", async () => {
		const text = await callTool("base64", {
			input: "Hello, World!",
			action: "encode",
		});
		assert.equal(text, "SGVsbG8sIFdvcmxkIQ==");
	});

	it("base64 — decode", async () => {
		const text = await callTool("base64", {
			input: "SGVsbG8sIFdvcmxkIQ==",
			action: "decode",
		});
		assert.equal(text, "Hello, World!");
	});

	// ─── encode ───

	it("encode — URL encode", async () => {
		const text = await callTool("encode", {
			input: "hello world",
			type: "url",
			action: "encode",
		});
		assert.equal(text, "hello%20world");
	});

	it("encode — URL decode", async () => {
		const text = await callTool("encode", {
			input: "hello%20world",
			type: "url",
			action: "decode",
		});
		assert.equal(text, "hello world");
	});

	it("encode — HTML encode", async () => {
		const text = await callTool("encode", {
			input: "<div>",
			type: "html",
			action: "encode",
		});
		assert.equal(text, "&lt;div&gt;");
	});

	it("encode — HTML decode", async () => {
		const text = await callTool("encode", {
			input: "&lt;div&gt;",
			type: "html",
			action: "decode",
		});
		assert.equal(text, "<div>");
	});

	it("encode — Unicode encode (non-ASCII)", async () => {
		const text = await callTool("encode", {
			input: "こんにちは",
			type: "unicode",
			action: "encode",
		});
		assert.ok(text.includes("\\u"));
	});

	it("encode — Unicode encode (ASCII)", async () => {
		const text = await callTool("encode", {
			input: "A",
			type: "unicode",
			action: "encode",
		});
		assert.equal(text, "\\u0041");
	});

	it("encode — Unicode decode", async () => {
		const text = await callTool("encode", {
			input: "\\u0041",
			type: "unicode",
			action: "decode",
		});
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
		assert.ok(
			text.includes("令和") || text.includes("8") || text.includes("Reiwa"),
		);
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
		const text = await callTool("diff", {
			text1: "kitten",
			text2: "sitting",
			action: "distance",
		});
		assert.ok(text.includes("3"));
	});

	// ─── json_validate ───

	it("json_validate — valid JSON with schema", async () => {
		const text = await callTool("json_validate", {
			input: '{"name": "test"}',
			schema:
				'{"type": "object", "properties": {"name": {"type": "string"}}, "required": ["name"]}',
		});
		assert.ok(text.toLowerCase().includes("valid"));
	});

	it("json_validate — invalid JSON", async () => {
		const text = await callTool("json_validate", {
			input: "{broken",
		});
		assert.ok(
			text.toLowerCase().includes("invalid") ||
				text.toLowerCase().includes("error"),
		);
	});

	// ─── cron_parse ───

	it("cron_parse — every minute", async () => {
		const text = await callTool("cron_parse", { expression: "* * * * *" });
		assert.ok(text.toLowerCase().includes("minute"));
	});

	it("cron_parse — specific schedule", async () => {
		const text = await callTool("cron_parse", { expression: "0 9 * * 1" });
		assert.ok(
			text.includes("9") || text.includes("Monday") || text.includes("mon"),
		);
	});

	// ─── luhn ───

	it("luhn — validate (valid)", async () => {
		const text = await callTool("luhn", { number: "4532015112830366" });
		assert.ok(text.toLowerCase().includes("valid"));
	});

	it("luhn — validate (invalid)", async () => {
		const text = await callTool("luhn", { number: "1234567890123456" });
		assert.ok(
			text.toLowerCase().includes("invalid") ||
				text.toLowerCase().includes("false"),
		);
	});

	it("luhn — generate check digit", async () => {
		const text = await callTool("luhn", {
			number: "453201511283036",
			action: "generate",
		});
		assert.ok(text.includes("6"));
	});

	// ─── ip ───

	it("ip — info", async () => {
		const text = await callTool("ip", { action: "info", ip: "192.168.1.1" });
		assert.ok(text.includes("192.168.1"));
	});

	it("ip — contains (in range)", async () => {
		const text = await callTool("ip", {
			action: "contains",
			cidr: "192.168.1.0/24",
			target: "192.168.1.50",
		});
		assert.ok(
			text.toLowerCase().includes("true") ||
				text.toLowerCase().includes("yes") ||
				text.toLowerCase().includes("contain"),
		);
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
		const text = await callTool("color", {
			color: "rgb(255, 0, 0)",
			to: "hex",
		});
		assert.ok(
			text.toLowerCase().includes("ff0000") ||
				text.toLowerCase().includes("#ff0000"),
		);
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
		assert.ok(
			text.toLowerCase().includes("true") ||
				text.toLowerCase().includes("satisf"),
		);
	});

	// ─── random ───

	it("random — UUID v4", async () => {
		const text = await callTool("random", { type: "uuid" });
		assert.match(
			text,
			/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
		);
	});

	it("random — UUID v7", async () => {
		const text = await callTool("random", { type: "uuid", uuidVersion: "v7" });
		assert.match(
			text,
			/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
		);
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
		const text = await callTool("random", {
			type: "password",
			length: 16,
			readable: true,
		});
		assert.equal(text.length, 16);
		// readable mode excludes ambiguous chars: l, 1, I, O, 0, o
		assert.ok(
			!text.includes("l") && !text.includes("I") && !text.includes("O"),
		);
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
		const text = await callTool("random", {
			type: "shuffle",
			items: ["a", "b", "c", "d"],
		});
		assert.ok(
			text.includes("a") &&
				text.includes("b") &&
				text.includes("c") &&
				text.includes("d"),
		);
	});

	// ─── Error Handling ───

	it("math — missing expression", async () => {
		const text = await callToolRaw("math", {});
		assert.ok(
			text.toLowerCase().includes("error") ||
				text.toLowerCase().includes("required"),
		);
	});

	it("math — division by zero (1/0)", async () => {
		const text = await callTool("math", { expression: "1/0" });
		assert.ok(text.includes("Infinity"));
	});

	it("math — syntax error '2 +'", async () => {
		const text = await callToolRaw("math", { expression: "2 +" });
		assert.ok(
			text.toLowerCase().includes("error") ||
				text.toLowerCase().includes("syntax"),
		);
	});

	it("hash — empty string", async () => {
		const text = await callTool("hash", { input: "", algorithm: "md5" });
		assert.equal(text, "d41d8cd98f00b204e9800998ecf8427e");
	});

	it("datetime — invalid date string 'not-a-date'", async () => {
		const text = await callToolRaw("datetime", {
			action: "format",
			datetime: "not-a-date",
		});
		assert.ok(
			text.toLowerCase().includes("error") ||
				text.toLowerCase().includes("invalid"),
		);
	});

	it("date — invalid date '2026-13-01'", async () => {
		const text = await callToolRaw("date", {
			action: "weekday",
			date: "2026-13-01",
		});
		assert.ok(
			text.toLowerCase().includes("error") ||
				text.toLowerCase().includes("invalid"),
		);
	});

	it("regex — invalid pattern '[invalid'", async () => {
		const text = await callToolRaw("regex", {
			action: "test",
			text: "test",
			pattern: "[invalid",
		});
		assert.ok(
			text.toLowerCase().includes("error") ||
				text.toLowerCase().includes("invalid"),
		);
	});

	it("convert — unknown unit 'xyz'", async () => {
		const text = await callToolRaw("convert", {
			value: 1,
			from: "xyz",
			to: "km",
		});
		assert.ok(
			text.toLowerCase().includes("error") ||
				text.toLowerCase().includes("unknown") ||
				text.toLowerCase().includes("invalid"),
		);
	});

	it("semver — invalid version 'not.a.version'", async () => {
		const text = await callTool("semver", {
			action: "valid",
			version: "not.a.version",
		});
		assert.ok(
			text.toLowerCase().includes("false") ||
				text.toLowerCase().includes("invalid") ||
				text === "null",
		);
	});

	it("jwt_decode — completely invalid token 'not.a.jwt'", async () => {
		const text = await callToolRaw("jwt_decode", { token: "not.a.jwt" });
		assert.ok(
			text.toLowerCase().includes("error") ||
				text.toLowerCase().includes("invalid"),
		);
	});

	it("random — min > max", async () => {
		const text = await callToolRaw("random", {
			type: "number",
			min: 100,
			max: 10,
		});
		assert.ok(
			text.toLowerCase().includes("error") ||
				text.toLowerCase().includes("invalid"),
		);
	});

	it("ip — invalid IP '999.999.999.999'", async () => {
		const text = await callToolRaw("ip", {
			action: "info",
			ip: "999.999.999.999",
		});
		assert.ok(
			text.toLowerCase().includes("error") ||
				text.toLowerCase().includes("invalid"),
		);
	});

	it("color — invalid color 'notacolor'", async () => {
		const text = await callToolRaw("color", { color: "notacolor", to: "rgb" });
		assert.ok(
			text.toLowerCase().includes("error") ||
				text.toLowerCase().includes("invalid"),
		);
	});

	// ─── Edge Cases ───

	it("base64 — Japanese text roundtrip", async () => {
		const encoded = await callTool("base64", {
			input: "こんにちは",
			action: "encode",
		});
		const decoded = await callTool("base64", {
			input: encoded,
			action: "decode",
		});
		assert.equal(decoded, "こんにちは");
	});

	it("hash — empty string hashes (md5)", async () => {
		const text = await callTool("hash", { input: "", algorithm: "md5" });
		assert.equal(text, "d41d8cd98f00b204e9800998ecf8427e");
	});

	it("hash — Japanese text (multibyte input)", async () => {
		const text = await callTool("hash", {
			input: "東京都",
			algorithm: "sha256",
		});
		assert.ok(text.length === 64); // SHA-256 produces 64 hex chars
	});

	it("count — empty string", async () => {
		const text = await callTool("count", { text: "" });
		assert.ok(text.includes("0"));
	});

	it("count — Japanese text '東京都'", async () => {
		const text = await callTool("count", { text: "東京都" });
		assert.ok(text.includes("3"));
	});

	it("count — shift_jis encoding byte count for 'あいう'", async () => {
		const text = await callTool("count", {
			text: "あいう",
			encoding: "shift_jis",
		});
		assert.ok(text.includes("6")); // 3 chars × 2 bytes in Shift_JIS
	});

	it("math — complex expression with functions", async () => {
		const text = await callTool("math", {
			expression: "sqrt(144) + pow(2, 10)",
		});
		assert.ok(text.includes("1036"));
	});

	it("math — floating point precision '0.1 + 0.2' returns 0.3", async () => {
		const text = await callTool("math", { expression: "0.1 + 0.2" });
		assert.equal(text, "0.3");
	});

	it("date — leap year Feb 29 add 1 year", async () => {
		const text = await callTool("date", {
			action: "add",
			date: "2024-02-29",
			amount: 1,
			unit: "years",
		});
		assert.ok(text.includes("2025-02-28"));
	});

	it("date — wareki era boundary (昭和64)", async () => {
		const text = await callTool("date", {
			action: "wareki",
			date: "1989-01-07",
		});
		assert.ok(text.includes("昭和") && text.includes("64"));
	});

	it("date — wareki era boundary (平成元)", async () => {
		const text = await callTool("date", {
			action: "wareki",
			date: "1989-01-08",
		});
		assert.ok(text.includes("平成") && text.includes("元"));
	});

	it("date — wareki era boundary (令和元)", async () => {
		const text = await callTool("date", {
			action: "wareki",
			date: "2019-05-01",
		});
		assert.ok(text.includes("令和") && text.includes("元"));
	});

	it("convert — same unit (km to km)", async () => {
		const text = await callTool("convert", { value: 1, from: "km", to: "km" });
		assert.ok(text.includes("1"));
	});

	it("convert — zero Celsius to Fahrenheit", async () => {
		const text = await callTool("convert", { value: 0, from: "C", to: "F" });
		assert.ok(text.includes("32"));
	});

	it("convert — negative temperature -40C = -40F", async () => {
		const text = await callTool("convert", { value: -40, from: "C", to: "F" });
		assert.ok(text.includes("-40"));
	});

	it("base — octal conversion (8 to 10, '77' → '63')", async () => {
		const text = await callTool("base", { value: "77", from: 8, to: 10 });
		assert.ok(text.includes("63"));
	});

	it("diff — identical strings", async () => {
		const text = await callTool("diff", { text1: "hello", text2: "hello" });
		// Identical strings should have minimal or empty diff
		assert.ok(text.length < 50); // Should be short
	});

	it("diff — completely different strings", async () => {
		const text = await callTool("diff", {
			text1: "abcdefgh",
			text2: "12345678",
		});
		assert.ok(text.length > 0); // Should have differences
	});

	it("json_validate — CSV format", async () => {
		const text = await callTool("json_validate", {
			input: "name,age\nJohn,30",
			format: "csv",
		});
		assert.ok(text.toLowerCase().includes("valid"));
		assert.ok(text.includes("2")); // 2 rows or 2 columns
	});

	it("json_validate — XML format", async () => {
		const text = await callTool("json_validate", {
			input: "<root><item>test</item></root>",
			format: "xml",
		});
		assert.ok(text.toLowerCase().includes("valid"));
	});

	it("json_validate — YAML format", async () => {
		const text = await callTool("json_validate", {
			input: "name: test\nage: 30",
			format: "yaml",
		});
		assert.ok(text.toLowerCase().includes("valid"));
	});

	it("regex — global replace with flags 'g'", async () => {
		const text = await callTool("regex", {
			action: "replace",
			text: "a1b2c3",
			pattern: "\\d",
			replacement: "X",
			flags: "g",
		});
		assert.ok(text.includes("aXbXcX"));
	});

	it("semver — prerelease version '1.0.0-beta.1' is valid", async () => {
		const text = await callTool("semver", {
			action: "valid",
			version: "1.0.0-beta.1",
		});
		assert.ok(
			text.includes("1.0.0-beta.1") || text.toLowerCase().includes("valid"),
		);
	});

	it("semver — satisfies with prerelease range", async () => {
		const text = await callTool("semver", {
			action: "satisfies",
			version: "1.0.0-beta.1",
			range: ">=1.0.0-beta",
		});
		assert.ok(
			text.toLowerCase().includes("true") ||
				text.toLowerCase().includes("satisf"),
		);
	});

	it("random — password with length 1", async () => {
		const text = await callTool("random", { type: "password", length: 1 });
		assert.equal(text.length, 1);
	});

	it("random — password with no symbols", async () => {
		const text = await callTool("random", {
			type: "password",
			length: 20,
			symbols: false,
		});
		assert.equal(text.length, 20);
		assert.ok(!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(text));
	});

	it("url_parse — minimal URL 'http://a.com'", async () => {
		const text = await callTool("url_parse", { url: "http://a.com" });
		assert.ok(text.includes("a.com"));
	});

	it("url_parse — URL with unicode path", async () => {
		const text = await callTool("url_parse", {
			url: "https://example.com/日本語/パス",
		});
		assert.ok(text.includes("example.com"));
	});

	it("ip — contains - out of range returns false", async () => {
		const text = await callTool("ip", {
			action: "contains",
			cidr: "192.168.1.0/24",
			target: "10.0.0.1",
		});
		assert.ok(
			text.toLowerCase().includes("false") ||
				text.toLowerCase().includes("no") ||
				!text.toLowerCase().includes("true"),
		);
	});

	it("ip — IPv6 info", async () => {
		const text = await callTool("ip", {
			action: "info",
			ip: "2001:4860:4860::8888",
		});
		assert.ok(text.includes("2001") || text.includes("IPv6"));
	});

	it("color — rgb to hsl conversion", async () => {
		const text = await callTool("color", {
			color: "rgb(128, 128, 128)",
			to: "hsl",
		});
		assert.ok(text.toLowerCase().includes("hsl") || text.includes("0"));
	});

	it("color — case-insensitive input (RGB uppercase)", async () => {
		const text = await callTool("color", {
			color: "RGB(255, 0, 0)",
			to: "hex",
		});
		assert.ok(text.toLowerCase().includes("ff0000"));
	});

	it("color — case-insensitive input (HSL uppercase)", async () => {
		const text = await callTool("color", {
			color: "HSL(0, 100%, 50%)",
			to: "hex",
		});
		assert.ok(text.toLowerCase().includes("ff0000"));
	});

	it("char_info — multibyte Japanese character", async () => {
		const text = await callTool("char_info", { char: "漢" });
		assert.ok(text.includes("U+") || text.includes("6F22"));
	});

	// ─── Real-world AI Use Cases ───

	it("datetime — format in Asia/Tokyo timezone with pattern", async () => {
		const text = await callTool("datetime", {
			action: "format",
			datetime: "2026-01-15T10:00:00Z",
			timezone: "Asia/Tokyo",
			format: "yyyy-MM-dd HH:mm:ss",
		});
		assert.ok(text.includes("2026-01-15") && text.includes("19:00"));
	});

	it("datetime — 'what day of the week is 2026-12-25?'", async () => {
		const text = await callTool("date", {
			action: "weekday",
			date: "2026-12-25",
		});
		assert.ok(text.toLowerCase().includes("fri"));
	});

	it("math — percentage calculation '15% of 2500'", async () => {
		const text = await callTool("math", { expression: "2500 * 0.15" });
		assert.ok(text.includes("375"));
	});

	it("math — compound interest '(1 + 0.05)^10 * 1000'", async () => {
		const text = await callTool("math", { expression: "(1 + 0.05)^10 * 1000" });
		const num = parseFloat(text);
		assert.ok(num > 1628 && num < 1629);
	});

	it("count — count bytes of Japanese text (UTF-8: 東京 = 6 bytes)", async () => {
		const text = await callTool("count", { text: "東京" });
		// Default encoding is UTF-8, "bytes" field should be 6 (3 bytes per kanji)
		assert.ok(text.includes('"bytes": 6') || text.includes('"bytes":6'));
	});

	it("hash — verify password hash (same input = same result)", async () => {
		const hash1 = await callTool("hash", {
			input: "mypassword123",
			algorithm: "sha256",
		});
		const hash2 = await callTool("hash", {
			input: "mypassword123",
			algorithm: "sha256",
		});
		assert.equal(hash1, hash2);
	});

	it("base64 — encode URL-unsafe characters", async () => {
		const text = await callTool("base64", {
			input: "hello+world/test=",
			action: "encode",
		});
		const decoded = await callTool("base64", { input: text, action: "decode" });
		assert.equal(decoded, "hello+world/test=");
	});

	it("encode — roundtrip URL encode/decode with special chars", async () => {
		const encoded = await callTool("encode", {
			input: "&foo=bar baz",
			type: "url",
			action: "encode",
		});
		assert.ok(encoded.includes("%"));
		const decoded = await callTool("encode", {
			input: encoded,
			type: "url",
			action: "decode",
		});
		assert.equal(decoded, "&foo=bar baz");
	});

	it("convert — full unit names (kilometer to mile)", async () => {
		const text = await callTool("convert", {
			value: 1,
			from: "kilometer",
			to: "mile",
		});
		assert.ok(text.includes("0.6"));
	});

	it("convert — full unit names (kilogram to pound)", async () => {
		const text = await callTool("convert", {
			value: 1,
			from: "kilogram",
			to: "pound",
		});
		assert.ok(text.includes("2.2"));
	});

	it("convert — plural unit names (meters to feet)", async () => {
		const text = await callTool("convert", {
			value: 1,
			from: "meters",
			to: "feet",
		});
		assert.ok(text.includes("3.28"));
	});

	it("convert — speed (km/h to m/s)", async () => {
		const text = await callTool("convert", {
			value: 100,
			from: "km/h",
			to: "m/s",
		});
		assert.ok(text.includes("27.7") || text.includes("27.8"));
	});

	it("json_validate — validate API response structure", async () => {
		const input = '{"status": "success", "data": {"id": 123, "name": "Test"}}';
		const schema =
			'{"type": "object", "properties": {"status": {"type": "string"}, "data": {"type": "object"}}, "required": ["status", "data"]}';
		const text = await callTool("json_validate", { input, schema });
		assert.ok(text.toLowerCase().includes("valid"));
	});

	it("cron_parse — complex cron (business hours)", async () => {
		const text = await callTool("cron_parse", { expression: "0 9-17 * * 1-5" });
		assert.ok(
			text.includes("9") ||
				text.includes("17") ||
				text.toLowerCase().includes("weekday"),
		);
	});

	it("luhn — validate real-world card format with spaces", async () => {
		const text = await callTool("luhn", { number: "4532 0151 1283 0366" });
		assert.ok(
			text.toLowerCase().includes("valid") ||
				text.toLowerCase().includes("true"),
		);
	});
});
