import { z } from "zod";
import type { ToolDefinition } from "../index.js";

const schema = {
	input: z.string().describe("String to hash"),
	algorithm: z
		.enum(["md5", "sha1", "sha256", "sha512", "crc32"])
		.describe("Hash algorithm to use"),
};

const inputSchema = z.object(schema);
type Input = z.infer<typeof inputSchema>;

function crc32(str: string): string {
	let crc = 0xffffffff;
	const table = new Uint32Array(256);
	for (let i = 0; i < 256; i++) {
		let c = i;
		for (let j = 0; j < 8; j++) {
			c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		}
		table[i] = c;
	}
	const bytes = new TextEncoder().encode(str);
	for (const byte of bytes) {
		crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
	}
	return ((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, "0");
}

export function execute(input: Input): string {
	if (input.algorithm === "crc32") {
		return crc32(input.input);
	}
	const hasher = new Bun.CryptoHasher(input.algorithm);
	hasher.update(input.input);
	return hasher.digest("hex");
}

export const tool: ToolDefinition = {
	name: "hash",
	description:
		"Compute hash of a string using MD5, SHA1, SHA256, SHA512, or CRC32",
	schema,
	handler: async (args: Record<string, unknown>) => {
		const input = inputSchema.parse(args);
		return execute(input);
	},
};
