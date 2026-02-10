import { describe, expect, test } from "bun:test";
import { execute } from "../../src/tools/jwt_decode.js";

// Test JWT: {"alg":"HS256","typ":"JWT"}.{"sub":"1234567890","name":"John Doe","iat":1516239022}
const TEST_TOKEN =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

describe("jwt_decode", () => {
	test("decodes header", () => {
		const result = JSON.parse(execute({ token: TEST_TOKEN }));
		expect(result.header.alg).toBe("HS256");
		expect(result.header.typ).toBe("JWT");
	});

	test("decodes payload", () => {
		const result = JSON.parse(execute({ token: TEST_TOKEN }));
		expect(result.payload.sub).toBe("1234567890");
		expect(result.payload.name).toBe("John Doe");
	});

	test("converts timestamps to dates", () => {
		const result = JSON.parse(execute({ token: TEST_TOKEN }));
		expect(result.dates.iat).toBeDefined();
		expect(result.dates.iat).toContain("2018");
	});

	test("rejects invalid JWT", () => {
		expect(() => execute({ token: "not.a.valid.jwt" })).toThrow();
	});

	test("rejects non-JWT string", () => {
		expect(() => execute({ token: "hello" })).toThrow();
	});

	test("handles JWT without timestamps", () => {
		// {"alg":"none"}.{"data":"test"}
		const token = "eyJhbGciOiJub25lIn0.eyJkYXRhIjoidGVzdCJ9.";
		const result = JSON.parse(execute({ token }));
		expect(result.payload.data).toBe("test");
		expect(result.dates).toBeUndefined();
	});
});
