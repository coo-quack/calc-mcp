import { all, create } from "mathjs";
import { z } from "zod";
import type { ToolDefinition } from "../index.js";

// Create sandboxed math instance with dangerous functions disabled
const mathConfig = all;

// Remove dangerous functions that could be used for code injection
const dangerousFunctions = [
	"import", // Can load external modules
	"createUnit", // Can modify global state
];

// Filter out dangerous functions
const safeFunctions = Object.fromEntries(
	Object.entries(mathConfig).filter(
		([key]) => !dangerousFunctions.includes(key),
	),
);

const math = create(safeFunctions, { number: "BigNumber", precision: 64 });

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

	const bn = values.map((v) => math.bignumber(v));
	const sorted = [...bn].sort((a, b) => a.comparedTo(b));
	const sum = sorted.reduce((a, b) => math.add(a, b));
	const mean = math.divide(sum, values.length);
	const variance = math.divide(
		bn.reduce(
			(acc, v) => math.add(acc, math.pow(math.subtract(v, mean), 2)),
			math.bignumber(0),
		),
		values.length,
	);
	const stddev = math.sqrt(variance);

	const mid = Math.floor(sorted.length / 2);
	const median =
		sorted.length % 2 === 0
			? math.divide(math.add(sorted[mid - 1], sorted[mid]), 2)
			: sorted[mid];

	const fmt = (v: unknown) => Number(math.format(v, { precision: 14 }));

	return JSON.stringify(
		{
			count: values.length,
			sum: fmt(sum),
			mean: fmt(mean),
			median: fmt(median),
			min: fmt(sorted[0]),
			max: fmt(sorted[sorted.length - 1]),
			variance: fmt(variance),
			stddev: fmt(stddev),
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

	// Check for dangerous patterns before evaluation
	const dangerous = ["import", "createUnit", "eval", "Function"];
	for (const pattern of dangerous) {
		if (input.expression.includes(pattern)) {
			throw new Error(`Unsafe function call detected: ${pattern}`);
		}
	}

	const result = math.evaluate(input.expression);
	if (result?.isInteger?.()) {
		return result.toFixed(0);
	}
	return math.format(result, { precision: 14 });
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
