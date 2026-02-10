import { describe, expect, test } from "bun:test";
import { execute } from "../../src/tools/diff.js";

describe("diff", () => {
	test("shows added lines", () => {
		const result = execute({ text1: "a\nb", text2: "a\nb\nc" });
		expect(result).toContain("+ c");
	});

	test("shows removed lines", () => {
		const result = execute({ text1: "a\nb\nc", text2: "a\nc" });
		expect(result).toContain("- b");
	});

	test("shows unchanged lines", () => {
		const result = execute({ text1: "a\nb", text2: "a\nb" });
		expect(result).toContain("  a");
		expect(result).toContain("  b");
		expect(result).not.toContain("+");
		expect(result).not.toContain("-");
	});

	test("levenshtein distance", () => {
		const result = JSON.parse(
			execute({ text1: "kitten", text2: "sitting", action: "distance" }),
		);
		expect(result.distance).toBe(3);
	});

	test("levenshtein distance for identical strings", () => {
		const result = JSON.parse(
			execute({ text1: "hello", text2: "hello", action: "distance" }),
		);
		expect(result.distance).toBe(0);
	});

	test("levenshtein distance for empty string", () => {
		const result = JSON.parse(
			execute({ text1: "", text2: "abc", action: "distance" }),
		);
		expect(result.distance).toBe(3);
	});
});
