import { z } from "zod";
import type { ToolDefinition } from "../index.js";

const schema = {
	url: z.string().describe("URL to parse"),
};

const inputSchema = z.object(schema);
type Input = z.infer<typeof inputSchema>;

export function execute(input: Input): string {
	let parsed: URL;
	try {
		parsed = new URL(input.url);
	} catch {
		throw new Error(`Invalid URL: ${input.url}`);
	}

	const searchParams: Record<string, string> = {};
	for (const [key, value] of parsed.searchParams) {
		searchParams[key] = value;
	}

	return JSON.stringify(
		{
			href: parsed.href,
			protocol: parsed.protocol,
			host: parsed.host,
			hostname: parsed.hostname,
			port: parsed.port || null,
			pathname: parsed.pathname,
			search: parsed.search || null,
			searchParams: Object.keys(searchParams).length > 0 ? searchParams : null,
			hash: parsed.hash || null,
			origin: parsed.origin,
			username: parsed.username || null,
			password: parsed.password || null,
		},
		null,
		2,
	);
}

export const tool: ToolDefinition = {
	name: "url_parse",
	description:
		"Parse a URL into its components (protocol, host, path, params, etc.)",
	schema,
	handler: async (args: Record<string, unknown>) => {
		const input = inputSchema.parse(args);
		return execute(input);
	},
};
