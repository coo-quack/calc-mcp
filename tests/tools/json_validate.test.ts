import { describe, expect, test } from "bun:test";
import { execute } from "../../src/tools/json_validate.js";

describe("json_validate", () => {
	test("validates valid JSON", () => {
		const result = JSON.parse(
			execute({ input: '{"key": "value"}', format: "json" }),
		);
		expect(result.valid).toBe(true);
		expect(result.type).toBe("object");
	});

	test("validates invalid JSON", () => {
		const result = JSON.parse(execute({ input: "{bad json", format: "json" }));
		expect(result.valid).toBe(false);
		expect(result.error).toBeDefined();
		expect(result.errors).toBeDefined();
		expect(Array.isArray(result.errors)).toBe(true);
		expect(result.errors.length).toBeGreaterThan(0);
	});

	test("validates JSON array", () => {
		const result = JSON.parse(execute({ input: "[1, 2, 3]", format: "json" }));
		expect(result.valid).toBe(true);
		expect(result.type).toBe("array");
		expect(result.length).toBe(3);
	});

	test("validates valid CSV", () => {
		const result = JSON.parse(
			execute({ input: "name,age\nAlice,30\nBob,25", format: "csv" }),
		);
		expect(result.valid).toBe(true);
		expect(result.rows).toBe(3);
		expect(result.columns).toBe(2);
	});

	test("validates CSV with inconsistent columns", () => {
		const result = JSON.parse(execute({ input: "a,b\n1,2,3", format: "csv" }));
		expect(result.valid).toBe(false);
		expect(result.error).toBeDefined();
		expect(result.errors).toBeDefined();
		expect(Array.isArray(result.errors)).toBe(true);
	});

	test("validates empty XML", () => {
		const result = JSON.parse(execute({ input: "", format: "xml" }));
		expect(result.valid).toBe(false);
		expect(result.error).toBe("Empty input");
		expect(result.errors).toEqual(["Empty input"]);
	});

	test("validates well-formed XML", () => {
		const result = JSON.parse(
			execute({ input: "<root><child>text</child></root>", format: "xml" }),
		);
		expect(result.valid).toBe(true);
	});

	test("validates malformed XML", () => {
		const result = JSON.parse(
			execute({ input: "<root><child></root>", format: "xml" }),
		);
		expect(result.valid).toBe(false);
		expect(result.error).toBeDefined();
		expect(result.errors).toBeDefined();
		expect(Array.isArray(result.errors)).toBe(true);
	});

	test("validates empty CSV", () => {
		const result = JSON.parse(execute({ input: "", format: "csv" }));
		expect(result.valid).toBe(false);
		expect(result.error).toBe("Empty input");
		expect(result.errors).toEqual(["Empty input"]);
	});

	test("validates basic YAML", () => {
		const result = JSON.parse(
			execute({ input: "key: value\nlist:\n  - item1", format: "yaml" }),
		);
		expect(result.valid).toBe(true);
	});

	test("validates YAML object with keys", () => {
		const result = JSON.parse(
			execute({ input: "foo: 1\nbar: 2", format: "yaml" }),
		);
		expect(result.valid).toBe(true);
		expect(result.type).toBe("object");
		expect(result.keys).toEqual(["foo", "bar"]);
	});

	test("validates YAML array with length", () => {
		const result = JSON.parse(
			execute({ input: "- a\n- b\n- c", format: "yaml" }),
		);
		expect(result.valid).toBe(true);
		expect(result.type).toBe("array");
		expect(result.length).toBe(3);
	});

	test("validates multi-document YAML", () => {
		const result = JSON.parse(
			execute({ input: "---\nfoo: bar\n---\nbaz: qux", format: "yaml" }),
		);
		expect(result.valid).toBe(false);
		expect(result.error).toBe(
			"Source contains multiple YAML documents; only single-document input is supported",
		);
	});

	test("validates invalid YAML syntax", () => {
		const result = JSON.parse(
			execute({ input: "key: value\n- invalid", format: "yaml" }),
		);
		expect(result.valid).toBe(false);
		expect(result.error).toBeDefined();
		expect(result.errors).toBeDefined();
		expect(Array.isArray(result.errors)).toBe(true);
		expect(result.errors.length).toBeGreaterThan(0);
	});

	test("validates empty YAML", () => {
		const result = JSON.parse(execute({ input: "", format: "yaml" }));
		expect(result.valid).toBe(false);
		expect(result.error).toBe("Empty input");
		expect(result.errors).toEqual(["Empty input"]);
	});
});
