import YAML from "yaml";
import { z } from "zod";
import type { ToolDefinition } from "../index.js";

const schema = {
	input: z.string().describe("String to validate/parse"),
	format: z
		.enum(["json", "csv", "xml", "yaml"])
		.describe("Format to validate as"),
};

const inputSchema = z.object(schema);
type Input = z.infer<typeof inputSchema>;

function validateJson(input: string): string {
	try {
		const parsed = JSON.parse(input);
		return JSON.stringify({
			valid: true,
			type: Array.isArray(parsed) ? "array" : typeof parsed,
			keys:
				typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
					? Object.keys(parsed)
					: undefined,
			length: Array.isArray(parsed) ? parsed.length : undefined,
		});
	} catch (e) {
		return JSON.stringify({
			valid: false,
			error: e instanceof Error ? e.message : String(e),
		});
	}
}

function validateCsv(input: string): string {
	const lines = input.trim().split("\n");
	if (lines.length === 0) {
		return JSON.stringify({ valid: false, error: "Empty input" });
	}

	const headerCols = parseCsvLine(lines[0]).length;
	const errors: string[] = [];

	for (let i = 1; i < lines.length; i++) {
		const cols = parseCsvLine(lines[i]).length;
		if (cols !== headerCols) {
			errors.push(`Row ${i + 1}: expected ${headerCols} columns, got ${cols}`);
		}
	}

	return JSON.stringify({
		valid: errors.length === 0,
		rows: lines.length,
		columns: headerCols,
		headers: parseCsvLine(lines[0]),
		errors: errors.length > 0 ? errors : undefined,
	});
}

function parseCsvLine(line: string): string[] {
	const result: string[] = [];
	let current = "";
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const ch = line[i];
		if (inQuotes) {
			if (ch === '"') {
				if (i + 1 < line.length && line[i + 1] === '"') {
					current += '"';
					i++;
				} else {
					inQuotes = false;
				}
			} else {
				current += ch;
			}
		} else if (ch === '"') {
			inQuotes = true;
		} else if (ch === ",") {
			result.push(current);
			current = "";
		} else {
			current += ch;
		}
	}
	result.push(current);
	return result;
}

function validateXml(input: string): string {
	const errors: string[] = [];
	const stack: string[] = [];
	const tagRegex = /<\/?([a-zA-Z_][\w:.-]*)[^>]*\/?>/g;
	let match: RegExpExecArray | null;

	// Check basic well-formedness
	const trimmed = input.trim();
	if (!trimmed.startsWith("<")) {
		return JSON.stringify({ valid: false, error: "Does not start with <" });
	}

	match = tagRegex.exec(input);
	while (match !== null) {
		const full = match[0];
		const name = match[1];
		if (full.startsWith("</")) {
			// closing tag
			if (stack.length === 0 || stack[stack.length - 1] !== name) {
				errors.push(`Unexpected closing tag </${name}>`);
			} else {
				stack.pop();
			}
		} else if (!full.endsWith("/>")) {
			// opening tag (not self-closing)
			// skip processing instructions and declarations
			if (!full.startsWith("<?") && !full.startsWith("<!")) {
				stack.push(name);
			}
		}
		match = tagRegex.exec(input);
	}

	if (stack.length > 0) {
		errors.push(`Unclosed tags: ${stack.join(", ")}`);
	}

	return JSON.stringify({
		valid: errors.length === 0,
		errors: errors.length > 0 ? errors : undefined,
	});
}

function validateYaml(input: string): string {
	try {
		const parsed = YAML.parse(input);

		// Determine type of parsed result
		const type = Array.isArray(parsed)
			? "array"
			: parsed === null
				? "null"
				: typeof parsed;

		return JSON.stringify({
			valid: true,
			type,
			keys:
				typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
					? Object.keys(parsed)
					: undefined,
			length: Array.isArray(parsed) ? parsed.length : undefined,
		});
	} catch (e) {
		return JSON.stringify({
			valid: false,
			error: e instanceof Error ? e.message : String(e),
		});
	}
}

export function execute(input: Input): string {
	switch (input.format) {
		case "json":
			return validateJson(input.input);
		case "csv":
			return validateCsv(input.input);
		case "xml":
			return validateXml(input.input);
		case "yaml":
			return validateYaml(input.input);
	}
}

export const tool: ToolDefinition = {
	name: "json_validate",
	description: "Validate and parse JSON, CSV, XML, or YAML strings",
	schema,
	handler: async (args: Record<string, unknown>) => {
		const input = inputSchema.parse(args);
		return execute(input);
	},
};
