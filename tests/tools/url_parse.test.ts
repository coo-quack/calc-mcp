import { describe, expect, test } from "bun:test";
import { execute } from "../../src/tools/url_parse.js";

describe("url_parse", () => {
	test("parses simple URL", () => {
		const result = JSON.parse(execute({ url: "https://example.com/path" }));
		expect(result.protocol).toBe("https:");
		expect(result.hostname).toBe("example.com");
		expect(result.pathname).toBe("/path");
	});

	test("parses URL with query params", () => {
		const result = JSON.parse(
			execute({ url: "https://example.com/search?q=hello&lang=en" }),
		);
		expect(result.searchParams.q).toBe("hello");
		expect(result.searchParams.lang).toBe("en");
	});

	test("parses URL with hash", () => {
		const result = JSON.parse(
			execute({ url: "https://example.com/page#section" }),
		);
		expect(result.hash).toBe("#section");
	});

	test("parses URL with port", () => {
		const result = JSON.parse(execute({ url: "http://localhost:3000/api" }));
		expect(result.port).toBe("3000");
		expect(result.hostname).toBe("localhost");
	});

	test("parses URL with auth", () => {
		const result = JSON.parse(
			execute({ url: "https://user:pass@example.com" }),
		);
		expect(result.username).toBe("user");
		expect(result.password).toBe("pass");
	});

	test("rejects invalid URL", () => {
		expect(() => execute({ url: "not a url" })).toThrow();
	});
});
