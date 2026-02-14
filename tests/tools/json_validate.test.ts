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
		const expectedMessage =
			"Source contains multiple YAML documents; only single-document input is supported";
		const result = JSON.parse(
			execute({ input: "---\nfoo: bar\n---\nbaz: qux", format: "yaml" }),
		);
		expect(result.valid).toBe(false);
		expect(result.error).toBe(expectedMessage);
		expect(result.errors).toBeDefined();
		expect(Array.isArray(result.errors)).toBe(true);
		expect(result.errors).toEqual([expectedMessage]);
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

	test("validates empty YAML (parses to null per YAML spec)", () => {
		const result = JSON.parse(execute({ input: "", format: "yaml" }));
		expect(result.valid).toBe(true);
		expect(result.type).toBe("null");
	});

	test("validates whitespace-only YAML (parses to null per YAML spec)", () => {
		const result = JSON.parse(execute({ input: "   \n\t  ", format: "yaml" }));
		expect(result.valid).toBe(true);
		expect(result.type).toBe("null");
	});

	test("validates YAML null value", () => {
		const result = JSON.parse(execute({ input: "key: null", format: "yaml" }));
		expect(result.valid).toBe(true);
		expect(result.type).toBe("object");
		expect(result.keys).toEqual(["key"]);
	});

	test("validates YAML standalone null", () => {
		const result = JSON.parse(execute({ input: "null", format: "yaml" }));
		expect(result.valid).toBe(true);
		expect(result.type).toBe("null");
	});

	test("validates YAML standalone boolean", () => {
		const resultTrue = JSON.parse(execute({ input: "true", format: "yaml" }));
		expect(resultTrue.valid).toBe(true);
		expect(resultTrue.type).toBe("boolean");

		const resultFalse = JSON.parse(execute({ input: "false", format: "yaml" }));
		expect(resultFalse.valid).toBe(true);
		expect(resultFalse.type).toBe("boolean");
	});

	test("validates YAML standalone number", () => {
		const result = JSON.parse(execute({ input: "42", format: "yaml" }));
		expect(result.valid).toBe(true);
		expect(result.type).toBe("number");
	});

	test("validates YAML standalone string", () => {
		const result = JSON.parse(execute({ input: "hello", format: "yaml" }));
		expect(result.valid).toBe(true);
		expect(result.type).toBe("string");
	});

	test("validates XML with single child element", () => {
		const result = JSON.parse(
			execute({ input: "<root><child>value</child></root>", format: "xml" }),
		);
		expect(result.valid).toBe(true);
	});

	test("validates CSV with quoted commas", () => {
		const result = JSON.parse(
			execute({
				input:
					'name,description\nAlice,"hello, world"\nBob,"test, with, commas"',
				format: "csv",
			}),
		);
		expect(result.valid).toBe(true);
		expect(result.rows).toBe(3);
		expect(result.columns).toBe(2);
		expect(result.headers).toEqual(["name", "description"]);
	});

	test("validates CSV with escaped quotes", () => {
		const result = JSON.parse(
			execute({
				input: 'name,value\nAlice,"say ""hello"""\nBob,"test""value"',
				format: "csv",
			}),
		);
		expect(result.valid).toBe(true);
		expect(result.rows).toBe(3);
	});

	test("validates large JSON array", () => {
		const largeArrayItems = Array.from({ length: 1000 }, (_, i) => ({
			id: i,
			value: `item-${i}`,
		}));
		const largeArray = JSON.stringify(largeArrayItems);
		const result = JSON.parse(execute({ input: largeArray, format: "json" }));
		expect(result.valid).toBe(true);
		expect(result.type).toBe("array");
		expect(result.length).toBe(1000);
	});

	test("validates JSON with nested objects", () => {
		const result = JSON.parse(
			execute({
				input:
					'{"user": {"name": "Alice", "address": {"city": "Tokyo", "country": "Japan"}}}',
				format: "json",
			}),
		);
		expect(result.valid).toBe(true);
		expect(result.type).toBe("object");
		expect(result.keys).toEqual(["user"]);
	});
});
