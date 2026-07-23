import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const read = (path: string) => readFileSync(join(root, path), "utf8");

const pkg = JSON.parse(read("package.json"));

describe("version pin consistency", () => {
  test(".claude-plugin/plugin.json matches package.json version", () => {
    const plugin = JSON.parse(read(".claude-plugin/plugin.json"));
    expect(plugin.version).toBe(pkg.version);
  });

  test(".mcp.json pins the current package version", () => {
    const mcp = JSON.parse(read(".mcp.json"));
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
      const content = read(file);
      const pins = content.match(/@coo-quack\/calc-mcp@\d+\.\d+\.\d+/g) ?? [];
      expect(pins.length).toBeGreaterThan(0);
      for (const pin of pins) {
        expect(pin).toBe(`@coo-quack/calc-mcp@${pkg.version}`);
      }
    }
  });
});
