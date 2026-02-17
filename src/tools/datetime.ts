import { format as dateFnsFormat } from "date-fns";
import { z } from "zod";
import type { ToolDefinition } from "../index.js";
import { assertExists } from "../utils.js";

const schema = {
	action: z
		.enum(["now", "convert", "format", "timestamp"])
		.describe(
			"now: current datetime, convert: timezone conversion, format: reformat datetime, timestamp: unix↔ISO8601",
		),
	timezone: z
		.string()
		.optional()
		.describe("IANA timezone (e.g. Asia/Tokyo, America/New_York)"),
	datetime: z
		.string()
		.optional()
		.describe("ISO8601 datetime string for convert/format"),
	fromTimezone: z
		.string()
		.optional()
		.describe("Source timezone for conversion"),
	toTimezone: z.string().optional().describe("Target timezone for conversion"),
	format: z
		.string()
		.optional()
		.describe(
			"Output format: iso, date, time, full, short, or date-fns pattern (e.g. yyyy/MM/dd HH:mm), or Intl JSON options",
		),
	timestamp: z
		.number()
		.optional()
		.describe("UNIX timestamp in seconds for timestamp action"),
};

const inputSchema = z.object(schema);
type Input = z.infer<typeof inputSchema>;

function toISOInTimezone(date: Date, timezone: string): string {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: timezone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		fractionalSecondDigits: 3,
		hour12: false,
	}).formatToParts(date);

	const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
	const hour = get("hour") === "24" ? "00" : get("hour");

	return `${get("year")}-${get("month")}-${get("day")}T${hour}:${get("minute")}:${get("second")}.${get("fractionalSecond")}`;
}

function getOffsetString(date: Date, timezone: string): string {
	const formatter = new Intl.DateTimeFormat("en-US", {
		timeZone: timezone,
		timeZoneName: "shortOffset",
	});
	const parts = formatter.formatToParts(date);
	const tzPart = parts.find((p) => p.type === "timeZoneName")?.value ?? "UTC";
	if (tzPart === "GMT") return "+00:00";
	const match = tzPart.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/);
	if (!match || !match[1] || !match[2]) return "+00:00";
	const sign = match[1];
	const hours = match[2].padStart(2, "0");
	const minutes = (match[3] ?? "00").padStart(2, "0");
	return `${sign}${hours}:${minutes}`;
}

function toDateInTimezone(date: Date, timezone: string): Date {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: timezone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		fractionalSecondDigits: 3,
		hour12: false,
	}).formatToParts(date);

	const get = (type: string) =>
		Number.parseInt(parts.find((p) => p.type === type)?.value ?? "0", 10);
	const hour = get("hour") === 24 ? 0 : get("hour");

	return new Date(
		get("year"),
		get("month") - 1,
		get("day"),
		hour,
		get("minute"),
		get("second"),
	);
}

function formatOutput(date: Date, timezone: string, format?: string): string {
	const offset = getOffsetString(date, timezone);
	const isoLocal = toISOInTimezone(date, timezone);

	switch (format) {
		case "date":
			return assertExists(isoLocal.split("T")[0], "date formatting");
		case "time":
			return `${assertExists(isoLocal.split("T")[1], "time formatting")}${offset}`;
		case "short":
			return date.toLocaleString("en-US", {
				timeZone: timezone,
				year: "numeric",
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				hour12: true,
			});
		case "full":
			return date.toLocaleString("en-US", {
				timeZone: timezone,
				weekday: "long",
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				hour12: true,
				timeZoneName: "long",
			});
		case "iso":
		case undefined:
			return `${isoLocal}${offset}`;
		default: {
			// Try as Intl.DateTimeFormatOptions JSON first
			if (format.startsWith("{")) {
				try {
					const opts = JSON.parse(format) as Intl.DateTimeFormatOptions;
					opts.timeZone = timezone;
					return date.toLocaleString("en-US", opts);
				} catch {
					// fall through to date-fns
				}
			}
			// Use date-fns format pattern (e.g. "yyyy/MM/dd HH:mm")
			try {
				const tzDate = toDateInTimezone(date, timezone);
				return dateFnsFormat(tzDate, format);
			} catch {
				return `${isoLocal}${offset}`;
			}
		}
	}
}

export function execute(input: Input): string {
	switch (input.action) {
		case "now": {
			const tz = input.timezone ?? "UTC";
			const now = new Date();
			return formatOutput(now, tz, input.format);
		}
		case "convert": {
			if (!input.datetime) throw new Error("datetime is required for convert");
			const toTz = input.toTimezone ?? "UTC";
			const date = new Date(input.datetime);
			if (Number.isNaN(date.getTime()))
				throw new Error(`Invalid datetime: ${input.datetime}`);
			return formatOutput(date, toTz, input.format);
		}
		case "format": {
			if (!input.datetime) throw new Error("datetime is required for format");
			const tz = input.timezone ?? "UTC";
			const date = new Date(input.datetime);
			if (Number.isNaN(date.getTime()))
				throw new Error(`Invalid datetime: ${input.datetime}`);
			return formatOutput(date, tz, input.format ?? "iso");
		}
		case "timestamp": {
			if (input.timestamp !== undefined) {
				const date = new Date(input.timestamp * 1000);
				const tz = input.timezone ?? "UTC";
				return formatOutput(date, tz, input.format);
			}
			if (input.datetime) {
				const date = new Date(input.datetime);
				if (Number.isNaN(date.getTime()))
					throw new Error(`Invalid datetime: ${input.datetime}`);
				return String(Math.floor(date.getTime() / 1000));
			}
			return String(Math.floor(Date.now() / 1000));
		}
	}
}

export const tool: ToolDefinition = {
	name: "datetime",
	description:
		"Get current datetime, convert timezones, format dates, and convert UNIX timestamps",
	schema,
	handler: async (args: Record<string, unknown>) => {
		const input = inputSchema.parse(args);
		return execute(input);
	},
};
