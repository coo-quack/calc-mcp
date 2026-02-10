import { z } from "zod";
import type { ToolDefinition } from "../index.js";

const schema = {
	type: z
		.enum(["uuid", "ulid", "password", "number"])
		.describe("Type of random value to generate"),
	uuidVersion: z
		.enum(["v4", "v7"])
		.optional()
		.describe("UUID version: v4 (random, default) or v7 (time-ordered)"),
	length: z
		.number()
		.int()
		.min(1)
		.max(256)
		.optional()
		.describe("Length for password generation (default: 16)"),
	min: z
		.number()
		.optional()
		.describe("Minimum value for number generation (default: 0)"),
	max: z
		.number()
		.optional()
		.describe("Maximum value for number generation (default: 100)"),
	charset: z
		.string()
		.optional()
		.describe("Character set for password generation"),
};

const inputSchema = z.object(schema);
type Input = z.infer<typeof inputSchema>;

const DEFAULT_CHARSET =
	"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
const ULID_ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function generatePassword(length: number, charset: string): string {
	const array = new Uint32Array(length);
	crypto.getRandomValues(array);
	return Array.from(array, (v) => charset[v % charset.length]).join("");
}

function generateRandomNumber(min: number, max: number): number {
	if (min >= max) throw new Error("min must be less than max");
	const range = max - min;
	const array = new Uint32Array(1);
	crypto.getRandomValues(array);
	return min + (array[0] % (range + 1));
}

function generateUUIDv7(): string {
	const now = Date.now();
	const bytes = new Uint8Array(16);
	crypto.getRandomValues(bytes);
	// Timestamp (48 bits) in bytes 0-5
	const ms = BigInt(now);
	bytes[0] = Number((ms >> 40n) & 0xffn);
	bytes[1] = Number((ms >> 32n) & 0xffn);
	bytes[2] = Number((ms >> 24n) & 0xffn);
	bytes[3] = Number((ms >> 16n) & 0xffn);
	bytes[4] = Number((ms >> 8n) & 0xffn);
	bytes[5] = Number(ms & 0xffn);
	// Version 7 (bits 48-51)
	bytes[6] = (bytes[6] & 0x0f) | 0x70;
	// Variant 10 (bits 64-65)
	bytes[8] = (bytes[8] & 0x3f) | 0x80;
	const hex = Array.from(bytes, (b) =>
		b.toString(16).padStart(2, "0"),
	).join("");
	return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function generateULID(): string {
	const now = Date.now();
	let timeStr = "";
	let t = now;
	for (let i = 0; i < 10; i++) {
		timeStr = ULID_ENCODING[t % 32] + timeStr;
		t = Math.floor(t / 32);
	}
	const randomBytes = new Uint8Array(10);
	crypto.getRandomValues(randomBytes);
	let randomStr = "";
	for (let i = 0; i < 16; i++) {
		const byteIndex = Math.floor((i * 5) / 8);
		const bitOffset = (i * 5) % 8;
		let value: number;
		if (bitOffset <= 3) {
			value = (randomBytes[byteIndex] >> (3 - bitOffset)) & 0x1f;
		} else {
			value =
				((randomBytes[byteIndex] << (bitOffset - 3)) |
					(randomBytes[byteIndex + 1] >> (11 - bitOffset))) &
				0x1f;
		}
		randomStr += ULID_ENCODING[value];
	}
	return timeStr + randomStr;
}

export function execute(input: Input): string {
	switch (input.type) {
		case "uuid":
			return input.uuidVersion === "v7"
				? generateUUIDv7()
				: crypto.randomUUID();
		case "ulid":
			return generateULID();
		case "password": {
			const length = input.length ?? 16;
			const charset = input.charset ?? DEFAULT_CHARSET;
			return generatePassword(length, charset);
		}
		case "number": {
			const min = input.min ?? 0;
			const max = input.max ?? 100;
			return String(generateRandomNumber(min, max));
		}
	}
}

export const tool: ToolDefinition = {
	name: "random",
	description:
		"Generate random values: UUID, ULID, secure password, or random number",
	schema,
	handler: async (args: Record<string, unknown>) => {
		const input = inputSchema.parse(args);
		return execute(input);
	},
};
