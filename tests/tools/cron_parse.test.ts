import { describe, expect, test } from "bun:test";
import { execute } from "../../src/tools/cron_parse.js";

describe("cron_parse", () => {
	test("parses every minute", () => {
		const result = JSON.parse(execute({ expression: "* * * * *", count: 3 }));
		expect(result.nextOccurrences).toHaveLength(3);
		expect(result.description).toBe("every minute");
	});

	test("parses specific time", () => {
		const result = JSON.parse(execute({ expression: "30 9 * * *" }));
		expect(result.nextOccurrences.length).toBeGreaterThan(0);
		expect(result.description).toContain("minute 30");
		expect(result.description).toContain("hour 9");
	});

	test("parses daily at midnight", () => {
		const result = JSON.parse(execute({ expression: "0 0 * * *", count: 2 }));
		expect(result.nextOccurrences).toHaveLength(2);
	});

	test("rejects invalid expression", () => {
		expect(() => execute({ expression: "invalid" })).toThrow();
	});

	test("parses range and step", () => {
		const result = JSON.parse(
			execute({ expression: "*/15 * * * *", count: 4 }),
		);
		expect(result.nextOccurrences).toHaveLength(4);
	});

	test("default count is 5", () => {
		const result = JSON.parse(execute({ expression: "* * * * *" }));
		expect(result.nextOccurrences).toHaveLength(5);
	});

	test("supports @daily alias", () => {
		const result = JSON.parse(execute({ expression: "@daily", count: 1 }));
		expect(result.expression).toBe("@daily");
		expect(result.nextOccurrences[0]).toMatch(/T00:00:00/);
	});

	test("supports @hourly alias", () => {
		const result = JSON.parse(execute({ expression: "@hourly", count: 1 }));
		expect(result.expression).toBe("@hourly");
		expect(result.nextOccurrences[0]).toMatch(/:\d{2}:00/);
	});

	test("supports @weekly alias", () => {
		const result = JSON.parse(execute({ expression: "@weekly", count: 1 }));
		expect(result.expression).toBe("@weekly");
	});

	test("supports @monthly alias", () => {
		const result = JSON.parse(execute({ expression: "@monthly", count: 1 }));
		expect(result.expression).toBe("@monthly");
	});

	test("supports @yearly and @annually alias", () => {
		const yearly = JSON.parse(execute({ expression: "@yearly", count: 1 }));
		const annually = JSON.parse(execute({ expression: "@annually", count: 1 }));
		expect(yearly.nextOccurrences).toEqual(annually.nextOccurrences);
	});

	test("rejects @reboot", () => {
		expect(() => execute({ expression: "@reboot" })).toThrow(
			"@reboot is not supported",
		);
	});

	test("respects timezone parameter", () => {
		// This test verifies that timezone affects the output
		// Using a cron expression that runs at a specific hour
		const utc = JSON.parse(
			execute({ expression: "0 12 * * *", count: 1, timezone: "UTC" }),
		);
		const tokyo = JSON.parse(
			execute({ expression: "0 12 * * *", count: 1, timezone: "Asia/Tokyo" }),
		);

		// The ISO timestamps should be different when interpreted in different timezones
		expect(utc.nextOccurrences[0]).not.toBe(tokyo.nextOccurrences[0]);

		// Verify the UTC result is actually at 12:00 UTC
		const utcDate = new Date(utc.nextOccurrences[0]);
		expect(utcDate.getUTCHours()).toBe(12);
		expect(utcDate.getUTCMinutes()).toBe(0);

		// Verify the Tokyo result is at 12:00 in Tokyo time (which is 03:00 UTC)
		const tokyoDate = new Date(tokyo.nextOccurrences[0]);
		const tokyoHour = new Intl.DateTimeFormat("en-US", {
			timeZone: "Asia/Tokyo",
			hour: "2-digit",
			hour12: false,
		}).format(tokyoDate);
		expect(tokyoHour).toBe("12");
	});

	test("defaults to UTC when timezone not specified", () => {
		const withoutTz = JSON.parse(
			execute({ expression: "0 0 * * *", count: 1 }),
		);

		// Verify the occurrence is at midnight UTC
		const occurrence = new Date(withoutTz.nextOccurrences[0]);
		expect(occurrence.getUTCHours()).toBe(0);
		expect(occurrence.getUTCMinutes()).toBe(0);
	});

	test("throws clear error for invalid timezone", () => {
		expect(() =>
			execute({ expression: "0 0 * * *", timezone: "Invalid/Timezone" }),
		).toThrow(/Invalid timezone.*Invalid\/Timezone/);
	});

	test("handles midnight (hour 24) correctly", () => {
		// Some Intl implementations return hour=24 at midnight instead of hour=0
		// This test verifies that midnight cron schedules still match
		const result = JSON.parse(
			execute({
				expression: "0 0 * * *",
				count: 1,
				timezone: "America/New_York",
			}),
		);

		// Should find the next midnight occurrence
		const date = new Date(result.nextOccurrences[0]);
		const nyHour = new Intl.DateTimeFormat("en-US", {
			timeZone: "America/New_York",
			hour: "2-digit",
			hour12: false,
			hourCycle: "h23",
		}).format(date);

		expect(nyHour).toBe("00");
	});

	test("parses weekday names (MON-FRI)", () => {
		const result = JSON.parse(
			execute({ expression: "0 9 * * MON-FRI", count: 5 }),
		);
		expect(result.nextOccurrences).toHaveLength(5);

		// Verify all occurrences are on weekdays (Mon=1, Fri=5)
		for (const occurrence of result.nextOccurrences) {
			const date = new Date(occurrence);
			const day = date.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat
			expect(day >= 1 && day <= 5).toBe(true);
		}
	});

	test("parses weekday abbreviations", () => {
		const result = JSON.parse(
			execute({ expression: "0 0 * * MON,WED,FRI", count: 3 }),
		);
		expect(result.nextOccurrences).toHaveLength(3);

		for (const occurrence of result.nextOccurrences) {
			const date = new Date(occurrence);
			const day = date.getUTCDay();
			expect([1, 3, 5]).toContain(day); // Mon, Wed, Fri
		}
	});

	test("handles extra whitespace in expression", () => {
		const result = JSON.parse(
			execute({ expression: "  0  0  *  *  MON,WED,FRI  ", count: 3 }),
		);
		expect(result.nextOccurrences).toHaveLength(3);

		for (const occurrence of result.nextOccurrences) {
			const date = new Date(occurrence);
			const day = date.getUTCDay();
			expect([1, 3, 5]).toContain(day);
		}
	});

	test("parses full weekday names (case-insensitive)", () => {
		const result = JSON.parse(
			execute({ expression: "0 0 * * mOnDaY,FRIDAY", count: 2 }),
		);
		expect(result.nextOccurrences).toHaveLength(2);

		for (const occurrence of result.nextOccurrences) {
			const date = new Date(occurrence);
			const day = date.getUTCDay();
			expect([1, 5]).toContain(day); // Mon, Fri
		}
	});

	test("parses Japanese weekday names (月-金)", () => {
		const result = JSON.parse(
			execute({ expression: "0 9 * * 月-金", count: 5 }),
		);
		expect(result.nextOccurrences).toHaveLength(5);

		for (const occurrence of result.nextOccurrences) {
			const date = new Date(occurrence);
			const day = date.getUTCDay();
			expect(day >= 1 && day <= 5).toBe(true);
		}
	});

	test("parses month names (JAN-MAR)", () => {
		const result = JSON.parse(
			execute({ expression: "0 0 1 JAN-MAR *", count: 3 }),
		);
		expect(result.nextOccurrences).toHaveLength(3);

		for (const occurrence of result.nextOccurrences) {
			const date = new Date(occurrence);
			const month = date.getUTCMonth() + 1; // 1=Jan, ..., 12=Dec
			expect(month >= 1 && month <= 3).toBe(true);
		}
	});

	test("parses full month names (case-insensitive)", () => {
		const result = JSON.parse(
			execute({ expression: "0 0 1 JaNuArY,DeCeMbEr *", count: 2 }),
		);
		expect(result.nextOccurrences).toHaveLength(2);

		for (const occurrence of result.nextOccurrences) {
			const date = new Date(occurrence);
			const month = date.getUTCMonth() + 1;
			expect([1, 12]).toContain(month); // Jan, Dec
		}
	});

	test("weekday names work with steps (MON-FRI/2)", () => {
		const result = JSON.parse(
			execute({ expression: "0 0 * * MON-FRI/2", count: 3 }),
		);
		expect(result.nextOccurrences).toHaveLength(3);

		for (const occurrence of result.nextOccurrences) {
			const date = new Date(occurrence);
			const day = date.getUTCDay();
			expect([1, 3, 5]).toContain(day); // Mon, Wed, Fri (every 2 days)
		}
	});

	test("month names work with steps (JAN-JUN/2)", () => {
		const result = JSON.parse(
			execute({ expression: "0 0 1 JAN-JUN/2 *", count: 3 }),
		);
		expect(result.nextOccurrences).toHaveLength(3);

		for (const occurrence of result.nextOccurrences) {
			const date = new Date(occurrence);
			const month = date.getUTCMonth() + 1;
			expect([1, 3, 5]).toContain(month); // Jan, Mar, May (every 2 months)
		}
	});

	test("rejects invalid weekday names", () => {
		expect(() => execute({ expression: "0 0 * * INVALID", count: 1 })).toThrow(
			"Invalid weekday",
		);
	});

	test("rejects out-of-range weekday values", () => {
		expect(() => execute({ expression: "0 0 * * 8", count: 1 })).toThrow(
			"Invalid weekday",
		);
	});

	test("rejects invalid month names", () => {
		expect(() => execute({ expression: "0 0 1 INVALID *", count: 1 })).toThrow(
			"Invalid month",
		);
	});

	test("rejects out-of-range month values", () => {
		expect(() => execute({ expression: "0 0 1 13 *", count: 1 })).toThrow(
			"Invalid month",
		);
		expect(() => execute({ expression: "0 0 1 0 *", count: 1 })).toThrow(
			"Invalid month",
		);
	});

	test("rejects step value of 0", () => {
		expect(() =>
			execute({ expression: "0 0 * * MON-FRI/0", count: 1 }),
		).toThrow("Step value must be a positive integer");
	});

	test("rejects wrap-around range (SAT-SUN)", () => {
		expect(() => execute({ expression: "0 0 * * SAT-SUN", count: 1 })).toThrow(
			"Invalid range",
		);
	});

	test("rejects reversed month range (DEC-JAN)", () => {
		expect(() => execute({ expression: "0 0 1 DEC-JAN *", count: 1 })).toThrow(
			"Invalid range",
		);
	});

	test("rejects multiple hyphens in range (MON-FRI-SAT)", () => {
		expect(() =>
			execute({ expression: "0 0 * * MON-FRI-SAT", count: 1 }),
		).toThrow("Invalid range");
	});

	test("treats weekday 7 as Sunday", () => {
		const withSeven = JSON.parse(
			execute({ expression: "0 0 * * 7", count: 3 }),
		);
		const withZero = JSON.parse(execute({ expression: "0 0 * * 0", count: 3 }));
		expect(withSeven.nextOccurrences).toEqual(withZero.nextOccurrences);
		expect(withSeven.description).toBe(withZero.description);

		for (const occurrence of withSeven.nextOccurrences) {
			const date = new Date(occurrence);
			expect(date.getUTCDay()).toBe(0);
		}
	});

	test("describes named weekday fields", () => {
		const result = JSON.parse(
			execute({ expression: "0 9 * * MON-FRI", count: 1 }),
		);
		expect(result.description).toContain("on Mon-Fri");
	});

	test("describes named month fields", () => {
		const result = JSON.parse(
			execute({ expression: "0 0 1 JAN-MAR *", count: 1 }),
		);
		expect(result.description).toContain("in month Jan-Mar");
	});

	test("describes numeric weekday ranges", () => {
		const result = JSON.parse(execute({ expression: "0 9 * * 1-5", count: 1 }));
		expect(result.description).toContain("on Mon-Fri");
	});

	test("describes comma-separated weekday names", () => {
		const result = JSON.parse(
			execute({ expression: "0 0 * * MON,WED,FRI", count: 1 }),
		);
		expect(result.description).toContain("on Mon, Wed, Fri");
	});

	test("describes steps with names", () => {
		const result = JSON.parse(
			execute({ expression: "0 0 * * MON-FRI/2", count: 1 }),
		);
		expect(result.description).toContain("on Mon-Fri/2");
	});
});
