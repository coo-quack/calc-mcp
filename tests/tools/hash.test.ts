import { describe, expect, test } from "bun:test";
import { execute } from "../../src/tools/hash.js";

describe("hash", () => {
	test("md5 of empty string", () => {
		expect(execute({ input: "", algorithm: "md5" })).toBe(
			"d41d8cd98f00b204e9800998ecf8427e",
		);
	});

	test("md5 of hello", () => {
		expect(execute({ input: "hello", algorithm: "md5" })).toBe(
			"5d41402abc4b2a76b9719d911017c592",
		);
	});

	test("sha1 of hello", () => {
		expect(execute({ input: "hello", algorithm: "sha1" })).toBe(
			"aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d",
		);
	});

	test("sha256 of hello", () => {
		expect(execute({ input: "hello", algorithm: "sha256" })).toBe(
			"2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
		);
	});

	test("sha512 of hello", () => {
		const result = execute({ input: "hello", algorithm: "sha512" });
		expect(result).toHaveLength(128);
		expect(result).toBe(
			"9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043",
		);
	});

	test("crc32 of hello", () => {
		expect(execute({ input: "hello", algorithm: "crc32" })).toBe("3610a686");
	});

	test("crc32 of empty string", () => {
		expect(execute({ input: "", algorithm: "crc32" })).toBe("00000000");
	});
});
