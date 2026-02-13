import { z } from "zod";
import type { ToolDefinition } from "../index.js";

const schema = {
	type: z
		.enum(["uuid", "ulid", "password", "number", "shuffle"])
		.describe(
			"Type of random value to generate: uuid, ulid, password, number, or shuffle",
		),
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
		.describe(
			"Custom character set for password (overrides uppercase/numbers/symbols options)",
		),
	uppercase: z
		.boolean()
		.optional()
		.describe("Include uppercase letters in password (default: true)"),
	numbers: z
		.boolean()
		.optional()
		.describe("Include numbers in password (default: true)"),
	symbols: z
		.boolean()
		.optional()
		.describe("Include symbols in password (default: true)"),
	excludeChars: z
		.string()
		.optional()
		.describe('Characters to exclude from password (e.g. "\\\\|{}")'),
	readable: z
		.boolean()
		.optional()
		.describe(
			"Readable mode: excludes ambiguous characters (l/1/I/O/0/o) for easy reading",
		),
	items: z
		.array(z.string())
		.optional()
		.describe("Items to shuffle (for type=shuffle)"),
};

const inputSchema = z.object(schema);
type Input = z.infer<typeof inputSchema>;

const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{}|;:,.<>?/~`";
const AMBIGUOUS = "lI1O0o";

const ULID_ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function buildCharset(input: Input): string {
	// Custom charset takes priority
	if (input.charset) {
		let cs = input.charset;
		if (input.excludeChars) {
			const exclude = new Set(input.excludeChars);
			cs = cs
				.split("")
				.filter((c) => !exclude.has(c))
				.join("");
		}
		if (cs.length === 0) throw new Error("Charset is empty after exclusions");
		return cs;
	}

	let cs = LOWERCASE;
	if (input.uppercase !== false) cs += UPPERCASE;
	if (input.numbers !== false) cs += NUMBERS;
	if (input.symbols !== false) cs += SYMBOLS;

	if (input.readable) {
		const ambiguous = new Set(AMBIGUOUS);
		cs = cs
			.split("")
			.filter((c) => !ambiguous.has(c))
			.join("");
	}

	if (input.excludeChars) {
		const exclude = new Set(input.excludeChars);
		cs = cs
			.split("")
			.filter((c) => !exclude.has(c))
			.join("");
	}

	if (cs.length === 0) throw new Error("Charset is empty after exclusions");
	return cs;
}

function generatePassword(length: number, charset: string): string {
	const array = new Uint32Array(length);
	crypto.getRandomValues(array);
	return Array.from(array, (v) => charset[v % charset.length]).join("");
}

function generateRandomNumber(min: number, max: number): number {
	if (min > max) throw new Error("min must be less than or equal to max");
	if (min === max) return min;
	const range = max - min;
	const array = new Uint32Array(1);
	crypto.getRandomValues(array);
	const randomValue = array[0];
	if (randomValue === undefined) throw new Error("Failed to generate random value");
	return min + (randomValue % (range + 1));
}

function generateUUIDv7(): string {
	const now = Date.now();
	const bytes = new Uint8Array(16);
	crypto.getRandomValues(bytes);
	const ms = BigInt(now);
	const b0 = bytes[0]; const b1 = bytes[1]; const b2 = bytes[2];
	const b3 = bytes[3]; const b4 = bytes[4]; const b5 = bytes[5];
	const b6 = bytes[6]; const b8 = bytes[8];
	if (b0 !== undefined) bytes[0] = Number((ms >> 40n) & 0xffn);
	if (b1 !== undefined) bytes[1] = Number((ms >> 32n) & 0xffn);
	if (b2 !== undefined) bytes[2] = Number((ms >> 24n) & 0xffn);
	if (b3 !== undefined) bytes[3] = Number((ms >> 16n) & 0xffn);
	if (b4 !== undefined) bytes[4] = Number((ms >> 8n) & 0xffn);
	if (b5 !== undefined) bytes[5] = Number(ms & 0xffn);
	if (b6 !== undefined) bytes[6] = (b6 & 0x0f) | 0x70;
	if (b8 !== undefined) bytes[8] = (b8 & 0x3f) | 0x80;
	const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
		"",
	);
	return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function generateULID(): string {
	const now = Date.now();
	let timeStr = "";
	let t = now;
	for (let i = 0; i < 10; i++) {
		const encodedChar = ULID_ENCODING[t % 32];
		timeStr = (encodedChar ?? "0") + timeStr;
		t = Math.floor(t / 32);
	}
	const randomBytes = new Uint8Array(10);
	crypto.getRandomValues(randomBytes);
	let randomStr = "";
	for (let i = 0; i < 16; i++) {
		const byteIndex = Math.floor((i * 5) / 8);
		const bitOffset = (i * 5) % 8;
		let value: number;
		const byte1 = randomBytes[byteIndex];
		const byte2 = randomBytes[byteIndex + 1];
		if (byte1 === undefined) continue;
		if (bitOffset <= 3) {
			value = (byte1 >> (3 - bitOffset)) & 0x1f;
		} else {
			if (byte2 === undefined) continue;
			value =
				((byte1 << (bitOffset - 3)) |
					(byte2 >> (11 - bitOffset))) &
				0x1f;
		}
		const encodedChar = ULID_ENCODING[value];
		randomStr += encodedChar ?? "0";
	}
	return timeStr + randomStr;
}

function shuffle(items: string[]): string[] {
	if (items.length === 0) throw new Error("Items array must not be empty");
	const result = [...items];
	// Fisher-Yates shuffle with crypto random
	for (let i = result.length - 1; i > 0; i--) {
		const array = new Uint32Array(1);
		crypto.getRandomValues(array);
		const randomValue = array[0];
		if (randomValue === undefined) continue;
		const j = randomValue % (i + 1);
		const temp = result[i];
		const swapItem = result[j];
		if (temp !== undefined && swapItem !== undefined) {
			result[i] = swapItem;
			result[j] = temp;
		}
	}
	return result;
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
			const charset = buildCharset(input);
			return generatePassword(length, charset);
		}
		case "number": {
			const min = input.min ?? 0;
			const max = input.max ?? 100;
			return String(generateRandomNumber(min, max));
		}
		case "shuffle": {
			if (!input.items || input.items.length === 0) {
				throw new Error("Items array is required for shuffle");
			}
			return JSON.stringify(shuffle(input.items));
		}
	}
}

export const tool: ToolDefinition = {
	name: "random",
	description:
		"Generate random values: UUID, ULID, secure password (with fine-grained options), random number, or shuffle a list",
	schema,
	handler: async (args: Record<string, unknown>) => {
		const input = inputSchema.parse(args);
		return execute(input);
	},
};
