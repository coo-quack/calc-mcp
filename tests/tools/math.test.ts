import { describe, expect, test } from "bun:test";
import { execute } from "../../src/tools/math.js";

describe("math", () => {
	test("evaluates basic expression", () => {
		expect(execute({ expression: "2 + 3" })).toBe("5");
	});

	test("evaluates complex expression", () => {
		expect(execute({ expression: "sqrt(16) + 2^3" })).toBe("12");
	});

	test("evaluates trigonometric functions", () => {
		const result = Number(execute({ expression: "sin(pi/2)" }));
		expect(result).toBeCloseTo(1);
	});

	test("computes statistics", () => {
		const result = JSON.parse(
			execute({ action: "statistics", values: [1, 2, 3, 4, 5] }),
		);
		expect(result.mean).toBe(3);
		expect(result.median).toBe(3);
		expect(result.sum).toBe(15);
		expect(result.min).toBe(1);
		expect(result.max).toBe(5);
		expect(result.count).toBe(5);
	});

	test("computes statistics with even count", () => {
		const result = JSON.parse(
			execute({ action: "statistics", values: [1, 2, 3, 4] }),
		);
		expect(result.median).toBe(2.5);
	});

	test("throws on empty values", () => {
		expect(() => execute({ action: "statistics", values: [] })).toThrow();
	});

	test("evaluates matrix expression", () => {
		const result = execute({ expression: "det([1, 2; 3, 4])" });
		expect(Number(result)).toBeCloseTo(-2);
	});
});
