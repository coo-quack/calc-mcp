import { describe, expect, test } from "bun:test";
import { execute } from "../../src/tools/date.js";

describe("date", () => {
	test("diff between two dates", () => {
		const result = JSON.parse(
			execute({ action: "diff", date: "2024-01-01", date2: "2024-12-31" }),
		);
		expect(result.days).toBe(365);
		expect(result.months).toBe(11);
	});

	test("add days to date", () => {
		const result = execute({
			action: "add",
			date: "2024-01-01",
			amount: 10,
			unit: "days",
		});
		expect(result).toContain("2024-01-11");
	});

	test("add months to date", () => {
		const result = execute({
			action: "add",
			date: "2024-01-31",
			amount: 1,
			unit: "months",
		});
		expect(result).toContain("2024-02-29"); // leap year
	});

	test("weekday returns correct day", () => {
		const result = JSON.parse(
			execute({ action: "weekday", date: "2024-01-01" }),
		);
		expect(result.weekday).toBe("Monday");
		expect(result.weekdayJa).toBe("月曜日");
	});

	test("wareki - Reiwa", () => {
		const result = execute({ action: "wareki", date: "2024-06-15" });
		expect(result).toBe("令和6年6月15日");
	});

	test("wareki - Heisei", () => {
		const result = execute({ action: "wareki", date: "2018-12-31" });
		expect(result).toBe("平成30年12月31日");
	});

	test("wareki - Showa", () => {
		const result = execute({ action: "wareki", date: "1985-01-01" });
		expect(result).toBe("昭和60年1月1日");
	});
});
