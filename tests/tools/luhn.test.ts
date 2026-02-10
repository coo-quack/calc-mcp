import { describe, expect, test } from "bun:test";
import { execute } from "../../src/tools/luhn.js";

describe("luhn", () => {
	test("validates correct number", () => {
		const result = JSON.parse(execute({ number: "4539578763621486" }));
		expect(result.valid).toBe(true);
	});

	test("rejects invalid number", () => {
		const result = JSON.parse(execute({ number: "1234567890" }));
		expect(result.valid).toBe(false);
	});

	test("validates with spaces/hyphens stripped", () => {
		const result = JSON.parse(execute({ number: "4539-5787-6362-1486" }));
		expect(result.valid).toBe(true);
	});

	test("generates check digit", () => {
		const result = JSON.parse(
			execute({ number: "453957876362148", action: "generate" }),
		);
		expect(result.checkDigit).toBe(6);
		expect(result.number).toBe("4539578763621486");
	});

	test("generated number validates", () => {
		const gen = JSON.parse(
			execute({ number: "123456789", action: "generate" }),
		);
		const val = JSON.parse(execute({ number: gen.number }));
		expect(val.valid).toBe(true);
	});

	test("rejects non-digit input", () => {
		expect(() => execute({ number: "abcd" })).toThrow();
	});
});
