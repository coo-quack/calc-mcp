import { z } from "zod";
import type { ToolDefinition } from "../index.js";

const schema = {
	char: z.string().describe("Character(s) to get info about"),
};

const inputSchema = z.object(schema);
type Input = z.infer<typeof inputSchema>;

interface UnicodeBlock {
	start: number;
	end: number;
	name: string;
}

const BLOCKS: UnicodeBlock[] = [
	{ start: 0x0000, end: 0x007f, name: "Basic Latin" },
	{ start: 0x0080, end: 0x00ff, name: "Latin-1 Supplement" },
	{ start: 0x0100, end: 0x024f, name: "Latin Extended-A/B" },
	{ start: 0x0370, end: 0x03ff, name: "Greek and Coptic" },
	{ start: 0x0400, end: 0x04ff, name: "Cyrillic" },
	{ start: 0x2000, end: 0x206f, name: "General Punctuation" },
	{ start: 0x2070, end: 0x209f, name: "Superscripts and Subscripts" },
	{ start: 0x20a0, end: 0x20cf, name: "Currency Symbols" },
	{ start: 0x2100, end: 0x214f, name: "Letterlike Symbols" },
	{ start: 0x2190, end: 0x21ff, name: "Arrows" },
	{ start: 0x2200, end: 0x22ff, name: "Mathematical Operators" },
	{ start: 0x2600, end: 0x26ff, name: "Miscellaneous Symbols" },
	{ start: 0x2700, end: 0x27bf, name: "Dingbats" },
	{ start: 0x3000, end: 0x303f, name: "CJK Symbols and Punctuation" },
	{ start: 0x3040, end: 0x309f, name: "Hiragana" },
	{ start: 0x30a0, end: 0x30ff, name: "Katakana" },
	{ start: 0x4e00, end: 0x9fff, name: "CJK Unified Ideographs" },
	{ start: 0xac00, end: 0xd7af, name: "Hangul Syllables" },
	{ start: 0xf900, end: 0xfaff, name: "CJK Compatibility Ideographs" },
	{ start: 0xff00, end: 0xffef, name: "Halfwidth and Fullwidth Forms" },
	{ start: 0x10000, end: 0x1007f, name: "Linear B Syllabary" },
	{
		start: 0x1f300,
		end: 0x1f5ff,
		name: "Miscellaneous Symbols and Pictographs",
	},
	{ start: 0x1f600, end: 0x1f64f, name: "Emoticons" },
	{ start: 0x1f680, end: 0x1f6ff, name: "Transport and Map Symbols" },
	{
		start: 0x1f900,
		end: 0x1f9ff,
		name: "Supplemental Symbols and Pictographs",
	},
];

function getBlock(codePoint: number): string {
	for (const block of BLOCKS) {
		if (codePoint >= block.start && codePoint <= block.end) {
			return block.name;
		}
	}
	return "Unknown";
}

function getCategory(codePoint: number): string {
	const ch = String.fromCodePoint(codePoint);
	if (/\p{L}/u.test(ch)) return "Letter";
	if (/\p{N}/u.test(ch)) return "Number";
	if (/\p{P}/u.test(ch)) return "Punctuation";
	if (/\p{S}/u.test(ch)) return "Symbol";
	if (/\p{Z}/u.test(ch)) return "Separator";
	if (/\p{M}/u.test(ch)) return "Mark";
	if (/\p{C}/u.test(ch)) return "Control/Other";
	return "Unknown";
}

export function execute(input: Input): string {
	const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
	const segments = [...segmenter.segment(input.char)];

	const results = segments.map((seg) => {
		const grapheme = seg.segment;
		const codePoints = [...grapheme].map((ch) => {
			const cp = ch.codePointAt(0) as number;
			return {
				char: ch,
				codePoint: cp,
				hex: `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`,
				decimal: cp,
				utf8Bytes: new TextEncoder().encode(ch).length,
				block: getBlock(cp),
				category: getCategory(cp),
			};
		});

		return {
			grapheme,
			codePoints,
		};
	});

	return JSON.stringify(results, null, 2);
}

export const tool: ToolDefinition = {
	name: "char_info",
	description:
		"Get Unicode information about characters (code point, block, category)",
	schema,
	handler: async (args: Record<string, unknown>) => {
		const input = inputSchema.parse(args);
		return execute(input);
	},
};
