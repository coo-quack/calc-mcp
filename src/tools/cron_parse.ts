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

// Weekday name mapping (case-insensitive, English and Japanese)
const WEEKDAY_NAMES: Record<string, number> = {
	// English (3-letter abbreviations)
	sun: 0,
	mon: 1,
	tue: 2,
	wed: 3,
	thu: 4,
	fri: 5,
	sat: 6,
	// English (full names)
	sunday: 0,
	monday: 1,
	tuesday: 2,
	wednesday: 3,
	thursday: 4,
	friday: 5,
	saturday: 6,
	// Japanese (Kanji)
	日: 0,
	月: 1,
	火: 2,
	水: 3,
	木: 4,
	金: 5,
	土: 6,
};

// Month name mapping (case-insensitive)
const MONTH_NAMES: Record<string, number> = {
	jan: 1,
	feb: 2,
	mar: 3,
	apr: 4,
	may: 5,
	jun: 6,
	jul: 7,
	aug: 8,
	sep: 9,
	oct: 10,
	nov: 11,
	dec: 12,
	january: 1,
	february: 2,
	march: 3,
	april: 4,
	june: 6,
	july: 7,
	august: 8,
	september: 9,
	october: 10,
	november: 11,
	december: 12,
};

type FieldType = "weekday" | "month" | "numeric";

function parseField(
	field: string,
	min: number,
	max: number,
	fieldType: FieldType = "numeric",
): CronField {
	const values = new Set<number>();
	const nameMap =
		fieldType === "weekday"
			? WEEKDAY_NAMES
			: fieldType === "month"
				? MONTH_NAMES
				: null;

	const fieldLabel =
		fieldType === "weekday"
			? "weekday"
			: fieldType === "month"
				? "month"
				: "value";

	// Helper to convert name to number
	const toNumber = (str: string): number => {
		const trimmed = str.trim();
		if (nameMap) {
			const key = trimmed.toLowerCase();
			if (Object.hasOwn(nameMap, key)) {
				return nameMap[key];
			}
		}
		// Ensure the entire token is a valid integer (reject partial matches like "5abc")
		if (!/^-?\d+$/.test(trimmed)) {
			throw new Error(`Invalid ${fieldLabel}: "${str}"`);
		}
		const parsed = Number.parseInt(trimmed, 10);
		if (parsed < min || parsed > max) {
			throw new Error(`Invalid ${fieldLabel}: "${str}"`);
		}
		return parsed;
	};

	// In standard cron, weekday 7 is equivalent to 0 (Sunday)
	const normalize = (v: number): number =>
		fieldType === "weekday" && v === 7 ? 0 : v;

	for (const part of field.split(",")) {
		const trimmedPart = part.trim();
		const stepMatch = trimmedPart.match(/^(.+)\/(\d+)$/);
		let range: string;
		let step = 1;

		if (stepMatch) {
			range = stepMatch[1].trim();
			step = Number.parseInt(stepMatch[2], 10);
			if (step <= 0) {
				throw new Error("Step value must be a positive integer");
			}
		} else {
			range = trimmedPart;
		}

		if (range === "*") {
			for (let i = min; i <= max; i += step) values.add(normalize(i));
		} else if (range.includes("-") && /^\S+-\S+$/.test(range)) {
			const [startStr, endStr] = range.split("-", 2);
			const start = toNumber(startStr);
			const end = toNumber(endStr);
			if (start > end) {
				throw new Error(
					`Invalid range "${range}": start value must be less than or equal to end value`,
				);
			}
			for (let i = start; i <= end; i += step) values.add(normalize(i));
		} else {
			values.add(normalize(toNumber(range)));
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
	const month = parseField(fields[3], 1, 12, "month");
	const dow = parseField(fields[4], 0, 7, "weekday");

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

	if (Object.hasOwn(cronAliases, expression)) {
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

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = [
	"",
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

function resolveToken(
	token: string,
	nameMap: Record<string, number>,
	labels: string[],
): string {
	const trimmed = token.trim();
	const key = trimmed.toLowerCase();
	if (Object.hasOwn(nameMap, key)) {
		return labels[nameMap[key]] ?? trimmed;
	}
	const num = Number.parseInt(trimmed, 10);
	if (!Number.isNaN(num) && labels[num] !== undefined) {
		return labels[num];
	}
	return trimmed;
}

function describeField(
	field: string,
	nameMap: Record<string, number>,
	labels: string[],
): string {
	return field
		.split(",")
		.map((part) => {
			const trimmed = part.trim();
			const stepMatch = trimmed.match(/^(.+)\/(\d+)$/);
			const range = stepMatch ? stepMatch[1].trim() : trimmed;
			const step = stepMatch ? stepMatch[2] : null;

			let desc: string;
			if (range.includes("-") && /^\S+-\S+$/.test(range)) {
				const [start, end] = range.split("-", 2);
				desc = `${resolveToken(start, nameMap, labels)}-${resolveToken(end, nameMap, labels)}`;
			} else if (range === "*") {
				desc = "*";
			} else {
				desc = resolveToken(range, nameMap, labels);
			}

			return step ? `${desc}/${step}` : desc;
		})
		.join(", ");
}

function describeCron(fields: string[]): string {
	const parts: string[] = [];

	if (fields[0] !== "*") parts.push(`at minute ${fields[0]}`);
	if (fields[1] !== "*") parts.push(`at hour ${fields[1]}`);
	if (fields[2] !== "*") parts.push(`on day ${fields[2]}`);
	if (fields[3] !== "*")
		parts.push(
			`in month ${describeField(fields[3], MONTH_NAMES, MONTH_LABELS)}`,
		);
	if (fields[4] !== "*")
		parts.push(`on ${describeField(fields[4], WEEKDAY_NAMES, DAY_LABELS)}`);

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
