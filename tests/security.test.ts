import { describe, expect, test } from "bun:test";
import { sanitizeErrorMessage } from "../src/sanitization.js";
import { tool as base64Tool } from "../src/tools/base64.js";
import { tool as hashTool } from "../src/tools/hash.js";
import { tool as jwtDecodeTool } from "../src/tools/jwt_decode.js";

/**
 * Simulate the MCP server error handling in src/index.ts:
 * catch the tool's throw → apply sanitizeErrorMessage → return sanitized string.
 */
async function callTool(
	tool: {
		name: string;
		handler: (args: Record<string, unknown>) => Promise<unknown>;
	},
	args: Record<string, unknown>,
): Promise<string> {
	try {
		const result = await tool.handler(args);
		return String(result);
	} catch (error) {
		return sanitizeErrorMessage(tool.name, error, args);
	}
}

describe("Security: Error Message Sanitization (via MCP error path)", () => {
	test("sanitization is applied: value in error message is redacted", async () => {
		// Verify that callTool() correctly routes through sanitizeErrorMessage.
		// We simulate a case where the tool error message DOES contain the token
		// by calling sanitizeErrorMessage directly with a crafted error, mirroring
		// the exact logic in src/index.ts.
		const sensitiveToken = "my-secret-token-abc123";
		const error = new Error(`Token ${sensitiveToken} is malformed`);
		const result = sanitizeErrorMessage("jwt_decode", error, {
			token: sensitiveToken,
		});

		expect(result).not.toContain(sensitiveToken);
		expect(result).toContain("[REDACTED]");
	});

	test("jwt_decode errors do not expose token value", async () => {
		// jwt_decode already avoids including the raw token in error messages.
		// callTool() applies sanitization as a second line of defence.
		const sensitiveToken =
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature";

		const message = await callTool(jwtDecodeTool, { token: sensitiveToken });

		expect(message).not.toContain(sensitiveToken);
		expect(message).not.toContain("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
	});

	test("hash errors do not expose HMAC key", async () => {
		const sensitiveKey = "my-super-secret-key-12345";

		const message = await callTool(hashTool, {
			input: "test",
			algorithm: "sha256",
			action: "hmac",
			key: sensitiveKey,
		});

		// Successful call (valid args) should not expose the key either
		expect(message).not.toContain(sensitiveKey);
	});

	test("base64 errors do not expose input data", async () => {
		const sensitiveData = "secret-api-key-xyz789";

		// Trigger a zod validation error (intentionally invalid action)
		const message = await callTool(base64Tool, {
			input: sensitiveData,
			// @ts-expect-error: intentionally invalid action to test Zod validation
			action: "invalid",
		});

		expect(message.length).toBeGreaterThan(0);
		expect(message).not.toContain(sensitiveData);
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
		await expect(
			hashTool.handler({
				input: "test",
				algorithm: "sha256",
				action: "hmac",
				// Missing key
			}),
		).rejects.toThrow("key is required");
	});
});
