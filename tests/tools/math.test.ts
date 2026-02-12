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

	test("0.1 + 0.2 returns exactly 0.3 (BigNumber precision)", () => {
		expect(execute({ expression: "0.1 + 0.2" })).toBe("0.3");
	});

	test("0.1 * 0.1 returns exactly 0.01", () => {
		expect(execute({ expression: "0.1 * 0.1" })).toBe("0.01");
	});

	test("large integer 2^53 + 1 is exact", () => {
		expect(execute({ expression: "2^53 + 1" })).toBe("9007199254740993");
	});

	test("statistics with decimal values has no floating-point drift", () => {
		const result = JSON.parse(
			execute({ action: "statistics", values: [0.1, 0.2, 0.3] }),
		);
		expect(result.sum).toBe(0.6);
		expect(result.mean).toBe(0.2);
	});

	test("rejects dangerous import function", () => {
		expect(() => execute({ expression: "import('fs')" })).toThrow();
	});

	test("rejects dangerous createUnit function", () => {
		expect(() => execute({ expression: "createUnit('foo')" })).toThrow();
	});
});
