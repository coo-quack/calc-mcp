/**
 * E2E test: starts the MCP server via `node dist/index.js` and exercises
 * every tool through the real MCP JSON-RPC protocol over stdio.
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
		command: "npx",
		args: ["--prefix", "/tmp", "-y", "@coo-quack/calc-mcp"],
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

	it("math — evaluates expression", async () => {
		const text = await callTool("math", { expression: "2 + 3 * 4" });
		assert.ok(text.includes("14"));
	});

	it("hash — SHA-256", async () => {
		const text = await callTool("hash", { input: "hello", algorithm: "sha256" });
		assert.equal(text, "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
	});

	it("hash — MD5", async () => {
		const text = await callTool("hash", { input: "hello", algorithm: "md5" });
		assert.equal(text, "5d41402abc4b2a76b9719d911017c592");
	});

	it("base64 — encode", async () => {
		const text = await callTool("base64", { input: "Hello, World!", action: "encode" });
		assert.equal(text, "SGVsbG8sIFdvcmxkIQ==");
	});

	it("base64 — decode", async () => {
		const text = await callTool("base64", { input: "SGVsbG8sIFdvcmxkIQ==", action: "decode" });
		assert.equal(text, "Hello, World!");
	});

	it("encode — URL encode", async () => {
		const text = await callTool("encode", { input: "hello world", type: "url", action: "encode" });
		assert.equal(text, "hello%20world");
	});

	it("encode — HTML encode", async () => {
		const text = await callTool("encode", { input: "<div>", type: "html", action: "encode" });
		assert.equal(text, "&lt;div&gt;");
	});

	it("datetime — now", async () => {
		const text = await callTool("datetime", { action: "now" });
		assert.match(text, /\d{4}/);
	});

	it("datetime — format", async () => {
		const text = await callTool("datetime", {
			action: "format",
			datetime: "2026-01-15T10:30:00Z",
		});
		assert.ok(text.includes("2026-01-15"));
	});

	it("count — characters", async () => {
		const text = await callTool("count", { text: "Hello" });
		assert.ok(text.includes("5"));
	});

	it("count — words", async () => {
		const text = await callTool("count", { text: "hello world foo" });
		assert.ok(text.includes("3"));
	});

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

	it("regex — test match", async () => {
		const text = await callTool("regex", {
			action: "test",
			text: "hello123",
			pattern: "\\d+",
		});
		assert.ok(text.toLowerCase().includes("true"));
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

	it("base — decimal to hex", async () => {
		const text = await callTool("base", { value: "255", from: 10, to: 16 });
		assert.ok(text.toLowerCase().includes("ff"));
	});

	it("base — binary to decimal", async () => {
		const text = await callTool("base", { value: "1010", from: 2, to: 10 });
		assert.ok(text.includes("10"));
	});

	it("diff — two strings", async () => {
		const text = await callTool("diff", { text1: "hello", text2: "hallo" });
		assert.ok(text.length > 0);
	});

	it("json_validate — valid JSON", async () => {
		const text = await callTool("json_validate", {
			input: '{"name": "test"}',
			schema: '{"type": "object", "properties": {"name": {"type": "string"}}, "required": ["name"]}',
		});
		assert.ok(text.toLowerCase().includes("valid"));
	});

	it("cron_parse — every minute", async () => {
		const text = await callTool("cron_parse", { expression: "* * * * *" });
		assert.ok(text.toLowerCase().includes("minute"));
	});

	it("luhn — valid card number", async () => {
		const text = await callTool("luhn", { number: "4532015112830366" });
		assert.ok(text.toLowerCase().includes("valid"));
	});

	it("ip — IPv4 info", async () => {
		const text = await callTool("ip", { action: "info", ip: "192.168.1.1" });
		assert.ok(text.includes("192.168.1"));
	});

	it("color — hex to rgb", async () => {
		const text = await callTool("color", { color: "#ff0000", to: "rgb" });
		assert.ok(text.includes("255"));
	});

	it("convert — km to miles", async () => {
		const text = await callTool("convert", { value: 1, from: "km", to: "mi" });
		assert.ok(text.includes("0.6"));
	});

	it("convert — celsius to fahrenheit", async () => {
		const text = await callTool("convert", { value: 100, from: "C", to: "F" });
		assert.ok(text.includes("212"));
	});

	it("char_info — Unicode info", async () => {
		const text = await callTool("char_info", { char: "A" });
		assert.ok(text.includes("U+0041"));
	});

	it("jwt_decode — decode token", async () => {
		const token =
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QiLCJpYXQiOjE1MTYyMzkwMjJ9.XXXXXXX";
		const text = await callTool("jwt_decode", { token });
		assert.ok(text.includes("HS256"));
	});

	it("url_parse — parse URL", async () => {
		const text = await callTool("url_parse", {
			url: "https://example.com:8080/path?q=test#hash",
		});
		assert.ok(text.includes("example.com"));
		assert.ok(text.includes("8080"));
	});

	it("semver — compare versions", async () => {
		const text = await callTool("semver", {
			action: "compare",
			version: "1.2.3",
			version2: "1.3.0",
		});
		assert.ok(text.includes("-1"));
	});

	it("random — generate UUID v4", async () => {
		const text = await callTool("random", { type: "uuid" });
		assert.match(text, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
	});

	it("random — generate password", async () => {
		const text = await callTool("random", { type: "password", length: 16 });
		assert.equal(text.length, 16);
	});
});
