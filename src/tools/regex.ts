import { z } from "zod";
import type { ToolDefinition } from "../index.js";

const schema = {
	pattern: z.string().describe("Regular expression pattern"),
	flags: z.string().optional().describe("Regex flags (g, i, m, etc.)"),
	text: z.string().describe("Text to search"),
	action: z
		.enum(["match", "test", "replace", "matchAll"])
		.describe("Action to perform"),
	replacement: z.string().optional().describe("Replacement string for replace"),
};

const inputSchema = z.object(schema);
type Input = z.infer<typeof inputSchema>;

const TIMEOUT_MS = 1000;

function withTimeout<T>(fn: () => T): T {
	const start = Date.now();
	const result = fn();
	if (Date.now() - start > TIMEOUT_MS) {
		throw new Error("Regex execution timed out (possible ReDoS)");
	}
	return result;
}

export function execute(input: Input): string {
	const regex = new RegExp(input.pattern, input.flags ?? "");

	switch (input.action) {
		case "test": {
			const result = withTimeout(() => regex.test(input.text));
			return JSON.stringify({ match: result });
		}
		case "match": {
			const result = withTimeout(() => input.text.match(regex));
			if (!result) return JSON.stringify({ matches: null });
			return JSON.stringify({
				matches: [...result],
				index: result.index,
				groups: result.groups ?? null,
			});
		}
		case "matchAll": {
			if (!input.flags?.includes("g")) {
				throw new Error("matchAll requires the 'g' flag");
			}
			const matches = withTimeout(() => [...input.text.matchAll(regex)]);
			return JSON.stringify(
				matches.map((m) => ({
					match: m[0],
					index: m.index,
					groups: m.groups ?? null,
					captures: m.slice(1),
				})),
				null,
				2,
			);
		}
		case "replace": {
			if (input.replacement === undefined)
				throw new Error("replacement is required for replace");
			const result = withTimeout(() =>
				input.text.replace(regex, input.replacement as string),
			);
			return result;
		}
	}
}

export const tool: ToolDefinition = {
	name: "regex",
	description: "Test, match, matchAll, or replace using regular expressions",
	schema,
	handler: async (args: Record<string, unknown>) => {
		const input = inputSchema.parse(args);
		return execute(input);
	},
};
