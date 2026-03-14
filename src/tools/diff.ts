import { z } from "zod";
import type { ToolDefinition } from "../index.js";
import { assertExists } from "../utils.js";

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

/**
 * Myers diff algorithm — O(nd) where n is total length and d is edit distance.
 * Much faster than O(m*n) LCS for similar texts (small d).
 * Returns an array of edit operations: "equal", "delete", or "insert".
 */
interface DiffEdit {
	type: "equal" | "delete" | "insert";
	line: string;
}

// Safe access for Int32Array — index is always within bounds in Myers algorithm,
// but noUncheckedIndexedAccess makes the return type number | undefined.
function vGet(arr: Int32Array, index: number): number {
	return arr[index] ?? 0;
}

// Maximum edit distance before falling back to a simple all-delete/all-insert output.
// Memory: trace stores one Int32Array(2*maxD+1) per d level.
// At maxD=1000: 1001 snapshots × 2001 × 4 bytes ≈ 8 MB — safe for a utility tool.
const MAX_EDIT_DISTANCE = 1000;

function myersDiff(a: string[], b: string[]): DiffEdit[] {
	const n = a.length;
	const m = b.length;
	const max = n + m;

	// Trivial cases
	if (n === 0) return b.map((line) => ({ type: "insert", line }));
	if (m === 0) return a.map((line) => ({ type: "delete", line }));

	// Cap edit distance to prevent excessive memory usage
	const maxD = Math.min(max, MAX_EDIT_DISTANCE);

	// v[k] stores the furthest-reaching x for diagonal k
	// Use offset to handle negative indices: v[k + offset]
	const offset = maxD;
	const size = 2 * maxD + 1;
	const v = new Int32Array(size);

	// Trace stores v snapshots for backtracking
	const trace: Int32Array[] = [];

	let found = false;
	outer: for (let d = 0; d <= maxD; d++) {
		const vCopy = new Int32Array(v);
		trace.push(vCopy);

		for (let k = -d; k <= d; k += 2) {
			let x: number;
			if (
				k === -d ||
				(k !== d && vGet(v, k - 1 + offset) < vGet(v, k + 1 + offset))
			) {
				x = vGet(v, k + 1 + offset); // move down (insert)
			} else {
				x = vGet(v, k - 1 + offset) + 1; // move right (delete)
			}
			let y = x - k;

			// Follow diagonal (equal lines)
			while (x < n && y < m && a[x] === b[y]) {
				x++;
				y++;
			}

			v[k + offset] = x;

			if (x >= n && y >= m) {
				found = true;
				break outer;
			}
		}
	}

	// If edit distance exceeds the cap, fall back to simple delete-all/insert-all
	if (!found) {
		return [
			...a.map((line) => ({ type: "delete" as const, line })),
			...b.map((line) => ({ type: "insert" as const, line })),
		];
	}

	// Backtrack to reconstruct the edit script
	const edits: DiffEdit[] = [];
	let x = n;
	let y = m;

	for (let d = trace.length - 1; d >= 0; d--) {
		const vPrev = assertExists(trace[d], "diff backtracking");
		const k = x - y;

		let prevK: number;
		if (
			k === -d ||
			(k !== d && vGet(vPrev, k - 1 + offset) < vGet(vPrev, k + 1 + offset))
		) {
			prevK = k + 1;
		} else {
			prevK = k - 1;
		}

		const prevX = vGet(vPrev, prevK + offset);
		const prevY = prevX - prevK;

		// Diagonal (equal lines) — push in reverse
		while (x > prevX && y > prevY) {
			x--;
			y--;
			edits.push({
				type: "equal",
				line: assertExists(a[x], "diff backtracking"),
			});
		}

		if (d > 0) {
			if (x === prevX) {
				// Insert
				y--;
				edits.push({
					type: "insert",
					line: assertExists(b[y], "diff backtracking"),
				});
			} else {
				// Delete
				x--;
				edits.push({
					type: "delete",
					line: assertExists(a[x], "diff backtracking"),
				});
			}
		}
	}

	edits.reverse();
	return edits;
}

function lineDiff(text1: string, text2: string): string {
	const lines1 = text1.split("\n");
	const lines2 = text2.split("\n");
	const edits = myersDiff(lines1, lines2);

	const output: string[] = [];
	for (const edit of edits) {
		switch (edit.type) {
			case "equal":
				output.push(`  ${edit.line}`);
				break;
			case "delete":
				output.push(`- ${edit.line}`);
				break;
			case "insert":
				output.push(`+ ${edit.line}`);
				break;
		}
	}
	return output.join("\n");
}

function levenshteinDistance(s: string, t: string): number {
	const m = s.length;
	const n = t.length;
	const w = n + 1;
	// Flat 1D array: dp[i * w + j] = edit distance between s[0..i-1] and t[0..j-1]
	// ?? 0 is required by noUncheckedIndexedAccess (tsconfig), which makes array
	// index access return number | undefined even for pre-filled arrays at compile time.
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
