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
	let flags = input.flags ?? "";
	if (input.action === "match" && !flags.includes("g")) {
		flags = `g${flags}`;
	}
	if (input.action === "replace" && !flags.includes("g")) {
		flags = `g${flags}`;
	}
	if (input.action === "matchAll" && !flags.includes("g")) {
		flags = `g${flags}`;
	}
	const regex = new RegExp(input.pattern, flags);

	switch (input.action) {
		case "test": {
			const result = withTimeout(() => regex.test(input.text));
			return JSON.stringify({ match: result });
		}
		case "match": {
			const matches = withTimeout(() => [...input.text.matchAll(regex)]);
			if (matches.length === 0) {
				return JSON.stringify({ matches: null, index: null, groups: null });
			}
			return JSON.stringify({
				matches: matches.map((m) => m[0]),
				index: matches[0].index,
				groups: matches[0].groups ?? null,
			});
		}
		case "matchAll": {
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
