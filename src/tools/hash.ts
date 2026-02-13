import { createHash, createHmac } from "node:crypto";
import { z } from "zod";
import type { ToolDefinition } from "../index.js";

const schema = {
	input: z.string().describe("String to hash"),
	algorithm: z
		.enum(["md5", "sha1", "sha256", "sha512", "crc32"])
		.describe("Hash algorithm to use"),
	action: z
		.enum(["hash", "hmac"])
		.optional()
		.describe("Action: hash (default) or hmac"),
	key: z.string().optional().describe("Secret key for HMAC"),
};

const inputSchema = z.object(schema);
type Input = z.infer<typeof inputSchema>;

// Weak algorithms that should trigger warnings
const WEAK_ALGORITHMS = new Set(["md5", "sha1"]);

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
		crc = table[(crc ^ byte) & 0xff]! ^ (crc >>> 8);
	}
	return ((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, "0");
}

export function execute(input: Input): string {
	const action = input.action ?? "hash";

	// Warn about weak algorithms
	if (WEAK_ALGORITHMS.has(input.algorithm)) {
		console.warn(
			`Warning: ${input.algorithm.toUpperCase()} is cryptographically weak and should not be used for security-sensitive applications. Consider SHA-256 or SHA-512 instead.`,
		);
	}

	if (action === "hmac") {
		if (!input.key) {
			throw new Error("key is required for HMAC");
		}
		if (input.algorithm === "crc32") {
			throw new Error("CRC32 does not support HMAC");
		}
		return createHmac(input.algorithm, input.key)
			.update(input.input)
			.digest("hex");
	}

	// hash (default)
	if (input.algorithm === "crc32") {
		return crc32(input.input);
	}
	return createHash(input.algorithm).update(input.input).digest("hex");
}

export const tool: ToolDefinition = {
	name: "hash",
	description:
		"Compute hash or HMAC of a string using MD5, SHA1, SHA256, SHA512, or CRC32. Note: MD5 and SHA1 are cryptographically weak.",
	schema,
	handler: async (args: Record<string, unknown>) => {
		const input = inputSchema.parse(args);
		return execute(input);
	},
};
