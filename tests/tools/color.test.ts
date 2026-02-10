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
});
