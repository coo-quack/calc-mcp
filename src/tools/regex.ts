import { z } from "zod";
import type { ToolDefinition } from "../index.js";
import { assertExists } from "../utils.js";

const TIMEOUT_MS = 1000;
const MAX_PATTERN_LENGTH = 500;
const MAX_TEXT_LENGTH = 1_000_000;
const MAX_BOUNDED_REPEAT = 1000;
const MAX_MATCH_COUNT = 1000;

const schema = {
  pattern: z
    .string()
    .max(
      MAX_PATTERN_LENGTH,
      `Pattern too long (max: ${MAX_PATTERN_LENGTH} chars)`,
    )
    .describe("Regular expression pattern"),
  flags: z.string().optional().describe("Regex flags (g, i, m, etc.)"),
  text: z
    .string()
    .max(MAX_TEXT_LENGTH, `Text too long (max: ${MAX_TEXT_LENGTH} chars)`)
    .describe("Text to search"),
  action: z
    .enum(["match", "test", "replace", "matchAll"])
    .describe("Action to perform"),
  replacement: z.string().optional().describe("Replacement string for replace"),
};

const inputSchema = z.object(schema);
type Input = z.infer<typeof inputSchema>;

// Single-pass parser that flags patterns with nested quantifiers
// (the classic exponential-backtracking source) while honoring escapes and
// character classes. Also rejects pathologically large bounded repeats.
function validatePattern(pattern: string): void {
  if (pattern.length > MAX_PATTERN_LENGTH) {
    throw new Error(
      `Pattern too long (${pattern.length} chars, max: ${MAX_PATTERN_LENGTH})`,
    );
  }

  // Stack entry tracks whether the current group already contains a quantifier.
  const groupHasQuantifier: boolean[] = [];

  // After we close a group, remember whether it had a quantifier so that a
  // following quantifier can be detected as a nested ReDoS pattern.
  let justClosedGroupHadQuantifier: boolean | null = null;

  const markCurrentGroupQuantified = () => {
    if (groupHasQuantifier.length > 0) {
      groupHasQuantifier[groupHasQuantifier.length - 1] = true;
    }
  };

  const checkNestedQuantifier = () => {
    if (justClosedGroupHadQuantifier) {
      throw new Error(
        "Pattern contains nested quantifiers (possible ReDoS risk)",
      );
    }
  };

  let i = 0;
  while (i < pattern.length) {
    const ch = pattern[i];

    if (ch === "\\") {
      i += 2;
      justClosedGroupHadQuantifier = null;
      continue;
    }

    if (ch === "[") {
      i++;
      while (i < pattern.length && pattern[i] !== "]") {
        if (pattern[i] === "\\") i++;
        i++;
      }
      i++;
      justClosedGroupHadQuantifier = null;
      continue;
    }

    if (ch === "(") {
      groupHasQuantifier.push(false);
      i++;
      // Skip non-capturing / lookaround prefixes: (?:, (?=, (?!, (?<=, (?<!, (?<name>
      if (pattern[i] === "?") {
        i++;
        if (pattern[i] === "<") i++;
        if (pattern[i] === ":" || pattern[i] === "=" || pattern[i] === "!") {
          i++;
        }
      }
      justClosedGroupHadQuantifier = null;
      continue;
    }

    if (ch === ")") {
      justClosedGroupHadQuantifier = groupHasQuantifier.pop() ?? false;
      i++;
      continue;
    }

    if (ch === "*" || ch === "+" || ch === "?") {
      checkNestedQuantifier();
      markCurrentGroupQuantified();
      i++;
      justClosedGroupHadQuantifier = null;
      continue;
    }

    if (ch === "{") {
      const close = pattern.indexOf("}", i);
      const inner = close !== -1 ? pattern.slice(i + 1, close) : "";
      const m = inner.match(/^(\d+)(?:,(\d*))?$/);
      if (close !== -1 && m) {
        const lo = Number.parseInt(m[1] ?? "0", 10);
        const hi =
          m[2] === undefined || m[2] === "" ? lo : Number.parseInt(m[2], 10);
        if (lo > MAX_BOUNDED_REPEAT || hi > MAX_BOUNDED_REPEAT) {
          throw new Error(
            `Bounded repeat too large (max: ${MAX_BOUNDED_REPEAT})`,
          );
        }
        checkNestedQuantifier();
        markCurrentGroupQuantified();
        i = close + 1;
        justClosedGroupHadQuantifier = null;
        continue;
      }
      // Literal '{': fall through
    }

    i++;
    justClosedGroupHadQuantifier = null;
  }
}

function withTimeout<T>(fn: () => T): T {
  // Note: JavaScript regex operations are synchronous and cannot be truly interrupted.
  // This timeout check happens *after* execution, so it won't prevent actual ReDoS attacks
  // where the regex engine blocks for extended periods.
  // The pattern validation above provides the main ReDoS protection.
  const start = Date.now();
  const result = fn();
  const elapsed = Date.now() - start;
  if (elapsed > TIMEOUT_MS) {
    throw new Error(
      `Regex execution took ${elapsed}ms (timeout: ${TIMEOUT_MS}ms, possible ReDoS)`,
    );
  }
  return result;
}

export function execute(input: Input): string {
  // Validate pattern for ReDoS risks
  validatePattern(input.pattern);

  let flags = input.flags ?? "";
  if (input.action !== "test" && !flags.includes("g")) {
    flags = `g${flags}`;
  }
  const regex = new RegExp(input.pattern, flags);

  switch (input.action) {
    case "test": {
      const result = withTimeout(() => regex.test(input.text));
      return JSON.stringify({ match: result });
    }
    case "match": {
      const matches: RegExpExecArray[] = [];
      let truncated = false;
      withTimeout(() => {
        for (const m of input.text.matchAll(regex)) {
          if (matches.length >= MAX_MATCH_COUNT) {
            truncated = true;
            break;
          }
          matches.push(m);
        }
      });
      if (matches.length === 0) {
        return JSON.stringify({ matches: null, index: null, groups: null });
      }
      const firstMatch = assertExists(matches[0], "regex matching");
      return JSON.stringify({
        matches: matches.map((m) => m[0]),
        index: firstMatch.index,
        groups: firstMatch.groups ?? null,
        ...(truncated && { truncated: true }),
      });
    }
    case "matchAll": {
      const matches: RegExpExecArray[] = [];
      let truncated = false;
      withTimeout(() => {
        for (const m of input.text.matchAll(regex)) {
          if (matches.length >= MAX_MATCH_COUNT) {
            truncated = true;
            break;
          }
          matches.push(m);
        }
      });
      return JSON.stringify(
        {
          matches: matches.map((m) => ({
            match: m[0],
            index: m.index,
            groups: m.groups ?? null,
            captures: m.slice(1),
          })),
          ...(truncated && { truncated: true }),
        },
        null,
        2,
      );
    }
    case "replace": {
      const replacement = input.replacement;
      if (replacement === undefined)
        throw new Error("replacement is required for replace");
      const result = withTimeout(() => input.text.replace(regex, replacement));
      return result;
    }
  }
}

export const tool: ToolDefinition = {
  name: "regex",
  description: "Test, match, matchAll, or replace using regular expressions",
  schema,
  handler: async (args: Record<string, unknown>) => {
    const input = inputSchema.parse(args);
    return execute(input);
  },
};
