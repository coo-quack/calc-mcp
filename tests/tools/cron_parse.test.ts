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
});
