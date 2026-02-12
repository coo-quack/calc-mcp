import { z } from "zod";
import type { ToolDefinition } from "../index.js";

const schema = {
	expression: z
		.string()
		.describe("Cron expression (5 fields: min hour dom mon dow)"),
	count: z
		.number()
		.optional()
		.describe("Number of next occurrences to return (default: 5)"),
	timezone: z.string().optional().describe("IANA timezone (default: UTC)"),
};

const inputSchema = z.object(schema);
type Input = z.infer<typeof inputSchema>;

const cronAliases: Record<string, string> = {
	"@yearly": "0 0 1 1 *",
	"@annually": "0 0 1 1 *",
	"@monthly": "0 0 1 * *",
	"@weekly": "0 0 * * 0",
	"@daily": "0 0 * * *",
	"@midnight": "0 0 * * *",
	"@hourly": "0 * * * *",
	"@reboot": "",
};

interface CronField {
	values: Set<number>;
}

function parseField(field: string, min: number, max: number): CronField {
	const values = new Set<number>();

	for (const part of field.split(",")) {
		const stepMatch = part.match(/^(.+)\/(\d+)$/);
		let range: string;
		let step = 1;

		if (stepMatch) {
			range = stepMatch[1];
			step = Number.parseInt(stepMatch[2], 10);
		} else {
			range = part;
		}

		if (range === "*") {
			for (let i = min; i <= max; i += step) values.add(i);
		} else if (range.includes("-")) {
			const [startStr, endStr] = range.split("-");
			const start = Number.parseInt(startStr, 10);
			const end = Number.parseInt(endStr, 10);
			for (let i = start; i <= end; i += step) values.add(i);
		} else {
			values.add(Number.parseInt(range, 10));
		}
	}

	return { values };
}

function getNextOccurrences(fields: string[], count: number): Date[] {
	const minute = parseField(fields[0], 0, 59);
	const hour = parseField(fields[1], 0, 23);
	const dom = parseField(fields[2], 1, 31);
	const month = parseField(fields[3], 1, 12);
	const dow = parseField(fields[4], 0, 6); // 0=Sunday

	const results: Date[] = [];
	const now = new Date();
	const current = new Date(now);
	current.setSeconds(0, 0);
	current.setMinutes(current.getMinutes() + 1);

	const maxIterations = 525600; // 1 year of minutes
	let iterations = 0;

	while (results.length < count && iterations < maxIterations) {
		iterations++;

		if (
			month.values.has(current.getMonth() + 1) &&
			dom.values.has(current.getDate()) &&
			dow.values.has(current.getDay()) &&
			hour.values.has(current.getHours()) &&
			minute.values.has(current.getMinutes())
		) {
			results.push(new Date(current));
		}

		current.setMinutes(current.getMinutes() + 1);
	}

	return results;
}

export function execute(input: Input): string {
	let expression = input.expression.trim();

	if (expression in cronAliases) {
		expression = cronAliases[expression];
		if (expression === "") {
			throw new Error("@reboot is not supported (systemd-only)");
		}
	}

	const fields = expression.split(/\s+/);
	if (fields.length !== 5) {
		throw new Error(
			`Expected 5 fields (minute hour dom month dow), got ${fields.length}`,
		);
	}

	const count = input.count ?? 5;
	const occurrences = getNextOccurrences(fields, count);

	return JSON.stringify(
		{
			expression: input.expression,
			description: describeCron(fields),
			nextOccurrences: occurrences.map((d) => d.toISOString()),
		},
		null,
		2,
	);
}

function describeCron(fields: string[]): string {
	const parts: string[] = [];

	if (fields[0] !== "*") parts.push(`at minute ${fields[0]}`);
	if (fields[1] !== "*") parts.push(`at hour ${fields[1]}`);
	if (fields[2] !== "*") parts.push(`on day ${fields[2]}`);
	if (fields[3] !== "*") parts.push(`in month ${fields[3]}`);
	if (fields[4] !== "*") {
		const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		const days = fields[4]
			.split(",")
			.map((d) => dayNames[Number.parseInt(d, 10)] ?? d)
			.join(", ");
		parts.push(`on ${days}`);
	}

	return parts.length > 0 ? parts.join(", ") : "every minute";
}

export const tool: ToolDefinition = {
	name: "cron_parse",
	description: "Parse cron expression and return next N execution times",
	schema,
	handler: async (args: Record<string, unknown>) => {
		const input = inputSchema.parse(args);
		return execute(input);
	},
};
