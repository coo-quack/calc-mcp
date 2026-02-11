import { createRequire } from "node:module";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { z } from "zod";

import { tool as baseTool } from "./tools/base.js";

const require = createRequire(import.meta.url);
const { version } = require("../package.json") as { version: string };

import { tool as base64Tool } from "./tools/base64.js";
import { tool as charInfoTool } from "./tools/char_info.js";
import { tool as colorTool } from "./tools/color.js";
import { tool as convertTool } from "./tools/convert.js";
import { tool as countTool } from "./tools/count.js";
import { tool as cronParseTool } from "./tools/cron_parse.js";
import { tool as dateTool } from "./tools/date.js";
import { tool as datetimeTool } from "./tools/datetime.js";
import { tool as diffTool } from "./tools/diff.js";
import { tool as encodeTool } from "./tools/encode.js";
import { tool as hashTool } from "./tools/hash.js";
import { tool as ipTool } from "./tools/ip.js";
import { tool as jsonValidateTool } from "./tools/json_validate.js";
import { tool as jwtDecodeTool } from "./tools/jwt_decode.js";
import { tool as luhnTool } from "./tools/luhn.js";
import { tool as mathTool } from "./tools/math.js";
import { tool as randomTool } from "./tools/random.js";
import { tool as regexTool } from "./tools/regex.js";
import { tool as semverTool } from "./tools/semver.js";
import { tool as urlParseTool } from "./tools/url_parse.js";

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
	countTool,
	mathTool,
	dateTool,
	regexTool,
	baseTool,
	diffTool,
	jsonValidateTool,
	cronParseTool,
	luhnTool,
	ipTool,
	colorTool,
	convertTool,
	charInfoTool,
	jwtDecodeTool,
	urlParseTool,
	semverTool,
];

const server = new McpServer({
	name: "calc-mcp",
	version,
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
	if (process.argv.includes("--version") || process.argv.includes("-v")) {
		console.log(version);
		process.exit(0);
	}
	const transport = new StdioServerTransport();
	await server.connect(transport);
}

main().catch((error) => {
	console.error("Fatal error:", error);
	process.exit(1);
});
