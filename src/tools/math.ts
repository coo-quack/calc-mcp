import { all, create } from "mathjs";
import { z } from "zod";
import type { ToolDefinition } from "../index.js";

// Create sandboxed math instance with dangerous functions disabled
// Exclude heavy/unused features to reduce bundle size
const excludeFunctions = [
	// Dangerous functions (security)
	"import", // Can load external modules
	"createUnit", // Can modify global state

	// Large unused features (bundle size optimization)
	// Symbolic math (unused)
	"derivative",
	"rationalize",
	"simplify",
	"symbolicEqual",
	"resolve",
	"parser",

	// Unit functions (unused - we don't use unit conversions in math tool)
	"createCreateUnit",
	"createSplitUnit",
	"createUnitClass",
	"createUnitFunction",
];

// Filter out excluded functions
const allFunctions = all as Record<string, unknown>;
const safeFunctions = Object.fromEntries(
	Object.entries(allFunctions).filter(
		([key]) => !excludeFunctions.includes(key),
	),
);

const math = create(safeFunctions as any, {
	number: "BigNumber",
	precision: 64,
});

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
	if (sorted.length === 0) throw new Error("Failed to process values");
	const sum = sorted.reduce((a, b) => math.add(a, b) as any) as any;
	const mean = math.divide(sum, values.length);
	const variance = math.divide(
		bn.reduce(
			(acc, v) => math.add(acc, math.pow(math.subtract(v, mean), 2)) as any,
			math.bignumber(0),
		) as any,
		values.length,
	);
	const varianceResult = variance as any;
	const stddev = math.sqrt(varianceResult);

	const mid = Math.floor(sorted.length / 2);
	const sortedMid = sorted[mid];
	const sortedMidPrev = sorted[mid - 1];
	const median =
		sorted.length % 2 === 0 && sortedMidPrev && sortedMid
			? math.divide(math.add(sortedMidPrev as any, sortedMid as any) as any, 2)
			: sortedMid;

	const fmt = (v: unknown) => Number(math.format(v, { precision: 14 }));

	const firstValue = sorted[0];
	const lastValue = sorted[sorted.length - 1];
	if (firstValue === undefined || lastValue === undefined) {
		throw new Error("Sorted array access failed");
	}

	return JSON.stringify(
		{
			count: values.length,
			sum: fmt(sum),
			mean: fmt(mean),
			median: fmt(median),
			min: fmt(firstValue),
			max: fmt(lastValue),
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
	// Note: mathjs uses its own parser and does not support JavaScript syntax
	// like bracket notation (['import']) or global objects (window).
	// This simple string check is sufficient because mathjs will reject
	// any JavaScript-style code injection attempts as syntax errors.
	const dangerousFunctions = ["import", "createUnit"];
	const runtimeDangerousPatterns = [...dangerousFunctions, "eval", "Function"];
	for (const pattern of runtimeDangerousPatterns) {
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
