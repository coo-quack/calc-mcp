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
		const withUtc = JSON.parse(
			execute({ expression: "0 0 * * *", count: 1, timezone: "UTC" }),
		);

		expect(withoutTz.nextOccurrences[0]).toBe(withUtc.nextOccurrences[0]);
	});
});
