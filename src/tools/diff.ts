import { z } from "zod";
import type { ToolDefinition } from "../index.js";

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

function lcs(a: string[], b: string[]): boolean[][] {
	const m = a.length;
	const n = b.length;
	// dp[i][j] = length of LCS of a[0..i-1] and b[0..j-1]
	const dp: number[][] = Array.from({ length: m + 1 }, () =>
		Array(n + 1).fill(0),
	);
	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			// dp table is guaranteed to be fully initialized (m+1 x n+1)
			const currRow = dp[i]!;
			const prevRow = dp[i - 1]!;
			const prevRowCurrCol = prevRow[j]!;
			const currRowPrevCol = currRow[j - 1]!;
			const prevRowPrevCol = prevRow[j - 1]!;

			if (a[i - 1] === b[j - 1]) {
				currRow[j] = prevRowPrevCol + 1;
			} else {
				currRow[j] = Math.max(prevRowCurrCol, currRowPrevCol);
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
		} else {
			// dp table is fully initialized, indices are within bounds
			const prevRow = dp[i - 1]!;
			const currRow = dp[i]!;
			const prevJ = prevRow[j]!;
			const currJPrev = currRow[j - 1]!;
			if (prevJ >= currJPrev) {
				i--;
			} else {
				j--;
			}
		}
	}
	return [inLcsA, inLcsB] as unknown as boolean[][];
}

function lineDiff(text1: string, text2: string): string {
	const lines1 = text1.split("\n");
	const lines2 = text2.split("\n");
	const lcsResult = lcs(lines1, lines2);
	const inLcs1 = lcsResult[0];
	const inLcs2 = lcsResult[1];
	if (!inLcs1 || !inLcs2) {
		throw new Error("Failed to compute diff");
	}

	const output: string[] = [];
	let i = 0;
	let j = 0;

	while (i < lines1.length || j < lines2.length) {
		const line1 = lines1[i];
		const line2 = lines2[j];
		const inLcs1Val = inLcs1[i];
		const inLcs2Val = inLcs2[j];

		if (i < lines1.length && inLcs1Val === false && line1 !== undefined) {
			output.push(`- ${line1}`);
			i++;
		} else if (
			j < lines2.length &&
			inLcs2Val === false &&
			line2 !== undefined
		) {
			output.push(`+ ${line2}`);
			j++;
		} else {
			if (i < lines1.length && line1 !== undefined) {
				output.push(`  ${line1}`);
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
		dp[i]![0] = i;
	}
	for (let j = 0; j <= n; j++) {
		dp[0]![j] = j;
	}

	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			const cost = s[i - 1] === t[j - 1] ? 0 : 1;
			// dp table is fully initialized, indices are within bounds
			const currRow = dp[i]!;
			const prevRow = dp[i - 1]!;
			const currJPrev = currRow[j - 1]!;
			const prevJ = prevRow[j]!;
			const prevJPrev = prevRow[j - 1]!;
			currRow[j] = Math.min(prevJ + 1, currJPrev + 1, prevJPrev + cost);
		}
	}

	// dp[m][n] is guaranteed to exist after the loop
	return dp[m]![n]!;
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
