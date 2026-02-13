import { describe, expect, test } from "bun:test";
import { execute } from "../../src/tools/color.js";

describe("color", () => {
	test("hex to rgb", () => {
		expect(execute({ color: "#ff0000", to: "rgb" })).toBe("rgb(255, 0, 0)");
	});

	test("hex to hsl", () => {
		expect(execute({ color: "#ff0000", to: "hsl" })).toBe("hsl(0, 100%, 50%)");
	});

	test("rgb to hex", () => {
		expect(execute({ color: "rgb(0, 255, 0)", to: "hex" })).toBe("#00ff00");
	});

	test("hsl to hex", () => {
		expect(execute({ color: "hsl(240, 100%, 50%)", to: "hex" })).toBe(
			"#0000ff",
		);
	});

	test("short hex works", () => {
		expect(execute({ color: "#fff", to: "rgb" })).toBe("rgb(255, 255, 255)");
	});

	test("returns all formats when no target", () => {
		const result = JSON.parse(execute({ color: "#000000" }));
		expect(result.hex).toBe("#000000");
		expect(result.rgb).toBe("rgb(0, 0, 0)");
		expect(result.hsl).toBe("hsl(0, 0%, 0%)");
	});

	test("invalid color throws", () => {
		expect(() => execute({ color: "not a color" })).toThrow();
	});

	test("parses named color red", () => {
		expect(execute({ color: "red", to: "hex" })).toBe("#ff0000");
	});

	test("parses named color blue", () => {
		expect(execute({ color: "blue", to: "rgb" })).toBe("rgb(0, 0, 255)");
	});

	test("parses named color green", () => {
		const result = JSON.parse(execute({ color: "green" }));
		expect(result.hex).toBe("#008000");
		expect(result.rgb).toBe("rgb(0, 128, 0)");
	});

	test("parses named color without case sensitivity", () => {
		expect(execute({ color: "RED", to: "hex" })).toBe("#ff0000");
		expect(execute({ color: "Blue", to: "hex" })).toBe("#0000ff");
	});

	test("parses 8-digit hex with alpha", () => {
		const result = execute({ color: "#ff000080", to: "rgb" });
		expect(result).toBe("rgba(255, 0, 0, 0.5019607843137255)");
	});

	test("converts 8-digit hex to hex (preserves alpha)", () => {
		const result = execute({ color: "#ff000080", to: "hex" });
		expect(result).toBe("#ff000080");
	});

	test("parses 4-digit hex shorthand with alpha", () => {
		const result = execute({ color: "#f008", to: "hex" });
		expect(result).toBe("#ff000088");
	});

	test("parses rgba", () => {
		const result = execute({ color: "rgba(255, 0, 0, 0.5)", to: "rgb" });
		expect(result).toBe("rgba(255, 0, 0, 0.5)");
	});

	test("parses hsla", () => {
		const result = execute({ color: "hsla(0, 100%, 50%, 0.8)", to: "hsl" });
		expect(result).toBe("hsla(0, 100%, 50%, 0.8)");
	});

	test("converts rgba to hex with alpha", () => {
		const result = execute({ color: "rgba(255, 0, 0, 0.5)", to: "hex" });
		expect(result).toBe("#ff000080");
	});

	test("converts hsla to hex with alpha", () => {
		const result = execute({ color: "hsla(120, 100%, 50%, 0.25)", to: "hex" });
		expect(result).toBe("#00ff0040");
	});

	test("returns all formats with alpha", () => {
		const result = JSON.parse(execute({ color: "#ff000080" }));
		expect(result.hex).toBe("#ff000080");
		expect(result.rgb).toContain("rgba");
		expect(result.hsl).toContain("hsla");
		expect(result.values.a).toBeCloseTo(0.5, 1);
	});

	test("rejects invalid hex length (5 digits)", () => {
		expect(() => execute({ color: "#12345" })).toThrow();
	});

	test("rejects invalid hex length (7 digits)", () => {
		expect(() => execute({ color: "#1234567" })).toThrow();
	});

	test("rejects rgba with alpha > 1", () => {
		expect(() => execute({ color: "rgba(255, 0, 0, 999)" })).toThrow(/Alpha value must be between 0 and 1/);
	});

	test("rejects rgba with negative alpha", () => {
		expect(() => execute({ color: "rgba(255, 0, 0, -0.5)" })).toThrow(/Alpha value must be between 0 and 1/);
	});

	test("rejects hsla with alpha > 1", () => {
		expect(() => execute({ color: "hsla(0, 100%, 50%, 999)" })).toThrow(/Alpha value must be between 0 and 1/);
	});

	test("rejects hsla with negative alpha", () => {
		expect(() => execute({ color: "hsla(0, 100%, 50%, -0.5)" })).toThrow(/Alpha value must be between 0 and 1/);
	});

	test("handles fully transparent alpha", () => {
		const hex = execute({ color: "rgba(255, 0, 0, 0)", to: "hex" });
		expect(hex).toBe("#ff000000");

		const result = JSON.parse(execute({ color: "#ff000000" }));
		expect(result.hex).toBe("#ff000000");
		expect(result.rgb).toContain("rgba");
		expect(result.values.a).toBeCloseTo(0, 3);
	});

	test("handles fully opaque alpha", () => {
		const hex = execute({ color: "rgba(255, 0, 0, 1)", to: "hex" });
		expect(hex).toBe("#ff0000ff");

		const result = JSON.parse(execute({ color: "#ff0000ff" }));
		expect(result.hex).toBe("#ff0000ff");
		expect(result.rgb).toContain("rgba");
		expect(result.values.a).toBeCloseTo(1, 3);
	});
});
