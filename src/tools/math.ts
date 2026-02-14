import { all, type BigNumber, create } from "mathjs";
import { z } from "zod";
import type { ToolDefinition } from "../index.js";

// Create sandboxed math instance with dangerous functions disabled
// Exclude heavy/unused features to reduce bundle size
// Note: mathjs `all` export uses factory function names (createXxx pattern)
const excludeFunctions = [
	// Dangerous functions (security) - createUnit can modify global state
	"createCreateUnit",

	// Large unused features (bundle size optimization)
	// Symbolic math (unused)
	"createDerivative",
	"createRationalize",
	"createSimplify",
	"createSymbolicEqual",
	"createResolve",
	"createParser",

	// Unit functions (unused - we don't use unit conversions in math tool)
	"createSplitUnit",
	"createUnitClass",
	"createUnitFunction",
];

// Runtime safety check patterns using word boundaries to avoid false positives
// (e.g., "important" should not be blocked by matching "import")
const DANGEROUS_PATTERNS = [
	/\bimport\b/,
	/\bcreateUnit\b/,
	/\beval\b/,
	/\bFunction\b/,
];

// Filter out excluded functions
const allFunctions = all as Record<string, unknown>;
const safeFunctions = Object.fromEntries(
	Object.entries(allFunctions).filter(
		([key]) => !excludeFunctions.includes(key),
	),
);

// biome-ignore lint/suspicious/noExplicitAny: mathjs create() requires complex generic typing
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
	// sorted is guaranteed to have at least one element (values.length > 0)
	const sum = sorted.reduce<BigNumber>(
		(a, b) => math.add(a, b) as BigNumber,
		math.bignumber(0),
	);
	const mean = math.divide(sum, values.length) as BigNumber;
	const variance = math.divide(
		bn.reduce<BigNumber>(
			(acc, v) =>
				math.add(acc, math.pow(math.subtract(v, mean), 2)) as BigNumber,
			math.bignumber(0),
		),
		values.length,
	) as BigNumber;
	const stddev = math.sqrt(variance);

	const mid = Math.floor(sorted.length / 2);
	const sortedMid = sorted[mid];
	const sortedMidPrev = sorted[mid - 1];
	const median =
		sorted.length % 2 === 0 && sortedMidPrev && sortedMid
			? (math.divide(math.add(sortedMidPrev, sortedMid), 2) as BigNumber)
			: sortedMid;

	const fmt = (v: unknown) => Number(math.format(v, { precision: 14 }));

	// sorted is guaranteed non-empty, so first and last elements exist
	const firstValue = sorted[0]!;
	const lastValue = sorted[sorted.length - 1]!;

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
	// Word boundary matching avoids false positives (e.g., "important" won't
	// be blocked by the "import" pattern).
	for (const pattern of DANGEROUS_PATTERNS) {
		if (pattern.test(input.expression)) {
			throw new Error(`Unsafe expression detected: ${pattern.source}`);
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
