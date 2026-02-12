import { z } from "zod";
import type { ToolDefinition } from "../index.js";

const schema = {
	input: z.string().describe("String to encode or decode"),
	action: z.enum(["encode", "decode"]).describe("Whether to encode or decode"),
	type: z.enum(["url", "html", "unicode"]).describe("Encoding type"),
};

const inputSchema = z.object(schema);
type Input = z.infer<typeof inputSchema>;

const HTML_ENCODE_MAP: Record<string, string> = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#39;",
};

const HTML_DECODE_MAP: Record<string, string> = {
	"&amp;": "&",
	"&lt;": "<",
	"&gt;": ">",
	"&quot;": '"',
	"&#39;": "'",
	"&#x27;": "'",
	"&apos;": "'",
};

function htmlEncode(str: string): string {
	return str.replace(/[&<>"']/g, (ch) => HTML_ENCODE_MAP[ch] ?? ch);
}

function htmlDecode(str: string): string {
	return str.replace(
		/&(?:amp|lt|gt|quot|apos|#39|#x27);/g,
		(entity) => HTML_DECODE_MAP[entity] ?? entity,
	);
}

function unicodeEncode(str: string): string {
	return Array.from(str)
		.map((ch) => {
			const code = ch.codePointAt(0) as number;
			if (code > 0xffff) {
				return `\\u{${code.toString(16)}}`;
			}
			return `\\u${code.toString(16).padStart(4, "0")}`;
		})
		.join("");
}

function unicodeDecode(str: string): string {
	return str
		.replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, hex) =>
			String.fromCodePoint(Number.parseInt(hex, 16)),
		)
		.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
			String.fromCharCode(Number.parseInt(hex, 16)),
		);
}

export function execute(input: Input): string {
	switch (input.type) {
		case "url":
			return input.action === "encode"
				? encodeURIComponent(input.input)
				: decodeURIComponent(input.input);
		case "html":
			return input.action === "encode"
				? htmlEncode(input.input)
				: htmlDecode(input.input);
		case "unicode":
			return input.action === "encode"
				? unicodeEncode(input.input)
				: unicodeDecode(input.input);
	}
}

export const tool: ToolDefinition = {
	name: "encode",
	description: "Encode or decode strings using URL, HTML, or Unicode encoding",
	schema,
	handler: async (args: Record<string, unknown>) => {
		const input = inputSchema.parse(args);
		return execute(input);
	},
};
