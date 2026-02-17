import { describe, expect, test } from "bun:test";
import { SENSITIVE_TOOLS, sanitizeErrorMessage } from "../src/index.js";

describe("sanitizeErrorMessage", () => {
	test("should redact token parameter for sensitive tools", () => {
		const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.secret.data";
		const error = new Error(`Invalid JWT token: ${token}`);
		const args = { token };

		const result = sanitizeErrorMessage("jwt_decode", error, args);

		expect(result).not.toContain(token);
		expect(result).toContain("[REDACTED]");
		expect(result).toBe("Invalid JWT token: [REDACTED]");
	});

	test("should redact key parameter for hash tool", () => {
		const key = "my-super-secret-key-12345";
		const error = new Error(`HMAC key validation failed: ${key}`);
		const args = { key, input: "test" };

		const result = sanitizeErrorMessage("hash", error, args);

		expect(result).not.toContain(key);
		expect(result).toContain("[REDACTED]");
	});

	test("should redact input parameter for base64 tool", () => {
		const input = "secret-api-key-xyz789";
		const error = new Error(`Decoding failed for: ${input}`);
		const args = { input, action: "decode" };

		const result = sanitizeErrorMessage("base64", error, args);

		expect(result).not.toContain(input);
		expect(result).toContain("[REDACTED]");
	});

	test("should handle multiple occurrences of the same value", () => {
		const secret = "SECRET123";
		const error = new Error(`Error: ${secret} is invalid. ${secret} was rejected.`);
		const args = { token: secret };

		const result = sanitizeErrorMessage("jwt_decode", error, args);

		expect(result).not.toContain(secret);
		expect(result).toBe(
			"Error: [REDACTED] is invalid. [REDACTED] was rejected.",
		);
	});

	test("should redact multiple sensitive parameters", () => {
		const token = "token123";
		const key = "key456";
		const input = "input789";
		const error = new Error(
			`Multiple secrets: token=${token}, key=${key}, input=${input}`,
		);
		const args = { token, key, input };

		const result = sanitizeErrorMessage("hash", error, args);

		expect(result).not.toContain(token);
		expect(result).not.toContain(key);
		expect(result).not.toContain(input);
		expect(result).toContain("[REDACTED]");
	});

	test("should not redact for non-sensitive tools", () => {
		const input = "some-data";
		const error = new Error(`Math error with ${input}`);
		const args = { input };

		const result = sanitizeErrorMessage("math", error, args);

		expect(result).toContain(input);
		expect(result).not.toContain("[REDACTED]");
		expect(result).toBe(`Math error with ${input}`);
	});

	test("should handle non-Error objects", () => {
		const token = "secret-token";
		const error = `Token ${token} is invalid`;
		const args = { token };

		const result = sanitizeErrorMessage("jwt_decode", error, args);

		expect(result).not.toContain(token);
		expect(result).toContain("[REDACTED]");
	});

	test("should handle empty sensitive values", () => {
		const error = new Error("Empty token error");
		const args = { token: "" };

		const result = sanitizeErrorMessage("jwt_decode", error, args);

		expect(result).toBe("Empty token error");
		expect(result).not.toContain("[REDACTED]");
	});

	test("should handle missing sensitive parameters", () => {
		const error = new Error("Missing token");
		const args = { other: "value" };

		const result = sanitizeErrorMessage("jwt_decode", error, args);

		expect(result).toBe("Missing token");
		expect(result).not.toContain("[REDACTED]");
	});

	test("should handle non-string parameter values", () => {
		const error = new Error("Invalid token");
		const args = { token: 12345 }; // number instead of string

		const result = sanitizeErrorMessage("jwt_decode", error, args);

		expect(result).toBe("Invalid token");
		expect(result).not.toContain("[REDACTED]");
	});

	test("SENSITIVE_TOOLS should contain expected tool names", () => {
		expect(SENSITIVE_TOOLS.has("jwt_decode")).toBe(true);
		expect(SENSITIVE_TOOLS.has("hash")).toBe(true);
		expect(SENSITIVE_TOOLS.has("base64")).toBe(true);
		expect(SENSITIVE_TOOLS.has("encode")).toBe(true);
		expect(SENSITIVE_TOOLS.has("math")).toBe(false);
	});
});
