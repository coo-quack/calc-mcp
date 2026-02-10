import { describe, expect, test } from "bun:test";
import { execute } from "../../src/tools/random.js";

describe("random", () => {
	test("generates a valid UUID v4", () => {
		const result = execute({ type: "uuid" });
		expect(result).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
		);
	});

	test("generates unique UUIDs", () => {
		const a = execute({ type: "uuid" });
		const b = execute({ type: "uuid" });
		expect(a).not.toBe(b);
	});

	test("generates a valid ULID (26 chars)", () => {
		const result = execute({ type: "ulid" });
		expect(result).toMatch(/^[0-9A-Z]{26}$/);
		expect(result).toHaveLength(26);
	});

	test("generates password with default length", () => {
		const result = execute({ type: "password" });
		expect(result).toHaveLength(16);
	});

	test("generates password with custom length", () => {
		const result = execute({ type: "password", length: 32 });
		expect(result).toHaveLength(32);
	});

	test("generates password with custom charset", () => {
		const result = execute({
			type: "password",
			length: 20,
			charset: "abc",
		});
		expect(result).toHaveLength(20);
		expect(result).toMatch(/^[abc]+$/);
	});

	test("generates random number in default range", () => {
		const result = Number(execute({ type: "number" }));
		expect(result).toBeGreaterThanOrEqual(0);
		expect(result).toBeLessThanOrEqual(100);
	});

	test("generates random number in custom range", () => {
		const result = Number(execute({ type: "number", min: 10, max: 20 }));
		expect(result).toBeGreaterThanOrEqual(10);
		expect(result).toBeLessThanOrEqual(20);
	});

	test("throws when min >= max", () => {
		expect(() => execute({ type: "number", min: 10, max: 5 })).toThrow(
			"min must be less than max",
		);
	});
});
