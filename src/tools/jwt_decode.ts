import { z } from "zod";
import type { ToolDefinition } from "../index.js";

const schema = {
	token: z.string().describe("JWT token to decode"),
};

const inputSchema = z.object(schema);
type Input = z.infer<typeof inputSchema>;

function base64UrlDecode(str: string): string {
	// Replace URL-safe chars
	let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
	// Add padding
	while (base64.length % 4) {
		base64 += "=";
	}
	return atob(base64);
}

export function execute(input: Input): string {
	const parts = input.token.split(".");
	if (parts.length !== 3) {
		throw new Error(`Invalid JWT: expected 3 parts, got ${parts.length}`);
	}

	let header: unknown;
	let payload: unknown;

	const headerPart = parts[0];
	const payloadPart = parts[1];
	if (!headerPart || !payloadPart) {
		throw new Error("Invalid JWT structure");
	}

	try {
		header = JSON.parse(base64UrlDecode(headerPart));
	} catch {
		throw new Error("Failed to decode JWT header");
	}

	try {
		payload = JSON.parse(base64UrlDecode(payloadPart));
	} catch {
		throw new Error("Failed to decode JWT payload");
	}

	const result: Record<string, unknown> = { header, payload };

	// Add human-readable dates for common timestamp fields
	if (typeof payload === "object" && payload !== null) {
		const p = payload as Record<string, unknown>;
		const dates: Record<string, string> = {};
		for (const key of ["iat", "exp", "nbf"]) {
			if (typeof p[key] === "number") {
				dates[key] = new Date((p[key] as number) * 1000).toISOString();
			}
		}
		if (Object.keys(dates).length > 0) {
			result.dates = dates;
		}
	}

	return JSON.stringify(result, null, 2);
}

export const tool: ToolDefinition = {
	name: "jwt_decode",
	description:
		"Decode JWT token header and payload (no signature verification)",
	schema,
	handler: async (args: Record<string, unknown>) => {
		const input = inputSchema.parse(args);
		return execute(input);
	},
};
