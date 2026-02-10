import { describe, expect, test } from "bun:test";
import { execute } from "../../src/tools/datetime.js";

describe("datetime - now", () => {
	test("returns current UTC datetime in ISO format", () => {
		const result = execute({ action: "now" });
		// Should be a valid ISO-like string with +00:00
		expect(result).toContain("+00:00");
		expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
	});

	test("returns current datetime in specified timezone", () => {
		const result = execute({ action: "now", timezone: "Asia/Tokyo" });
		expect(result).toContain("+09:00");
	});

	test("returns date-only with format=date", () => {
		const result = execute({ action: "now", format: "date" });
		expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});

	test("returns time-only with format=time", () => {
		const result = execute({ action: "now", format: "time" });
		expect(result).toMatch(/^\d{2}:\d{2}:\d{2}/);
	});

	test("returns full format", () => {
		const result = execute({
			action: "now",
			timezone: "America/New_York",
			format: "full",
		});
		// Should contain day name and timezone name
		expect(result).toMatch(
			/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/,
		);
		expect(result).toContain("Eastern");
	});
});

describe("datetime - convert", () => {
	test("converts UTC to Asia/Tokyo", () => {
		const result = execute({
			action: "convert",
			datetime: "2025-01-15T12:00:00Z",
			toTimezone: "Asia/Tokyo",
		});
		expect(result).toContain("2025-01-15T21:00:00");
		expect(result).toContain("+09:00");
	});

	test("converts between non-UTC timezones", () => {
		const result = execute({
			action: "convert",
			datetime: "2025-06-15T12:00:00+09:00",
			toTimezone: "America/New_York",
		});
		// JST 12:00 = UTC 03:00 = EDT 23:00 (previous day)
		expect(result).toContain("2025-06-14T23:00:00");
	});

	test("throws on missing datetime", () => {
		expect(() => execute({ action: "convert", toTimezone: "UTC" })).toThrow(
			"datetime is required",
		);
	});

	test("throws on invalid datetime", () => {
		expect(() =>
			execute({
				action: "convert",
				datetime: "not-a-date",
				toTimezone: "UTC",
			}),
		).toThrow("Invalid datetime");
	});
});

describe("datetime - format", () => {
	test("formats datetime as ISO in timezone", () => {
		const result = execute({
			action: "format",
			datetime: "2025-07-04T12:00:00Z",
			timezone: "America/Los_Angeles",
		});
		expect(result).toContain("2025-07-04T05:00:00");
	});

	test("formats as date only", () => {
		const result = execute({
			action: "format",
			datetime: "2025-03-20T15:30:00Z",
			timezone: "UTC",
			format: "date",
		});
		expect(result).toBe("2025-03-20");
	});

	test("formats with custom Intl options", () => {
		const result = execute({
			action: "format",
			datetime: "2025-12-25T00:00:00Z",
			timezone: "UTC",
			format: '{"dateStyle":"long"}',
		});
		expect(result).toContain("December");
		expect(result).toContain("25");
		expect(result).toContain("2025");
	});
});

describe("datetime - timestamp", () => {
	test("converts UNIX timestamp to ISO datetime", () => {
		const result = execute({
			action: "timestamp",
			timestamp: 0,
		});
		expect(result).toContain("1970-01-01T00:00:00");
	});

	test("converts UNIX timestamp with timezone", () => {
		const result = execute({
			action: "timestamp",
			timestamp: 1736899200,
			timezone: "Asia/Tokyo",
		});
		expect(result).toContain("+09:00");
	});

	test("converts ISO datetime to UNIX timestamp", () => {
		const result = execute({
			action: "timestamp",
			datetime: "2025-01-15T03:00:00Z",
		});
		expect(result).toBe("1736910000");
	});

	test("returns current timestamp when no input given", () => {
		const before = Math.floor(Date.now() / 1000);
		const result = Number(execute({ action: "timestamp" }));
		const after = Math.floor(Date.now() / 1000);
		expect(result).toBeGreaterThanOrEqual(before);
		expect(result).toBeLessThanOrEqual(after);
	});

	test("roundtrips timestamp correctly", () => {
		const original = 1700000000;
		const iso = execute({ action: "timestamp", timestamp: original });
		const back = execute({ action: "timestamp", datetime: iso });
		expect(Number(back)).toBe(original);
	});
});
