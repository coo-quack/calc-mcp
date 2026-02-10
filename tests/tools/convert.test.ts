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

	test("unknown unit throws", () => {
		expect(() => execute({ value: 1, from: "xyz", to: "abc" })).toThrow();
	});
});
