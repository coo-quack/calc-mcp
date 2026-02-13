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
	});

	test("validates basic YAML", () => {
		const result = JSON.parse(
			execute({ input: "key: value\nlist:\n  - item1", format: "yaml" }),
		);
		expect(result.valid).toBe(true);
		expect(result.type).toBe("object");
	});

	test("validates YAML object with keys", () => {
		const result = JSON.parse(
			execute({
				input: "name: Alice\nage: 30\ncity: Tokyo",
				format: "yaml",
			}),
		);
		expect(result.valid).toBe(true);
		expect(result.type).toBe("object");
		expect(result.keys).toEqual(["name", "age", "city"]);
	});

	test("validates YAML array", () => {
		const result = JSON.parse(
			execute({ input: "- item1\n- item2\n- item3", format: "yaml" }),
		);
		expect(result.valid).toBe(true);
		expect(result.type).toBe("array");
		expect(result.length).toBe(3);
	});

	test("validates invalid YAML (bad structure)", () => {
		const result = JSON.parse(
			execute({
				input: "key: [unclosed array",
				format: "yaml",
			}),
		);
		expect(result.valid).toBe(false);
		expect(result.error).toBeDefined();
	});

	test("validates invalid YAML (tab indentation)", () => {
		const result = JSON.parse(
			execute({
				input: "key:\n\tvalue",
				format: "yaml",
			}),
		);
		expect(result.valid).toBe(false);
		expect(result.error).toBeDefined();
	});

	test("validates YAML with null value", () => {
		const result = JSON.parse(
			execute({ input: "key: null", format: "yaml" }),
		);
		expect(result.valid).toBe(true);
		expect(result.type).toBe("object");
		expect(result.keys).toEqual(["key"]);
	});

	test("validates YAML null document", () => {
		const result = JSON.parse(execute({ input: "null", format: "yaml" }));
		expect(result.valid).toBe(true);
		expect(result.type).toBe("null");
	});

	test("validates YAML boolean document", () => {
		const result = JSON.parse(execute({ input: "true", format: "yaml" }));
		expect(result.valid).toBe(true);
		expect(result.type).toBe("boolean");
	});

	test("validates YAML number document", () => {
		const result = JSON.parse(execute({ input: "42", format: "yaml" }));
		expect(result.valid).toBe(true);
		expect(result.type).toBe("number");
	});

	test("validates YAML string document", () => {
		const result = JSON.parse(execute({ input: "hello", format: "yaml" }));
		expect(result.valid).toBe(true);
		expect(result.type).toBe("string");
	});

	test("validates YAML tilde null document", () => {
		const result = JSON.parse(execute({ input: "~", format: "yaml" }));
		expect(result.valid).toBe(true);
		expect(result.type).toBe("null");
	});

	test("validates empty YAML", () => {
		const result = JSON.parse(execute({ input: "", format: "yaml" }));
		expect(result.valid).toBe(false);
		expect(result.error).toBe("Empty input");
	});

	test("validates complex YAML", () => {
		const yaml = `
name: Product
version: 1.0.0
dependencies:
  - name: lib1
    version: ^2.0.0
  - name: lib2
    version: ~1.5.0
`;
		const result = JSON.parse(execute({ input: yaml, format: "yaml" }));
		expect(result.valid).toBe(true);
		expect(result.type).toBe("object");
		expect(result.keys).toContain("dependencies");
	});
});
