import { describe, expect, test } from "bun:test";
import { execute } from "../../src/tools/char_info.js";

describe("char_info", () => {
	test("ASCII character", () => {
		const result = JSON.parse(execute({ char: "A" }));
		expect(result[0].codePoints[0].hex).toBe("U+0041");
		expect(result[0].codePoints[0].category).toBe("Letter");
		expect(result[0].codePoints[0].block).toBe("Basic Latin");
	});

	test("Japanese hiragana", () => {
		const result = JSON.parse(execute({ char: "あ" }));
		expect(result[0].codePoints[0].hex).toBe("U+3042");
		expect(result[0].codePoints[0].block).toBe("Hiragana");
	});

	test("emoji", () => {
		const result = JSON.parse(execute({ char: "😀" }));
		expect(result[0].codePoints[0].hex).toBe("U+1F600");
		expect(result[0].codePoints[0].category).toBe("Symbol");
	});

	test("CJK ideograph", () => {
		const result = JSON.parse(execute({ char: "漢" }));
		expect(result[0].codePoints[0].block).toBe("CJK Unified Ideographs");
	});

	test("multiple characters", () => {
		const result = JSON.parse(execute({ char: "AB" }));
		expect(result).toHaveLength(2);
		expect(result[0].codePoints[0].hex).toBe("U+0041");
		expect(result[1].codePoints[0].hex).toBe("U+0042");
	});

	test("surrogate pair character", () => {
		const result = JSON.parse(execute({ char: "𠮷" }));
		expect(result[0].codePoints[0].decimal).toBe(0x20bb7);
	});
});
