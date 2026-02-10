import { describe, expect, test } from "bun:test";
import { execute } from "../../src/tools/regex.js";

describe("regex", () => {
	test("test returns match result", () => {
		const result = JSON.parse(
			execute({ pattern: "\\d+", text: "abc123", action: "test" }),
		);
		expect(result.match).toBe(true);
	});

	test("test returns false when no match", () => {
		const result = JSON.parse(
			execute({ pattern: "\\d+", text: "abc", action: "test" }),
		);
		expect(result.match).toBe(false);
	});

	test("match returns matches", () => {
		const result = JSON.parse(
			execute({ pattern: "(\\d+)", text: "abc123def", action: "match" }),
		);
		expect(result.matches[0]).toBe("123");
	});

	test("matchAll returns all matches", () => {
		const result = JSON.parse(
			execute({
				pattern: "\\d+",
				flags: "g",
				text: "a1b2c3",
				action: "matchAll",
			}),
		);
		expect(result).toHaveLength(3);
		expect(result[0].match).toBe("1");
		expect(result[2].match).toBe("3");
	});

	test("replace works correctly", () => {
		const result = execute({
			pattern: "world",
			text: "hello world",
			action: "replace",
			replacement: "earth",
		});
		expect(result).toBe("hello earth");
	});

	test("matchAll requires g flag", () => {
		expect(() =>
			execute({ pattern: "\\d+", text: "abc", action: "matchAll" }),
		).toThrow("matchAll requires the 'g' flag");
	});

	test("works with flags", () => {
		const result = JSON.parse(
			execute({
				pattern: "hello",
				flags: "i",
				text: "Hello World",
				action: "test",
			}),
		);
		expect(result.match).toBe(true);
	});
});
