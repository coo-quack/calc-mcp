/**
 * E2E test: starts the MCP server via `node dist/index.js` and exercises
 * every tool through the real MCP JSON-RPC protocol over stdio.
 */
import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

let client: Client;
let transport: StdioClientTransport;

beforeAll(async () => {
	transport = new StdioClientTransport({
		command: "node",
		args: ["dist/index.js"],
		cwd: import.meta.dir + "/../..",
	});
	client = new Client({ name: "e2e-test", version: "1.0.0" });
	await client.connect(transport);
});

afterAll(async () => {
	await client.close();
});

async function callTool(name: string, args: Record<string, unknown>): Promise<string> {
	const result = await client.callTool({ name, arguments: args });
	const content = result.content as Array<{ type: string; text: string }>;
	expect(content).toBeDefined();
	expect(content.length).toBeGreaterThan(0);
	expect(content[0].type).toBe("text");
	return content[0].text;
}

describe("MCP Server E2E", () => {
	test("lists all 21 tools", async () => {
		const result = await client.listTools();
		expect(result.tools.length).toBe(21);
		const names = result.tools.map((t) => t.name).sort();
		expect(names).toEqual([
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

	test("math — evaluates expression", async () => {
		const text = await callTool("math", { expression: "2 + 3 * 4" });
		expect(text).toContain("14");
	});

	test("hash — SHA-256", async () => {
		const text = await callTool("hash", { input: "hello", algorithm: "sha256" });
		expect(text).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
	});

	test("hash — MD5", async () => {
		const text = await callTool("hash", { input: "hello", algorithm: "md5" });
		expect(text).toBe("5d41402abc4b2a76b9719d911017c592");
	});

	test("base64 — encode", async () => {
		const text = await callTool("base64", { input: "Hello, World!", action: "encode" });
		expect(text).toBe("SGVsbG8sIFdvcmxkIQ==");
	});

	test("base64 — decode", async () => {
		const text = await callTool("base64", { input: "SGVsbG8sIFdvcmxkIQ==", action: "decode" });
		expect(text).toBe("Hello, World!");
	});

	test("encode — URL encode", async () => {
		const text = await callTool("encode", { input: "hello world", type: "url", action: "encode" });
		expect(text).toBe("hello%20world");
	});

	test("encode — HTML encode", async () => {
		const text = await callTool("encode", { input: "<div>", type: "html", action: "encode" });
		expect(text).toBe("&lt;div&gt;");
	});

	test("datetime — now", async () => {
		const text = await callTool("datetime", { action: "now" });
		expect(text).toMatch(/\d{4}/);
	});

	test("datetime — format", async () => {
		const text = await callTool("datetime", {
			action: "format",
			datetime: "2026-01-15T10:30:00Z",
		});
		expect(text).toContain("2026-01-15");
	});

	test("count — characters", async () => {
		const text = await callTool("count", { text: "Hello" });
		expect(text).toContain("5");
	});

	test("count — words", async () => {
		const text = await callTool("count", { text: "hello world foo" });
		expect(text).toContain("3");
	});

	test("date — add days", async () => {
		const text = await callTool("date", {
			action: "add",
			date: "2026-01-01",
			amount: 10,
			unit: "days",
		});
		expect(text).toContain("2026-01-11");
	});

	test("date — diff", async () => {
		const text = await callTool("date", {
			action: "diff",
			date: "2026-01-01",
			date2: "2026-01-31",
			unit: "days",
		});
		expect(text).toContain("30");
	});

	test("regex — test match", async () => {
		const text = await callTool("regex", {
			action: "test",
			text: "hello123",
			pattern: "\\d+",
		});
		expect(text.toLowerCase()).toContain("true");
	});

	test("regex — replace", async () => {
		const text = await callTool("regex", {
			action: "replace",
			text: "foo bar baz",
			pattern: "bar",
			replacement: "qux",
		});
		expect(text).toContain("foo qux baz");
	});

	test("base — decimal to hex", async () => {
		const text = await callTool("base", { value: "255", from: 10, to: 16 });
		expect(text.toLowerCase()).toContain("ff");
	});

	test("base — binary to decimal", async () => {
		const text = await callTool("base", { value: "1010", from: 2, to: 10 });
		expect(text).toContain("10");
	});

	test("diff — two strings", async () => {
		const text = await callTool("diff", { text1: "hello", text2: "hallo" });
		expect(text.length).toBeGreaterThan(0);
	});

	test("json_validate — valid JSON", async () => {
		const text = await callTool("json_validate", {
			input: '{"name": "test"}',
			schema: '{"type": "object", "properties": {"name": {"type": "string"}}, "required": ["name"]}',
		});
		expect(text.toLowerCase()).toContain("valid");
	});

	test("cron_parse — every minute", async () => {
		const text = await callTool("cron_parse", { expression: "* * * * *" });
		expect(text.toLowerCase()).toContain("minute");
	});

	test("luhn — valid card number", async () => {
		const text = await callTool("luhn", { number: "4532015112830366" });
		expect(text.toLowerCase()).toContain("valid");
	});

	test("ip — IPv4 info", async () => {
		const text = await callTool("ip", { action: "info", ip: "192.168.1.1" });
		expect(text).toContain("192.168.1");
	});

	test("color — hex to rgb", async () => {
		const text = await callTool("color", { color: "#ff0000", to: "rgb" });
		expect(text).toContain("255");
	});

	test("convert — km to miles", async () => {
		const text = await callTool("convert", { value: 1, from: "km", to: "mi" });
		expect(text).toContain("0.6");
	});

	test("convert — celsius to fahrenheit", async () => {
		const text = await callTool("convert", { value: 100, from: "C", to: "F" });
		expect(text).toContain("212");
	});

	test("char_info — Unicode info", async () => {
		const text = await callTool("char_info", { char: "A" });
		expect(text).toContain("U+0041");
	});

	test("jwt_decode — decode token", async () => {
		const token =
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QiLCJpYXQiOjE1MTYyMzkwMjJ9.XXXXXXX";
		const text = await callTool("jwt_decode", { token });
		expect(text).toContain("HS256");
	});

	test("url_parse — parse URL", async () => {
		const text = await callTool("url_parse", { url: "https://example.com:8080/path?q=test#hash" });
		expect(text).toContain("example.com");
		expect(text).toContain("8080");
	});

	test("semver — compare versions", async () => {
		const text = await callTool("semver", {
			action: "compare",
			version: "1.2.3",
			version2: "1.3.0",
		});
		expect(text).toContain("-1");
	});

	test("random — generate UUID v4", async () => {
		const text = await callTool("random", { type: "uuid" });
		expect(text).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
	});

	test("random — generate password", async () => {
		const text = await callTool("random", { type: "password", length: 16 });
		expect(text.length).toBe(16);
	});
});
