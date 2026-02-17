import { parse } from "yaml";
import { z } from "zod";
import type { ToolDefinition } from "../index.js";
import { arrayGet, matchGet } from "../utils.js";

const schema = {
	input: z.string().describe("String to validate/parse"),
	format: z
		.enum(["json", "csv", "xml", "yaml"])
		.describe("Format to validate as"),
};

const inputSchema = z.object(schema);
type Input = z.infer<typeof inputSchema>;

function getTypeOfParsed(parsed: unknown): string {
	return Array.isArray(parsed)
		? "array"
		: parsed === null
			? "null"
			: typeof parsed;
}

function getStructureInfo(parsed: unknown): {
	keys?: string[];
	length?: number;
} {
	return {
		keys:
			typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
				? Object.keys(parsed)
				: undefined,
		length: Array.isArray(parsed) ? parsed.length : undefined,
	};
}

function validateJson(input: string): string {
	try {
		const parsed = JSON.parse(input);
		const type = getTypeOfParsed(parsed);
		return JSON.stringify({
			valid: true,
			type,
			...getStructureInfo(parsed),
		});
	} catch (e) {
		const message = e instanceof Error ? e.message : String(e);
		return JSON.stringify({
			valid: false,
			error: message,
			errors: [message],
		});
	}
}

function validateCsv(input: string): string {
	const trimmed = input.trim();
	if (trimmed.length === 0) {
		const message = "Empty input";
		return JSON.stringify({
			valid: false,
			error: message,
			errors: [message],
		});
	}

	const lines = trimmed.split("\n");
	// lines is guaranteed non-empty since trimmed is non-empty
	const headerCols = parseCsvLine(arrayGet(lines, 0)).length;
	const errors: string[] = [];

	for (let i = 1; i < lines.length; i++) {
		const cols = parseCsvLine(arrayGet(lines, i)).length;
		if (cols !== headerCols) {
			errors.push(`Row ${i + 1}: expected ${headerCols} columns, got ${cols}`);
		}
	}

	return JSON.stringify({
		valid: errors.length === 0,
		rows: lines.length,
		columns: headerCols,
		headers: parseCsvLine(arrayGet(lines, 0)),
		error: errors.length > 0 ? arrayGet(errors, 0) : undefined,
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
	if (trimmed.length === 0) {
		const message = "Empty input";
		return JSON.stringify({
			valid: false,
			error: message,
			errors: [message],
		});
	}
	if (!trimmed.startsWith("<")) {
		const message = "Does not start with <";
		return JSON.stringify({
			valid: false,
			error: message,
			errors: [message],
		});
	}

	match = tagRegex.exec(input);
	while (match !== null) {
		const full = match[0];
		const name = matchGet(match, 1);
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
		error: errors.length > 0 ? errors[0] : undefined,
		errors: errors.length > 0 ? errors : undefined,
	});
}

const MULTI_DOC_INDICATORS = [
	"parseAllDocuments",
	"multiple documents",
	"multi-document",
];

function isMultiDocumentError(message: string): boolean {
	const lower = message.toLowerCase();
	return MULTI_DOC_INDICATORS.some((ind) => lower.includes(ind));
}

function validateYaml(input: string): string {
	// YAML spec: empty/whitespace-only documents parse to null — let parse() handle them
	try {
		const parsed = parse(input, { logLevel: "error" });
		const type = getTypeOfParsed(parsed);

		return JSON.stringify({
			valid: true,
			type,
			...getStructureInfo(parsed),
		});
	} catch (e) {
		let message = e instanceof Error ? e.message : String(e);
		if (isMultiDocumentError(message)) {
			message =
				"Source contains multiple YAML documents; only single-document input is supported";
		}
		return JSON.stringify({
			valid: false,
			error: message,
			errors: [message],
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
