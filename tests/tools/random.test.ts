import { describe, expect, test } from "bun:test";
import { execute } from "../../src/tools/random.js";

describe("random", () => {
	// UUID tests
	test("generates a valid UUID v4", () => {
		const result = execute({ type: "uuid" });
		expect(result).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
		);
	});

	test("generates a valid UUID v7", () => {
		const result = execute({ type: "uuid", uuidVersion: "v7" });
		expect(result).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
		);
	});

	test("UUID v7 embeds timestamp", () => {
		const before = Date.now();
		const result = execute({ type: "uuid", uuidVersion: "v7" });
		const after = Date.now();
		const hex = result.replace(/-/g, "").slice(0, 12);
		const ts = Number.parseInt(hex, 16);
		expect(ts).toBeGreaterThanOrEqual(before);
		expect(ts).toBeLessThanOrEqual(after);
	});

	test("defaults to v4 when uuidVersion not specified", () => {
		const result = execute({ type: "uuid" });
		expect(result).toMatch(/-4[0-9a-f]{3}-/);
	});

	test("generates unique UUIDs", () => {
		const a = execute({ type: "uuid" });
		const b = execute({ type: "uuid" });
		expect(a).not.toBe(b);
	});

	// ULID tests
	test("generates a valid ULID (26 chars)", () => {
		const result = execute({ type: "ulid" });
		expect(result).toMatch(/^[0-9A-Z]{26}$/);
		expect(result).toHaveLength(26);
	});

	// Password tests — basic
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

	// Password tests — fine-grained options
	test("password without uppercase", () => {
		const result = execute({
			type: "password",
			length: 100,
			uppercase: false,
		});
		expect(result).not.toMatch(/[A-Z]/);
	});

	test("password without numbers", () => {
		const result = execute({
			type: "password",
			length: 100,
			numbers: false,
		});
		expect(result).not.toMatch(/[0-9]/);
	});

	test("password without symbols", () => {
		const result = execute({
			type: "password",
			length: 100,
			symbols: false,
		});
		expect(result).toMatch(/^[a-zA-Z0-9]+$/);
	});

	test("password letters only (no uppercase, numbers, symbols)", () => {
		const result = execute({
			type: "password",
			length: 100,
			uppercase: false,
			numbers: false,
			symbols: false,
		});
		expect(result).toMatch(/^[a-z]+$/);
	});

	test("password with excludeChars", () => {
		const result = execute({
			type: "password",
			length: 100,
			excludeChars: "abc123",
		});
		expect(result).not.toMatch(/[abc123]/);
	});

	test("password readable mode excludes ambiguous characters", () => {
		const result = execute({
			type: "password",
			length: 200,
			readable: true,
		});
		expect(result).not.toMatch(/[lI1O0o]/);
	});

	test("password readable + no symbols = clean readable password", () => {
		const result = execute({
			type: "password",
			length: 100,
			readable: true,
			symbols: false,
		});
		expect(result).not.toMatch(/[lI1O0o]/);
		expect(result).toMatch(/^[a-zA-Z0-9]+$/);
	});

	test("password with custom charset + excludeChars", () => {
		const result = execute({
			type: "password",
			length: 50,
			charset: "abcdef",
			excludeChars: "abc",
		});
		expect(result).toMatch(/^[def]+$/);
	});

	test("password throws when charset empty after exclusions", () => {
		expect(() =>
			execute({
				type: "password",
				charset: "abc",
				excludeChars: "abc",
			}),
		).toThrow("Charset is empty after exclusions");
	});

	// Number tests
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

	// Shuffle tests
	test("shuffle returns all items", () => {
		const items = ["a", "b", "c", "d", "e"];
		const result = JSON.parse(execute({ type: "shuffle", items }));
		expect(result).toHaveLength(5);
		expect(result.sort()).toEqual(["a", "b", "c", "d", "e"]);
	});

	test("shuffle with single item returns same item", () => {
		const result = JSON.parse(execute({ type: "shuffle", items: ["only"] }));
		expect(result).toEqual(["only"]);
	});

	test("shuffle throws on empty array", () => {
		expect(() => execute({ type: "shuffle", items: [] })).toThrow(
			"Items array is required for shuffle",
		);
	});

	test("shuffle throws when items missing", () => {
		expect(() => execute({ type: "shuffle" })).toThrow(
			"Items array is required for shuffle",
		);
	});

	test("shuffle preserves all elements (no duplicates/losses)", () => {
		const items = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
		for (let i = 0; i < 10; i++) {
			const result = JSON.parse(execute({ type: "shuffle", items }));
			expect(
				result.sort((a: string, b: string) => Number(a) - Number(b)),
			).toEqual(items);
		}
	});

	test("shuffle actually randomizes (not always same order)", () => {
		const items = ["a", "b", "c", "d", "e", "f", "g", "h"];
		const results = new Set<string>();
		for (let i = 0; i < 20; i++) {
			results.add(execute({ type: "shuffle", items }));
		}
		// With 8 items, getting the same order 20 times is astronomically unlikely
		expect(results.size).toBeGreaterThan(1);
	});
});
