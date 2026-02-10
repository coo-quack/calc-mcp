import { describe, expect, test } from "bun:test";
import { execute } from "../../src/tools/semver.js";

describe("semver", () => {
	test("validates valid semver", () => {
		const result = JSON.parse(execute({ action: "valid", version: "1.2.3" }));
		expect(result.valid).toBe(true);
		expect(result.parsed.major).toBe(1);
	});

	test("validates invalid semver", () => {
		const result = JSON.parse(
			execute({ action: "valid", version: "not.valid" }),
		);
		expect(result.valid).toBe(false);
	});

	test("compares versions - greater", () => {
		const result = JSON.parse(
			execute({ action: "compare", version: "2.0.0", version2: "1.0.0" }),
		);
		expect(result.result).toBe(1);
	});

	test("compares versions - less", () => {
		const result = JSON.parse(
			execute({ action: "compare", version: "1.0.0", version2: "1.0.1" }),
		);
		expect(result.result).toBe(-1);
	});

	test("compares versions - equal", () => {
		const result = JSON.parse(
			execute({ action: "compare", version: "1.0.0", version2: "1.0.0" }),
		);
		expect(result.result).toBe(0);
	});

	test("satisfies caret range", () => {
		const result = JSON.parse(
			execute({ action: "satisfies", version: "1.5.0", range: "^1.0.0" }),
		);
		expect(result.satisfies).toBe(true);
	});

	test("does not satisfy caret range (major change)", () => {
		const result = JSON.parse(
			execute({ action: "satisfies", version: "2.0.0", range: "^1.0.0" }),
		);
		expect(result.satisfies).toBe(false);
	});

	test("satisfies tilde range", () => {
		const result = JSON.parse(
			execute({ action: "satisfies", version: "1.2.9", range: "~1.2.0" }),
		);
		expect(result.satisfies).toBe(true);
	});

	test("validates prerelease version", () => {
		const result = JSON.parse(
			execute({ action: "valid", version: "1.0.0-alpha.1" }),
		);
		expect(result.valid).toBe(true);
		expect(result.parsed.prerelease).toEqual(["alpha", "1"]);
	});
});
