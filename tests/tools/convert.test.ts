import { describe, expect, test } from "bun:test";
import { execute } from "../../src/tools/convert.js";

describe("convert", () => {
	test("meters to feet", () => {
		const result = JSON.parse(execute({ value: 1, from: "m", to: "ft" }));
		expect(result.result).toBeCloseTo(3.28084, 4);
	});

	test("kg to lb", () => {
		const result = JSON.parse(execute({ value: 1, from: "kg", to: "lb" }));
		expect(result.result).toBeCloseTo(2.20462, 4);
	});

	test("Celsius to Fahrenheit", () => {
		const result = JSON.parse(
			execute({ value: 100, from: "C", to: "F", category: "temperature" }),
		);
		expect(result.result).toBe(212);
	});

	test("Fahrenheit to Celsius", () => {
		const result = JSON.parse(
			execute({ value: 32, from: "F", to: "C", category: "temperature" }),
		);
		expect(result.result).toBe(0);
	});

	test("km to mi", () => {
		const result = JSON.parse(execute({ value: 1, from: "km", to: "mi" }));
		expect(result.result).toBeCloseTo(0.621371, 4);
	});

	test("GB to MB", () => {
		const result = JSON.parse(execute({ value: 1, from: "gb", to: "mb" }));
		expect(result.result).toBe(1024);
	});

	test("hours to minutes", () => {
		const result = JSON.parse(execute({ value: 2, from: "h", to: "min" }));
		expect(result.result).toBe(120);
		expect(result.category).toBe("time");
	});

	test("days to seconds", () => {
		const result = JSON.parse(execute({ value: 1, from: "day", to: "s" }));
		expect(result.result).toBe(86400);
	});

	test("weeks to days", () => {
		const result = JSON.parse(execute({ value: 1, from: "week", to: "day" }));
		expect(result.result).toBe(7);
	});

	test("unknown unit throws with supported list", () => {
		expect(() => execute({ value: 1, from: "xyz", to: "abc" })).toThrow(
			"Supported units",
		);
	});

	test("unknown unit in category throws with supported list", () => {
		expect(() =>
			execute({ value: 1, from: "m", to: "xyz", category: "length" }),
		).toThrow("Supported");
	});

	test("byte aliases work correctly", () => {
		// Test that full unit names (byte, kilobyte, etc.) map to correct lowercase keys
		const result1 = JSON.parse(execute({ value: 1, from: "kilobyte", to: "byte" }));
		expect(result1.result).toBe(1024);

		const result2 = JSON.parse(execute({ value: 1, from: "megabyte", to: "kilobyte" }));
		expect(result2.result).toBe(1024);

		const result3 = JSON.parse(execute({ value: 1, from: "gigabyte", to: "megabyte" }));
		expect(result3.result).toBe(1024);
	});

	test("bytes plural form works", () => {
		const result = JSON.parse(execute({ value: 2048, from: "bytes", to: "kilobytes" }));
		expect(result.result).toBe(2);
	});
});
