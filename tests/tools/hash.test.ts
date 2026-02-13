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

	test("hmac-sha256 with key", () => {
		const result = execute({
			input: "message",
			algorithm: "sha256",
			action: "hmac",
			key: "secret",
		});
		expect(result).toBe(
			"8b5f48702995c1598c573db1e21866a9b825d4a794d169d7060a03605796360b",
		);
	});

	test("hmac-sha512 with key", () => {
		const result = execute({
			input: "test",
			algorithm: "sha512",
			action: "hmac",
			key: "key123",
		});
		expect(result).toHaveLength(128);
	});

	test("hmac requires key", () => {
		expect(() =>
			execute({
				input: "test",
				algorithm: "sha256",
				action: "hmac",
			}),
		).toThrow(/key is required/);
	});

	test("crc32 does not support hmac", () => {
		expect(() =>
			execute({
				input: "test",
				algorithm: "crc32",
				action: "hmac",
				key: "secret",
			}),
		).toThrow(/CRC32 does not support HMAC/);
	});

	test("warns when using MD5", () => {
		const originalWarn = console.warn;
		const warnings: string[] = [];
		console.warn = (msg: string) => warnings.push(msg);

		execute({ input: "test", algorithm: "md5" });
		expect(warnings.length).toBeGreaterThan(0);
		expect(warnings[0]).toContain("MD5 is cryptographically weak");

		console.warn = originalWarn;
	});

	test("warns when using SHA1", () => {
		const originalWarn = console.warn;
		const warnings: string[] = [];
		console.warn = (msg: string) => warnings.push(msg);

		execute({ input: "test", algorithm: "sha1" });
		expect(warnings.length).toBeGreaterThan(0);
		expect(warnings[0]).toContain("SHA1 is cryptographically weak");

		console.warn = originalWarn;
	});

	test("does not warn when using SHA256", () => {
		const originalWarn = console.warn;
		const warnings: string[] = [];
		console.warn = (msg: string) => warnings.push(msg);

		execute({ input: "test", algorithm: "sha256" });
		expect(warnings.length).toBe(0);

		console.warn = originalWarn;
	});
});
