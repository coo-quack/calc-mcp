import { z } from "zod";
import type { ToolDefinition } from "../index.js";

const schema = {
	value: z
		.union([z.string(), z.number()])
		.describe("Value to convert (string or number)"),
	from: z.number().describe("Source base (2-36)"),
	to: z.number().describe("Target base (2-36)"),
};

const inputSchema = z.object(schema);
type Input = z.infer<typeof inputSchema>;

export function execute(input: Input): string {
	const { value, from, to } = input;

	if (from < 2 || from > 36 || to < 2 || to > 36) {
		throw new Error("Base must be between 2 and 36");
	}

	const strValue = String(value);

	// Use BigInt for large number support
	let decimal: bigint;
	try {
		// Parse the input value in the source base
		if (from === 10) {
			decimal = BigInt(strValue);
		} else {
			// Manual parsing for non-decimal bases
			let result = 0n;
			const base = BigInt(from);
			for (const ch of strValue.toLowerCase()) {
				const digit = Number.parseInt(ch, from);
				if (Number.isNaN(digit))
					throw new Error(`Invalid digit '${ch}' for base ${from}`);
				result = result * base + BigInt(digit);
			}
			decimal = result;
		}
	} catch (e) {
		if (e instanceof Error && e.message.includes("Invalid digit")) throw e;
		throw new Error(`Cannot parse "${strValue}" as base ${from}`);
	}

	// Convert to target base
	const result = decimal.toString(to);

	return JSON.stringify({
		input: strValue,
		fromBase: from,
		toBase: to,
		result,
		decimal: decimal.toString(),
	});
}

export const tool: ToolDefinition = {
	name: "base",
	description:
		"Convert numbers between bases (2-36), supports large numbers via BigInt",
	schema,
	handler: async (args: Record<string, unknown>) => {
		const input = inputSchema.parse(args);
		return execute(input);
	},
};
