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

function getNextOccurrences(
	fields: string[],
	count: number,
	timezone = "UTC",
): Date[] {
	const minute = parseField(fields[0], 0, 59);
	const hour = parseField(fields[1], 0, 23);
	const dom = parseField(fields[2], 1, 31);
	const month = parseField(fields[3], 1, 12);
	const dow = parseField(fields[4], 0, 6); // 0=Sunday

	const results: Date[] = [];
	const now = new Date();

	// Validate timezone early to provide clear error message
	let formatter: Intl.DateTimeFormat;
	try {
		formatter = new Intl.DateTimeFormat("en-US", {
			timeZone: timezone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});
	} catch (_error) {
		throw new Error(
			`Invalid timezone: "${timezone}". Must be a valid IANA timezone identifier.`,
		);
	}

	// Reuse Map to avoid per-iteration allocations
	const partMap = new Map<string, string>();

	// Parse the formatted date to get components in the target timezone
	function parseInTimezone(date: Date): {
		year: number;
		month: number;
		day: number;
		hour: number;
		minute: number;
		dow: number;
	} {
		const parts = formatter.formatToParts(date);

		// Clear and rebuild lookup map
		partMap.clear();
		for (const part of parts) {
			partMap.set(part.type, part.value);
		}

		const get = (type: string) => partMap.get(type) ?? "0";

		const year = Number.parseInt(get("year"), 10);
		const month = Number.parseInt(get("month"), 10);
		const day = Number.parseInt(get("day"), 10);
		let parsedHour = Number.parseInt(get("hour"), 10);
		const parsedMinute = Number.parseInt(get("minute"), 10);

		// Normalize potential "24" hour at midnight to 0 to ensure cron hour=0 matches
		if (parsedHour === 24) {
			parsedHour = 0;
		}

		// Compute day-of-week from the UTC date derived from year/month/day only,
		// to avoid hour/minute parsing edge cases
		const parsedDow = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

		return {
			year,
			month,
			day,
			hour: parsedHour,
			minute: parsedMinute,
			dow: parsedDow,
		};
	}

	// Start from next minute in the target timezone
	const current = new Date(now.getTime() + 60000);
	current.setSeconds(0, 0);

	const maxIterations = 525600; // 1 year of minutes
	let iterations = 0;

	while (results.length < count && iterations < maxIterations) {
		iterations++;

		const parsed = parseInTimezone(current);

		if (
			month.values.has(parsed.month) &&
			dom.values.has(parsed.day) &&
			dow.values.has(parsed.dow) &&
			hour.values.has(parsed.hour) &&
			minute.values.has(parsed.minute)
		) {
			results.push(new Date(current));
		}

		current.setTime(current.getTime() + 60000); // Add 1 minute
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
	const timezone = input.timezone ?? "UTC";
	const occurrences = getNextOccurrences(fields, count, timezone);

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
