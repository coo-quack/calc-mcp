import { describe, expect, test } from "bun:test";
import { execute } from "../../src/tools/encode.js";

describe("encode - URL", () => {
	test("encode URL special chars", () => {
		expect(
			execute({ input: "hello world&foo=bar", action: "encode", type: "url" }),
		).toBe("hello%20world%26foo%3Dbar");
	});

	test("decode URL", () => {
		expect(
			execute({
				input: "hello%20world%26foo%3Dbar",
				action: "decode",
				type: "url",
			}),
		).toBe("hello world&foo=bar");
	});

	test("encode Japanese URL", () => {
		const result = execute({
			input: "こんにちは",
			action: "encode",
			type: "url",
		});
		expect(result).toContain("%");
		expect(execute({ input: result, action: "decode", type: "url" })).toBe(
			"こんにちは",
		);
	});
});

describe("encode - HTML", () => {
	test("encode HTML entities", () => {
		expect(
			execute({
				input: '<script>alert("xss")</script>',
				action: "encode",
				type: "html",
			}),
		).toBe("&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;");
	});

	test("decode HTML entities", () => {
		expect(
			execute({
				input: "&lt;div&gt;Hello &amp; World&lt;/div&gt;",
				action: "decode",
				type: "html",
			}),
		).toBe("<div>Hello & World</div>");
	});

	test("encode ampersand and quotes", () => {
		expect(
			execute({
				input: 'Tom & Jerry\'s "show"',
				action: "encode",
				type: "html",
			}),
		).toBe("Tom &amp; Jerry&#39;s &quot;show&quot;");
	});
});

describe("encode - Unicode", () => {
	test("encode Japanese to unicode escapes", () => {
		const result = execute({
			input: "あ",
			action: "encode",
			type: "unicode",
		});
		expect(result).toBe("\\u3042");
	});

	test("decode unicode escapes", () => {
		expect(
			execute({ input: "\\u3042", action: "decode", type: "unicode" }),
		).toBe("あ");
	});

	test("ASCII stays as-is in unicode encode", () => {
		expect(execute({ input: "hello", action: "encode", type: "unicode" })).toBe(
			"hello",
		);
	});

	test("roundtrip unicode", () => {
		const original = "Hello 世界! 🌍";
		const encoded = execute({
			input: original,
			action: "encode",
			type: "unicode",
		});
		const decoded = execute({
			input: encoded,
			action: "decode",
			type: "unicode",
		});
		expect(decoded).toBe(original);
	});
});
