import { describe, expect, test } from "bun:test";
import { tool as base64Tool } from "../src/tools/base64.js";
import { tool as hashTool } from "../src/tools/hash.js";
import { tool as jwtDecodeTool } from "../src/tools/jwt_decode.js";

describe("Security: Error Message Sanitization", () => {
	test("jwt_decode should not expose token in error messages", async () => {
		const sensitiveToken =
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature";

		try {
			await jwtDecodeTool.handler({ token: sensitiveToken });
			expect(true).toBe(false); // Should have thrown
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);

			// Error message should NOT contain the actual token
			expect(message).not.toContain(sensitiveToken);
			expect(message).not.toContain("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
		}
	});

	test("hash should not expose key in error messages (HMAC)", async () => {
		const sensitiveKey = "my-super-secret-key-12345";

		try {
			// Invalid algorithm to trigger error
			await hashTool.handler({
				input: "test",
				algorithm: "invalid" as "sha256",
				action: "hmac",
				key: sensitiveKey,
			});
			expect(true).toBe(false); // Should have thrown
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);

			// Error message should NOT contain the secret key
			expect(message).not.toContain(sensitiveKey);
		}
	});

	test("base64 should handle errors gracefully", async () => {
		const sensitiveData = "secret-api-key-xyz789";

		try {
			// Invalid action to trigger error
			await base64Tool.handler({
				input: sensitiveData,
				action: "invalid" as "encode",
			});
			expect(true).toBe(false); // Should have thrown
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);

			// Check that error is descriptive but doesn't leak the input
			expect(message.length).toBeGreaterThan(0);
			expect(message).not.toContain(sensitiveData);
		}
	});
});

describe("Security: Tool Behavior", () => {
	test("jwt_decode should successfully decode valid token", async () => {
		// Public test JWT (not sensitive)
		const testJwt =
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

		const result = await jwtDecodeTool.handler({ token: testJwt });

		// Should successfully decode
		expect(result).toContain("header");
		expect(result).toContain("payload");
		expect(result).toContain("John Doe");
	});

	test("hash should produce consistent output", async () => {
		const result1 = await hashTool.handler({
			input: "test",
			algorithm: "sha256",
		});

		const result2 = await hashTool.handler({
			input: "test",
			algorithm: "sha256",
		});

		// Same input should produce same hash
		expect(result1).toBe(result2);

		// Verify it's a valid SHA-256 hex string (64 chars)
		expect(result1).toMatch(/^[a-f0-9]{64}$/);
	});

	test("hash HMAC should require key parameter", async () => {
		try {
			await hashTool.handler({
				input: "test",
				algorithm: "sha256",
				action: "hmac",
				// Missing key
			});
			expect(true).toBe(false); // Should have thrown
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			expect(message).toContain("key is required");
		}
	});
});
