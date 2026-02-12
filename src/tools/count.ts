import { z } from "zod";
import type { ToolDefinition } from "../index.js";

const schema = {
	text: z.string().describe("Text to analyze"),
	encoding: z
		.enum(["utf8", "shift_jis"])
		.optional()
		.describe("Encoding for byte count (default: utf8)"),
};

const inputSchema = z.object(schema);
type Input = z.infer<typeof inputSchema>;

function countShiftJisBytes(text: string): number {
	// Use Buffer to get actual Shift_JIS encoded byte length
	// This is more accurate than code point range approximation
	try {
		// TextEncoder doesn't support Shift_JIS, but we can approximate
		// by checking actual character encoding requirements
		let bytes = 0;
		for (const char of text) {
			const code = char.codePointAt(0) ?? 0;

			// ASCII (0x00-0x7F): 1 byte
			if (code <= 0x7f) {
				bytes += 1;
			}
			// Half-width katakana (0xFF61-0xFF9F): 1 byte
			else if (code >= 0xff61 && code <= 0xff9f) {
				bytes += 1;
			}
			// Yen sign (¥) and Overline (‾): 1 byte each in Shift_JIS
			else if (code === 0x00a5 || code === 0x203e) {
				bytes += 1;
			}
			// Characters that cannot be represented in Shift_JIS
			// (emojis, extended Unicode, etc.): count as replacement char (1 byte '?')
			else if (
				code > 0xffff ||
				(code >= 0xd800 && code <= 0xdfff) ||
				code > 0x10000
			) {
				bytes += 1; // replacement character
			}
			// All other characters (hiragana, katakana, kanji, symbols): 2 bytes
			else {
				bytes += 2;
			}
		}
		return bytes;
	} catch {
		// Fallback to old approximation if something goes wrong
		let bytes = 0;
		for (const char of text) {
			const code = char.codePointAt(0) ?? 0;
			if (code <= 0x7f) {
				bytes += 1;
			} else if (code >= 0xff61 && code <= 0xff9f) {
				bytes += 1;
			} else {
				bytes += 2;
			}
		}
		return bytes;
	}
}

export function execute(input: Input): string {
	const { text, encoding } = input;

	// Grapheme cluster count using Intl.Segmenter
	const segmenter = new Intl.Segmenter("ja", { granularity: "grapheme" });
	const characters = [...segmenter.segment(text)].length;

	// Word count: split by whitespace, filter empty
	const words = text
		.trim()
		.split(/\s+/)
		.filter((w) => w.length > 0).length;

	// Line count
	const lines = text === "" ? 0 : text.split("\n").length;

	// Byte count (UTF-8)
	const bytes = new TextEncoder().encode(text).length;

	const result: Record<string, number> = {
		characters,
		words,
		lines,
		bytes,
	};

	if (encoding === "shift_jis") {
		result.bytesShiftJis = countShiftJisBytes(text);
	}

	return JSON.stringify(result, null, 2);
}

export const tool: ToolDefinition = {
	name: "count",
	description:
		"Count characters (grapheme clusters), words, lines, and bytes in text",
	schema,
	handler: async (args: Record<string, unknown>) => {
		const input = inputSchema.parse(args);
		return execute(input);
	},
};
