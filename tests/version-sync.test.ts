import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));

describe("version pin consistency", () => {
  test(".claude-plugin/plugin.json matches package.json version", () => {
    const plugin = JSON.parse(
      readFileSync(".claude-plugin/plugin.json", "utf8"),
    );
    expect(plugin.version).toBe(pkg.version);
  });

  test(".mcp.json pins the current package version", () => {
    const mcp = JSON.parse(readFileSync(".mcp.json", "utf8"));
    const args = mcp.mcpServers["calc-mcp"].args;
    expect(args).toContain(`@coo-quack/calc-mcp@${pkg.version}`);
  });

  test("docs and README pin the current package version", () => {
    const files = [
      "README.md",
      "docs/install.md",
      "docs/getting-started.md",
      "docs/troubleshooting.md",
    ];
    for (const file of files) {
      const content = readFileSync(file, "utf8");
      const pins = content.match(/@coo-quack\/calc-mcp@\d+\.\d+\.\d+/g) ?? [];
      for (const pin of pins) {
        expect(pin).toBe(`@coo-quack/calc-mcp@${pkg.version}`);
      }
    }
  });
});
