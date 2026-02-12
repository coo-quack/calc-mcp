import { describe, expect, test } from "bun:test";
import { execute } from "../../src/tools/count.js";

describe("count", () => {
	test("counts English text", () => {
		const result = JSON.parse(execute({ text: "Hello World" }));
		expect(result.characters).toBe(11);
		expect(result.words).toBe(2);
		expect(result.lines).toBe(1);
		expect(result.bytes).toBe(11);
	});

	test("counts Japanese text", () => {
		const result = JSON.parse(execute({ text: "こんにちは世界" }));
		expect(result.characters).toBe(7);
		expect(result.words).toBe(1);
		expect(result.bytes).toBe(21); // 3 bytes per char
	});

	test("counts emoji (grapheme clusters)", () => {
		const result = JSON.parse(execute({ text: "👨‍👩‍👧‍👦" }));
		expect(result.characters).toBe(1); // single grapheme cluster
	});

	test("counts multiline text", () => {
		const result = JSON.parse(execute({ text: "line1\nline2\nline3" }));
		expect(result.lines).toBe(3);
		expect(result.words).toBe(3);
	});

	test("handles empty text", () => {
		const result = JSON.parse(execute({ text: "" }));
		expect(result.characters).toBe(0);
		expect(result.words).toBe(0);
		expect(result.lines).toBe(0);
		expect(result.bytes).toBe(0);
	});

	test("counts shift_jis bytes", () => {
		const result = JSON.parse(
			execute({ text: "Hello世界", encoding: "shift_jis" }),
		);
		expect(result.bytes).toBe(11); // UTF-8 bytes
		expect(result.bytesShiftJis).toBe(9); // 5 + 2*2
	});

	test("counts surrogate pair characters", () => {
		const result = JSON.parse(execute({ text: "𠮷野家" }));
		expect(result.characters).toBe(3);
	});

	test("shift_jis: half-width katakana is 1 byte each", () => {
		const result = JSON.parse(
			execute({ text: "ｱｲｳｴｵ", encoding: "shift_jis" }),
		);
		expect(result.bytesShiftJis).toBe(5);
	});

	test("shift_jis: hiragana is 2 bytes each", () => {
		const result = JSON.parse(
			execute({ text: "あいうえお", encoding: "shift_jis" }),
		);
		expect(result.bytesShiftJis).toBe(10);
	});

	test("shift_jis: mixed ASCII and Japanese", () => {
		const result = JSON.parse(
			execute({ text: "ABC漢字", encoding: "shift_jis" }),
		);
		// ABC = 3 bytes, 漢字 = 2*2 = 4 bytes, total = 7
		expect(result.bytesShiftJis).toBe(7);
	});

	test("shift_jis: yen sign and overline", () => {
		const result = JSON.parse(
			execute({ text: "¥100‾", encoding: "shift_jis" }),
		);
		// ¥ = 1 byte, 100 = 3 bytes, ‾ = 1 byte, total = 5
		expect(result.bytesShiftJis).toBe(5);
	});

	test("shift_jis: non-representable characters (emoji)", () => {
		const result = JSON.parse(
			execute({ text: "Hello😀World", encoding: "shift_jis" }),
		);
		// Hello = 5 bytes, 😀 = 1 byte (replacement), World = 5 bytes, total = 11
		expect(result.bytesShiftJis).toBe(11);
	});

	test("shift_jis: supplementary plane character", () => {
		const result = JSON.parse(
			execute({ text: "𠮷", encoding: "shift_jis" }),
		);
		// Supplementary plane character → 1 byte replacement
		expect(result.bytesShiftJis).toBe(1);
	});
});
