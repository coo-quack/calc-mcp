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
});
