import { describe, expect, test } from "bun:test";
import { execute } from "../../src/tools/hash.js";

function parseHash(result: string): { hash: string; warning?: string } {
	return JSON.parse(result);
}

describe("hash", () => {
	test("md5 of empty string", () => {
		const result = parseHash(execute({ input: "", algorithm: "md5" }));
		expect(result.hash).toBe("d41d8cd98f00b204e9800998ecf8427e");
	});

	test("md5 of hello", () => {
		const result = parseHash(execute({ input: "hello", algorithm: "md5" }));
		expect(result.hash).toBe("5d41402abc4b2a76b9719d911017c592");
	});

	test("sha1 of hello", () => {
		const result = parseHash(execute({ input: "hello", algorithm: "sha1" }));
		expect(result.hash).toBe("aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d");
	});

	test("sha256 of hello", () => {
		const result = parseHash(execute({ input: "hello", algorithm: "sha256" }));
		expect(result.hash).toBe(
			"2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
		);
	});

	test("sha512 of hello", () => {
		const result = parseHash(execute({ input: "hello", algorithm: "sha512" }));
		expect(result.hash).toHaveLength(128);
		expect(result.hash).toBe(
			"9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043",
		);
	});

	test("crc32 of hello", () => {
		const result = parseHash(execute({ input: "hello", algorithm: "crc32" }));
		expect(result.hash).toBe("3610a686");
	});

	test("crc32 of empty string", () => {
		const result = parseHash(execute({ input: "", algorithm: "crc32" }));
		expect(result.hash).toBe("00000000");
	});

	test("hmac-sha256 with key", () => {
		const result = parseHash(
			execute({
				input: "message",
				algorithm: "sha256",
				action: "hmac",
				key: "secret",
			}),
		);
		expect(result.hash).toBe(
			"8b5f48702995c1598c573db1e21866a9b825d4a794d169d7060a03605796360b",
		);
	});

	test("hmac-sha512 with key", () => {
		const result = parseHash(
			execute({
				input: "test",
				algorithm: "sha512",
				action: "hmac",
				key: "key123",
			}),
		);
		expect(result.hash).toHaveLength(128);
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

	test("includes warning for MD5", () => {
		const result = parseHash(execute({ input: "test", algorithm: "md5" }));
		expect(result.warning).toBeDefined();
		expect(result.warning).toContain("MD5 is cryptographically weak");
	});

	test("includes warning for SHA1", () => {
		const result = parseHash(execute({ input: "test", algorithm: "sha1" }));
		expect(result.warning).toBeDefined();
		expect(result.warning).toContain("SHA1 is cryptographically weak");
	});

	test("no warning for SHA256", () => {
		const result = parseHash(execute({ input: "test", algorithm: "sha256" }));
		expect(result.warning).toBeUndefined();
	});

	test("no warning for SHA512", () => {
		const result = parseHash(execute({ input: "test", algorithm: "sha512" }));
		expect(result.warning).toBeUndefined();
	});

	test("no warning for CRC32", () => {
		const result = parseHash(execute({ input: "test", algorithm: "crc32" }));
		expect(result.warning).toBeUndefined();
	});
});
