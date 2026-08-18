import { format as dateFnsFormat } from "date-fns";
import { z } from "zod";
import type { ToolDefinition } from "../index.js";
import { assertExists } from "../utils.js";

const MAX_TIMEZONE_LENGTH = 64;
const MAX_DATETIME_LENGTH = 64;
const MAX_FORMAT_LENGTH = 1024;

const schema = {
  action: z
    .enum(["now", "convert", "format", "timestamp"])
    .describe(
      "now: current datetime, convert: timezone conversion, format: reformat datetime, timestamp: unix↔ISO8601",
    ),
  timezone: z
    .string()
    .max(MAX_TIMEZONE_LENGTH)
    .optional()
    .describe(
      "IANA timezone (e.g. Asia/Tokyo, America/New_York). Names the output zone for now/format/timestamp; for convert it is read as the source zone when fromTimezone is absent",
    ),
  datetime: z
    .string()
    .max(MAX_DATETIME_LENGTH)
    .optional()
    .describe(
      "Datetime string for convert/format/timestamp. If it carries a UTC designator or a numeric offset (2026-11-03T14:30:00Z, ...+09:00) it is absolute and fromTimezone is ignored. Otherwise it is a wall-clock time read in fromTimezone, defaulting to UTC",
    ),
  fromTimezone: z
    .string()
    .max(MAX_TIMEZONE_LENGTH)
    .optional()
    .describe(
      "IANA timezone the datetime string is written in, used when the string has no offset of its own. Defaults to UTC",
    ),
  toTimezone: z
    .string()
    .max(MAX_TIMEZONE_LENGTH)
    .optional()
    .describe("Target timezone for conversion"),
  format: z
    .string()
    .max(MAX_FORMAT_LENGTH)
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

/** Wall-clock fields of `date` as seen in `timezone`. */
function partsInTimezone(
  date: Date,
  timezone: string,
  fractional = false,
): Record<string, string> {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    ...(fractional ? { fractionalSecondDigits: 3 as const } : {}),
    hour12: false,
  }).formatToParts(date);

  const out: Record<string, string> = {};
  for (const part of parts) out[part.type] = part.value;
  // Some engines render midnight as hour 24.
  if (out.hour === "24") out.hour = "00";
  return out;
}

function toISOInTimezone(date: Date, timezone: string): string {
  const p = partsInTimezone(date, timezone, true);
  const get = (type: string) => p[type] ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}.${get("fractionalSecond")}`;
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
  const p = partsInTimezone(date, timezone, true);
  const get = (type: string) => Number.parseInt(p[type] ?? "0", 10);
  return new Date(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );
}

const WALL_CLOCK_RE =
  /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?$/;

function assertTimezone(timezone: string): void {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
  } catch {
    throw new Error(`Invalid timezone: ${timezone}`);
  }
}

/** Offset of `timezone` from UTC at `instant`, in milliseconds. */
function offsetMsAt(instant: Date, timezone: string): number {
  const p = partsInTimezone(instant, timezone);
  const get = (type: string) => Number.parseInt(p[type] ?? "0", 10);
  const asIfUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );
  return asIfUtc - (instant.getTime() - instant.getMilliseconds());
}

/**
 * Resolve a datetime string to an absolute instant.
 *
 * A string that carries its own UTC designator or numeric offset is already
 * absolute, and `sourceTimezone` is ignored. A bare wall-clock string is read in
 * `sourceTimezone`, which defaults to UTC — never the host's local zone, so the
 * result does not depend on the machine the server runs on.
 */
function parseInstant(datetime: string, sourceTimezone?: string): Date {
  const wall = datetime.trim().match(WALL_CLOCK_RE);
  if (!wall) {
    const absolute = new Date(datetime);
    if (Number.isNaN(absolute.getTime()))
      throw new Error(`Invalid datetime: ${datetime}`);
    return absolute;
  }

  const timezone = sourceTimezone ?? "UTC";
  assertTimezone(timezone);

  const num = (v: string | undefined) =>
    v === undefined ? 0 : Number.parseInt(v, 10);
  const guess = Date.UTC(
    num(wall[1]),
    num(wall[2]) - 1,
    num(wall[3]),
    num(wall[4]),
    num(wall[5]),
    num(wall[6]),
    num(wall[7]?.padEnd(3, "0")),
  );
  if (Number.isNaN(guess)) throw new Error(`Invalid datetime: ${datetime}`);

  // The offset depends on the instant, and the instant depends on the offset.
  // One refinement settles it everywhere except an ambiguous DST fold, where
  // either reading is defensible and the first is kept.
  const first = offsetMsAt(new Date(guess), timezone);
  const candidate = guess - first;
  const second = offsetMsAt(new Date(candidate), timezone);
  return new Date(second === first ? candidate : guess - second);
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
      assertTimezone(toTz);
      // `timezone` has no other meaning for convert, so accept it as the source
      // when the caller did not use `fromTimezone`.
      const date = parseInstant(
        input.datetime,
        input.fromTimezone ?? input.timezone,
      );
      return formatOutput(date, toTz, input.format);
    }
    case "format": {
      if (!input.datetime) throw new Error("datetime is required for format");
      const tz = input.timezone ?? "UTC";
      assertTimezone(tz);
      const date = parseInstant(input.datetime, input.fromTimezone);
      return formatOutput(date, tz, input.format ?? "iso");
    }
    case "timestamp": {
      if (input.timestamp !== undefined) {
        const date = new Date(input.timestamp * 1000);
        const tz = input.timezone ?? "UTC";
        return formatOutput(date, tz, input.format);
      }
      if (input.datetime) {
        const date = parseInstant(input.datetime, input.fromTimezone);
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
