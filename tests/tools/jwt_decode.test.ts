import { describe, expect, test } from "bun:test";
import { execute } from "../../src/tools/jwt_decode.js";

// Test JWT: {"alg":"HS256","typ":"JWT"}.{"sub":"1234567890","name":"John Doe","iat":1516239022}
const TEST_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

// Test JWT with multiple timestamps:
// Header:  {"alg":"HS256","typ":"JWT"}
// Payload: {"sub":"1234567890","name":"John Doe","iat":1516239022,"exp":1516242622,"nbf":1516235422}
const TEST_TOKEN_WITH_TIMESTAMPS =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyNDI2MjIsIm5iZiI6MTUxNjIzNTQyMn0.RxR78hX7e8n1Wc2w3Tzjt0C2c-yYC6lYpJ8a2d4r6Wk";

// Unsigned JWT (alg "none" with empty signature): {"alg":"none"}.{"data":"unsigned"}
const UNSIGNED_TEST_TOKEN =
  "eyJhbGciOiJub25lIn0.eyJkYXRhIjoidW5zaWduZWQifQ.";

// JWT with non-standard / custom claims:
// Header:  {"alg":"HS256","typ":"JWT"}
// Payload: {"sub":"abc","role":"admin","custom_claim":"custom-value"}
const NON_STANDARD_CLAIMS_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhYmMiLCJyb2xlIjoiYWRtaW4iLCJjdXN0b21fY2xhaW0iOiJjdXN0b20tdmFsdWUifQ.8I6b3o3S4FJ1f8p5i3D8C4pA4PzV8BR3G6P5oL3nW0Y";

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

  test("converts exp and nbf timestamps to dates", () => {
    const result = JSON.parse(execute({ token: TEST_TOKEN_WITH_TIMESTAMPS }));
    expect(result.dates.iat).toBeDefined();
    expect(result.dates.exp).toBeDefined();
    expect(result.dates.nbf).toBeDefined();
    expect(result.dates.exp).toContain("2018");
    expect(result.dates.nbf).toContain("2018");
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

  test("output always includes a no-verification warning", () => {
    const token = "eyJhbGciOiJub25lIn0.eyJkYXRhIjoidGVzdCJ9.";
    const result = JSON.parse(execute({ token }));
    expect(result.warning).toBeDefined();
    expect(result.warning).toMatch(/NOT verified/);
  });

  test("handles unsigned JWT with empty signature", () => {
    const result = JSON.parse(execute({ token: UNSIGNED_TEST_TOKEN }));
    expect(result.header.alg).toBe("none");
    expect(result.payload.data).toBe("unsigned");
  });

  test("decodes JWT with non-standard claims", () => {
    const result = JSON.parse(execute({ token: NON_STANDARD_CLAIMS_TOKEN }));
    expect(result.payload.sub).toBe("abc");
    expect(result.payload.role).toBe("admin");
    expect(result.payload.custom_claim).toBe("custom-value");
  });
});
