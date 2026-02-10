import { describe, expect, test } from "bun:test";
import { execute } from "../../src/tools/base64.js";

describe("base64", () => {
	test("encode hello", () => {
		expect(execute({ input: "hello", action: "encode" })).toBe("aGVsbG8=");
	});

	test("decode aGVsbG8=", () => {
		expect(execute({ input: "aGVsbG8=", action: "decode" })).toBe("hello");
	});

	test("encode empty string", () => {
		expect(execute({ input: "", action: "encode" })).toBe("");
	});

	test("decode empty string", () => {
		expect(execute({ input: "", action: "decode" })).toBe("");
	});

	test("encode Japanese text", () => {
		const encoded = execute({ input: "こんにちは", action: "encode" });
		expect(encoded).toBe("44GT44KT44Gr44Gh44Gv");
	});

	test("roundtrip with special characters", () => {
		const original = "Hello, World! 🌍 <>&\"'";
		const encoded = execute({ input: original, action: "encode" });
		const decoded = execute({ input: encoded, action: "decode" });
		expect(decoded).toBe(original);
	});
});
