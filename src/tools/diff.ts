import { z } from "zod";
import type { ToolDefinition } from "../index.js";

/**
 * Safely access array element, throwing on undefined.
 * Used for initialized arrays where TypeScript can't infer non-null.
 */
function arrayGet<T>(arr: T[] | undefined, index: number): T {
	if (!arr) throw new Error("Array not initialized");
	const val = arr[index];
	if (val === undefined) throw new Error(`Index ${index} out of bounds`);
	return val;
}

const schema = {
	text1: z.string().describe("First text"),
	text2: z.string().describe("Second text"),
	action: z
		.enum(["diff", "distance"])
		.optional()
		.describe("diff: line diff (default), distance: Levenshtein distance"),
};

const inputSchema = z.object(schema);
type Input = z.infer<typeof inputSchema>;

function lcs(a: string[], b: string[]): [boolean[], boolean[]] {
	const m = a.length;
	const n = b.length;
	// dp[i][j] = length of LCS of a[0..i-1] and b[0..j-1]
	const dp: number[][] = Array.from({ length: m + 1 }, () =>
		Array(n + 1).fill(0),
	);
	// dp table is guaranteed to be fully initialized (m+1 x n+1)
	for (let i = 1; i <= m; i++) {
		const currRow = arrayGet(dp, i);
		const prevRow = arrayGet(dp, i - 1);
		for (let j = 1; j <= n; j++) {
			if (a[i - 1] === b[j - 1]) {
				currRow[j] = arrayGet(prevRow, j - 1) + 1;
			} else {
				currRow[j] = Math.max(arrayGet(prevRow, j), arrayGet(currRow, j - 1));
			}
		}
	}

	// Backtrack to find which lines are in common
	const inLcsA: boolean[] = Array(m).fill(false);
	const inLcsB: boolean[] = Array(n).fill(false);
	let i = m;
	let j = n;
	while (i > 0 && j > 0) {
		if (a[i - 1] === b[j - 1]) {
			inLcsA[i - 1] = true;
			inLcsB[j - 1] = true;
			i--;
			j--;
		} else if (
			arrayGet(arrayGet(dp, i - 1), j) >= arrayGet(arrayGet(dp, i), j - 1)
		) {
			i--;
		} else {
			j--;
		}
	}
	return [inLcsA, inLcsB];
}

function lineDiff(text1: string, text2: string): string {
	const lines1 = text1.split("\n");
	const lines2 = text2.split("\n");
	const [inLcs1, inLcs2] = lcs(lines1, lines2);

	const output: string[] = [];
	let i = 0;
	let j = 0;

	while (i < lines1.length || j < lines2.length) {
		if (i < lines1.length && !inLcs1[i]) {
			output.push(`- ${lines1[i]}`);
			i++;
		} else if (j < lines2.length && !inLcs2[j]) {
			output.push(`+ ${lines2[j]}`);
			j++;
		} else {
			if (i < lines1.length) {
				output.push(`  ${lines1[i]}`);
			}
			i++;
			j++;
		}
	}

	return output.join("\n");
}

function levenshteinDistance(s: string, t: string): number {
	const m = s.length;
	const n = t.length;
	const dp: number[][] = Array.from({ length: m + 1 }, () =>
		Array(n + 1).fill(0),
	);

	// dp table is guaranteed to be fully initialized
	for (let i = 0; i <= m; i++) {
		arrayGet(dp, i)[0] = i;
	}
	for (let j = 0; j <= n; j++) {
		arrayGet(dp, 0)[j] = j;
	}

	// dp table is fully initialized, indices are within bounds
	for (let i = 1; i <= m; i++) {
		const currRow = arrayGet(dp, i);
		const prevRow = arrayGet(dp, i - 1);
		for (let j = 1; j <= n; j++) {
			const cost = s[i - 1] === t[j - 1] ? 0 : 1;
			currRow[j] = Math.min(
				arrayGet(prevRow, j) + 1,
				arrayGet(currRow, j - 1) + 1,
				arrayGet(prevRow, j - 1) + cost,
			);
		}
	}

	// dp[m][n] is guaranteed to exist after the loop
	return arrayGet(arrayGet(dp, m), n);
}

export function execute(input: Input): string {
	const action = input.action ?? "diff";

	if (action === "distance") {
		const distance = levenshteinDistance(input.text1, input.text2);
		return JSON.stringify({
			distance,
			text1Length: input.text1.length,
			text2Length: input.text2.length,
		});
	}

	return lineDiff(input.text1, input.text2);
}

export const tool: ToolDefinition = {
	name: "diff",
	description: "Compare two texts: line-by-line diff or Levenshtein distance",
	schema,
	handler: async (args: Record<string, unknown>) => {
		const input = inputSchema.parse(args);
		return execute(input);
	},
};
