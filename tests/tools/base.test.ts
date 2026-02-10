import { describe, expect, test } from "bun:test";
import { execute } from "../../src/tools/base.js";

describe("base", () => {
	test("decimal to binary", () => {
		const result = JSON.parse(execute({ value: "255", from: 10, to: 2 }));
		expect(result.result).toBe("11111111");
	});

	test("binary to decimal", () => {
		const result = JSON.parse(execute({ value: "11111111", from: 2, to: 10 }));
		expect(result.result).toBe("255");
	});

	test("decimal to hex", () => {
		const result = JSON.parse(execute({ value: "255", from: 10, to: 16 }));
		expect(result.result).toBe("ff");
	});

	test("hex to decimal", () => {
		const result = JSON.parse(execute({ value: "ff", from: 16, to: 10 }));
		expect(result.result).toBe("255");
	});

	test("octal to hex", () => {
		const result = JSON.parse(execute({ value: "377", from: 8, to: 16 }));
		expect(result.result).toBe("ff");
	});

	test("large number via BigInt", () => {
		const result = JSON.parse(
			execute({ value: "999999999999999999", from: 10, to: 16 }),
		);
		expect(result.result).toBe("de0b6b3a763ffff");
	});

	test("number input type works", () => {
		const result = JSON.parse(execute({ value: 42, from: 10, to: 2 }));
		expect(result.result).toBe("101010");
	});
});
