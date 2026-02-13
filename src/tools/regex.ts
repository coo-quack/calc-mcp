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
const MAX_PATTERN_LENGTH = 500;

// Detect common ReDoS patterns (nested quantifiers)
const DANGEROUS_PATTERNS = [
	/\([^)]*\+[^)]*\)\+/, // (x+)+ style nesting
	/\([^)]*\*[^)]*\)\*/, // (x*)* style nesting
	/\([^)]*\+[^)]*\)\*/, // (x+)* style nesting
	/\([^)]*\*[^)]*\)\+/, // (x*)+ style nesting
	/\([^)]*\{[^}]+\}[^)]*\)\{/, // ({n,m}){...} style nesting
];

// Check for potentially dangerous ReDoS patterns
function validatePattern(pattern: string): void {
	if (pattern.length > MAX_PATTERN_LENGTH) {
		throw new Error(
			`Pattern too long (${pattern.length} chars, max: ${MAX_PATTERN_LENGTH})`,
		);
	}

	for (const dangerousPattern of DANGEROUS_PATTERNS) {
		if (dangerousPattern.test(pattern)) {
			throw new Error(
				"Pattern contains nested quantifiers (possible ReDoS risk)",
			);
		}
	}
}

function withTimeout<T>(fn: () => T): T {
	// Note: JavaScript regex operations are synchronous and cannot be truly interrupted.
	// This timeout check happens *after* execution, so it won't prevent actual ReDoS attacks
	// where the regex engine blocks for extended periods.
	// The pattern validation above provides the main ReDoS protection.
	const start = Date.now();
	const result = fn();
	const elapsed = Date.now() - start;
	if (elapsed > TIMEOUT_MS) {
		throw new Error(
			`Regex execution took ${elapsed}ms (timeout: ${TIMEOUT_MS}ms, possible ReDoS)`,
		);
	}
	return result;
}

export function execute(input: Input): string {
	// Validate pattern for ReDoS risks
	validatePattern(input.pattern);

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
