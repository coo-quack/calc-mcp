import { z } from "zod";
import type { ToolDefinition } from "../index.js";

const schema = {
	number: z
		.string()
		.describe("Number string to validate or generate check digit for"),
	action: z
		.enum(["validate", "generate"])
		.optional()
		.describe("validate (default) or generate check digit"),
};

const inputSchema = z.object(schema);
type Input = z.infer<typeof inputSchema>;

function luhnChecksum(digits: number[]): number {
	let sum = 0;
	let isDouble = false;

	for (let i = digits.length - 1; i >= 0; i--) {
		let d = digits[i];
		if (isDouble) {
			d *= 2;
			if (d > 9) d -= 9;
		}
		sum += d;
		isDouble = !isDouble;
	}

	return sum % 10;
}

export function execute(input: Input): string {
	const action = input.action ?? "validate";
	const cleaned = input.number.replace(/[\s-]/g, "");

	if (!/^\d+$/.test(cleaned)) {
		throw new Error(
			"Input must contain only digits (spaces and hyphens are stripped)",
		);
	}

	if (action === "validate") {
		const digits = [...cleaned].map(Number);
		const valid = luhnChecksum(digits) === 0;
		return JSON.stringify({ valid, number: cleaned });
	}

	// generate: compute check digit
	const digits = [...cleaned].map(Number);
	// Append 0 and compute what check digit makes it valid
	digits.push(0);
	const remainder = luhnChecksum(digits);
	const checkDigit = remainder === 0 ? 0 : 10 - remainder;

	return JSON.stringify({
		number: cleaned + String(checkDigit),
		checkDigit,
		original: cleaned,
	});
}

export const tool: ToolDefinition = {
	name: "luhn",
	description: "Validate or generate check digits using the Luhn algorithm",
	schema,
	handler: async (args: Record<string, unknown>) => {
		const input = inputSchema.parse(args);
		return execute(input);
	},
};
