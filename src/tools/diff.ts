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

function lcs(a: string[], b: string[]): [boolean[], boolean[]] {
	const m = a.length;
	const n = b.length;
	const w = n + 1;
	// Flat 1D array: dp[i * w + j] = length of LCS of a[0..i-1] and b[0..j-1]
	// ?? 0 is required by noUncheckedIndexedAccess (tsconfig), which makes array
	// index access return number | undefined even for pre-filled arrays at compile time.
	const dp = new Array<number>((m + 1) * w).fill(0);

	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			if (a[i - 1] === b[j - 1]) {
				dp[i * w + j] = (dp[(i - 1) * w + (j - 1)] ?? 0) + 1;
			} else {
				dp[i * w + j] = Math.max(
					dp[(i - 1) * w + j] ?? 0,
					dp[i * w + (j - 1)] ?? 0,
				);
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
		} else if ((dp[(i - 1) * w + j] ?? 0) >= (dp[i * w + (j - 1)] ?? 0)) {
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
	const w = n + 1;
	// Flat 1D array: dp[i * w + j] = edit distance between s[0..i-1] and t[0..j-1]
	// ?? 0 is required by noUncheckedIndexedAccess (see lcs() comment above).
	const dp = new Array<number>((m + 1) * w).fill(0);

	for (let i = 0; i <= m; i++) dp[i * w] = i;
	for (let j = 0; j <= n; j++) dp[j] = j;

	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			const cost = s[i - 1] === t[j - 1] ? 0 : 1;
			dp[i * w + j] = Math.min(
				(dp[(i - 1) * w + j] ?? 0) + 1,
				(dp[i * w + (j - 1)] ?? 0) + 1,
				(dp[(i - 1) * w + (j - 1)] ?? 0) + cost,
			);
		}
	}

	return dp[m * w + n] ?? 0;
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
