import { z } from "zod";
import type { ToolDefinition } from "../index.js";

const MAX_INPUT_LENGTH = 1_000_000;

const schema = {
  input: z
    .string()
    .max(MAX_INPUT_LENGTH, `Input too long (max: ${MAX_INPUT_LENGTH} chars)`)
    .describe("String to encode or decode"),
  action: z.enum(["encode", "decode"]).describe("Whether to encode or decode"),
};

const inputSchema = z.object(schema);
type Input = z.infer<typeof inputSchema>;

export function execute(input: Input): string {
  switch (input.action) {
    case "encode":
      return Buffer.from(input.input, "utf-8").toString("base64");
    case "decode":
      return Buffer.from(input.input, "base64").toString("utf-8");
  }
}

export const tool: ToolDefinition = {
  name: "base64",
  description: "Encode or decode Base64 strings",
  schema,
  handler: async (args: Record<string, unknown>) => {
    const input = inputSchema.parse(args);
    return execute(input);
  },
};
