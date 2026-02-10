import { evaluate } from "mathjs";
import { z } from "zod";
import type { ToolDefinition } from "../index.js";

const schema = {
	expression: z.string().optional().describe("Math expression to evaluate"),
	action: z
		.enum(["eval", "statistics"])
		.optional()
		.describe("Action: eval (default) or statistics"),
	values: z
		.array(z.number())
		.optional()
		.describe("Array of numbers for statistics"),
};

const inputSchema = z.object(schema);
type Input = z.infer<typeof inputSchema>;

function computeStatistics(values: number[]): string {
	if (values.length === 0) throw new Error("values array is empty");

	const sorted = [...values].sort((a, b) => a - b);
	const sum = values.reduce((a, b) => a + b, 0);
	const mean = sum / values.length;
	const variance =
		values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length;
	const stddev = Math.sqrt(variance);

	let median: number;
	const mid = Math.floor(sorted.length / 2);
	if (sorted.length % 2 === 0) {
		median = (sorted[mid - 1] + sorted[mid]) / 2;
	} else {
		median = sorted[mid];
	}

	return JSON.stringify(
		{
			count: values.length,
			sum,
			mean,
			median,
			min: sorted[0],
			max: sorted[sorted.length - 1],
			variance,
			stddev,
		},
		null,
		2,
	);
}

export function execute(input: Input): string {
	const action = input.action ?? "eval";

	if (action === "statistics") {
		if (!input.values) throw new Error("values is required for statistics");
		return computeStatistics(input.values);
	}

	// eval
	if (!input.expression) throw new Error("expression is required for eval");
	const result = evaluate(input.expression);
	return String(result);
}

export const tool: ToolDefinition = {
	name: "math",
	description: "Evaluate math expressions or compute statistics on numbers",
	schema,
	handler: async (args: Record<string, unknown>) => {
		const input = inputSchema.parse(args);
		return execute(input);
	},
};
