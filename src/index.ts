import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { z } from "zod";

import { tool as base64Tool } from "./tools/base64.js";
import { tool as datetimeTool } from "./tools/datetime.js";
import { tool as encodeTool } from "./tools/encode.js";
import { tool as hashTool } from "./tools/hash.js";
import { tool as randomTool } from "./tools/random.js";

export interface ToolDefinition {
	name: string;
	description: string;
	schema: z.ZodRawShape;
	handler: (args: Record<string, unknown>) => Promise<string>;
}

const tools: ToolDefinition[] = [
	randomTool,
	hashTool,
	base64Tool,
	encodeTool,
	datetimeTool,
];

const server = new McpServer({
	name: "calc",
	version: "0.1.0",
});

for (const tool of tools) {
	server.tool(
		tool.name,
		tool.description,
		tool.schema,
		async (args: Record<string, unknown>) => {
			try {
				const result = await tool.handler(args);
				return {
					content: [{ type: "text" as const, text: result }],
				};
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				return {
					content: [{ type: "text" as const, text: `Error: ${message}` }],
					isError: true,
				};
			}
		},
	);
}

async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
}

main().catch((error) => {
	console.error("Fatal error:", error);
	process.exit(1);
});
