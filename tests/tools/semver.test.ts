import { describe, expect, test } from "bun:test";
import { execute } from "../../src/tools/semver.js";

const ERROR_MISSING_VERSION2 = "version2 is required";
const ERROR_MISSING_RANGE = "range is required";
const ERROR_INVALID_VERSION = "Invalid version";

describe("semver", () => {
  test("validates valid semver", () => {
    const result = JSON.parse(execute({ action: "valid", version: "1.2.3" }));
    expect(result.valid).toBe(true);
    expect(result.parsed.major).toBe(1);
  });

  test("validates invalid semver", () => {
    const result = JSON.parse(
      execute({ action: "valid", version: "not.valid" }),
    );
    expect(result.valid).toBe(false);
  });

  test("compares versions - greater", () => {
    const result = JSON.parse(
      execute({ action: "compare", version: "2.0.0", version2: "1.0.0" }),
    );
    expect(result.result).toBe(1);
  });

  test("compares versions - less", () => {
    const result = JSON.parse(
      execute({ action: "compare", version: "1.0.0", version2: "1.0.1" }),
    );
    expect(result.result).toBe(-1);
  });

  test("compares versions - equal", () => {
    const result = JSON.parse(
      execute({ action: "compare", version: "1.0.0", version2: "1.0.0" }),
    );
    expect(result.result).toBe(0);
  });

  test("satisfies caret range", () => {
    const result = JSON.parse(
      execute({ action: "satisfies", version: "1.5.0", range: "^1.0.0" }),
    );
    expect(result.satisfies).toBe(true);
  });

  test("does not satisfy caret range (major change)", () => {
    const result = JSON.parse(
      execute({ action: "satisfies", version: "2.0.0", range: "^1.0.0" }),
    );
    expect(result.satisfies).toBe(false);
  });

  test("satisfies tilde range", () => {
    const result = JSON.parse(
      execute({ action: "satisfies", version: "1.2.9", range: "~1.2.0" }),
    );
    expect(result.satisfies).toBe(true);
  });

  test("validates prerelease version", () => {
    const result = JSON.parse(
      execute({ action: "valid", version: "1.0.0-alpha.1" }),
    );
    expect(result.valid).toBe(true);
    expect(result.parsed.prerelease).toEqual(["alpha", "1"]);
  });

  test("validates version with build metadata", () => {
    const result = JSON.parse(
      execute({ action: "valid", version: "1.0.0+build.123" }),
    );
    expect(result.valid).toBe(true);
    expect(result.parsed.build).toEqual(["build", "123"]);
  });

  test("validates version with v prefix", () => {
    const result = JSON.parse(execute({ action: "valid", version: "v2.1.0" }));
    expect(result.valid).toBe(true);
    expect(result.parsed.major).toBe(2);
  });

  test("compares prerelease versions", () => {
    const result = JSON.parse(
      execute({
        action: "compare",
        version: "1.0.0-alpha",
        version2: "1.0.0",
      }),
    );
    expect(result.result).toBe(-1);
  });

  test("compares minor versions", () => {
    const result = JSON.parse(
      execute({ action: "compare", version: "1.2.0", version2: "1.1.0" }),
    );
    expect(result.result).toBe(1);
  });

  test("does not satisfy tilde range (minor change)", () => {
    const result = JSON.parse(
      execute({ action: "satisfies", version: "1.3.0", range: "~1.2.0" }),
    );
    expect(result.satisfies).toBe(false);
  });

  test("satisfies >= range", () => {
    const result = JSON.parse(
      execute({ action: "satisfies", version: "2.0.0", range: ">=1.5.0" }),
    );
    expect(result.satisfies).toBe(true);
  });

  test("satisfies < range", () => {
    const result = JSON.parse(
      execute({ action: "satisfies", version: "0.9.0", range: "<1.0.0" }),
    );
    expect(result.satisfies).toBe(true);
  });

  test("does not satisfy < range", () => {
    const result = JSON.parse(
      execute({ action: "satisfies", version: "1.0.0", range: "<1.0.0" }),
    );
    expect(result.satisfies).toBe(false);
  });

  test("satisfies exact version", () => {
    const result = JSON.parse(
      execute({ action: "satisfies", version: "1.2.3", range: "1.2.3" }),
    );
    expect(result.satisfies).toBe(true);
  });

  test("satisfies wildcard range", () => {
    const result = JSON.parse(
      execute({ action: "satisfies", version: "1.9.9", range: "1.x" }),
    );
    expect(result.satisfies).toBe(true);
  });

  test("does not satisfy wildcard range", () => {
    const result = JSON.parse(
      execute({ action: "satisfies", version: "2.0.0", range: "1.x" }),
    );
    expect(result.satisfies).toBe(false);
  });

  test("caret range with 0.x", () => {
    const result = JSON.parse(
      execute({ action: "satisfies", version: "0.2.0", range: "^0.1.0" }),
    );
    expect(result.satisfies).toBe(false);
  });

  test("throws on missing version2 for compare", () => {
    expect(() => execute({ action: "compare", version: "1.0.0" })).toThrow(
      ERROR_MISSING_VERSION2,
    );
  });

  test("throws on missing range for satisfies", () => {
    expect(() => execute({ action: "satisfies", version: "1.0.0" })).toThrow(
      ERROR_MISSING_RANGE,
    );
  });

  test("throws on invalid version for compare", () => {
    expect(() =>
      execute({ action: "compare", version: "bad", version2: "1.0.0" }),
    ).toThrow(ERROR_INVALID_VERSION);
  });

  test("parse extracts components", () => {
    const result = JSON.parse(execute({ action: "parse", version: "1.2.3" }));
    expect(result.version).toBe("1.2.3");
    expect(result.major).toBe(1);
    expect(result.minor).toBe(2);
    expect(result.patch).toBe(3);
    expect(result.prerelease).toBe(null);
    expect(result.build).toBe(null);
  });

  test("parse handles v prefix", () => {
    const result = JSON.parse(execute({ action: "parse", version: "v2.1.0" }));
    expect(result.major).toBe(2);
  });

  test("parse extracts prerelease", () => {
    const result = JSON.parse(
      execute({ action: "parse", version: "1.0.0-alpha" }),
    );
    expect(result.prerelease).toBe("alpha");
  });

  test("parse extracts build", () => {
    const result = JSON.parse(
      execute({ action: "parse", version: "1.0.0+build.123" }),
    );
    expect(result.build).toBe("build.123");
  });

  test("parse handles multiple prerelease parts", () => {
    const result = JSON.parse(
      execute({ action: "parse", version: "1.0.0-alpha.1.beta.2" }),
    );
    expect(result.prerelease).toBe("alpha.1.beta.2");
  });

  test("satisfies OR range (||)", () => {
    const result = JSON.parse(
      execute({
        action: "satisfies",
        version: "1.5.0",
        range: "^2.0.0 || ^1.0.0",
      }),
    );
    expect(result.satisfies).toBe(true);
  });

  test("does not satisfy OR range", () => {
    const result = JSON.parse(
      execute({
        action: "satisfies",
        version: "3.0.0",
        range: "^1.0.0 || ^2.0.0",
      }),
    );
    expect(result.satisfies).toBe(false);
  });

  test("satisfies AND range (space-separated)", () => {
    const result = JSON.parse(
      execute({
        action: "satisfies",
        version: "1.5.0",
        range: ">=1.0.0 <2.0.0",
      }),
    );
    expect(result.satisfies).toBe(true);
  });

  test("does not satisfy AND range", () => {
    const result = JSON.parse(
      execute({
        action: "satisfies",
        version: "2.5.0",
        range: ">=1.0.0 <2.0.0",
      }),
    );
    expect(result.satisfies).toBe(false);
  });

  test("satisfies hyphen range", () => {
    const result = JSON.parse(
      execute({
        action: "satisfies",
        version: "1.5.0",
        range: "1.0.0 - 2.0.0",
      }),
    );
    expect(result.satisfies).toBe(true);
  });

  test("satisfies hyphen range (boundary)", () => {
    const result1 = JSON.parse(
      execute({
        action: "satisfies",
        version: "1.0.0",
        range: "1.0.0 - 2.0.0",
      }),
    );
    expect(result1.satisfies).toBe(true);

    const result2 = JSON.parse(
      execute({
        action: "satisfies",
        version: "2.0.0",
        range: "1.0.0 - 2.0.0",
      }),
    );
    expect(result2.satisfies).toBe(true);
  });

  test("does not satisfy hyphen range", () => {
    const result = JSON.parse(
      execute({
        action: "satisfies",
        version: "2.5.0",
        range: "1.0.0 - 2.0.0",
      }),
    );
    expect(result.satisfies).toBe(false);
  });

  test("does not treat prerelease hyphen as range delimiter", () => {
    const result = JSON.parse(
      execute({
        action: "satisfies",
        version: "1.0.0-alpha",
        range: "1.0.0-alpha",
      }),
    );
    expect(result.satisfies).toBe(true);
  });

  test("handles prerelease versions in hyphen range", () => {
    // A hyphen range expands to >=1.0.0-alpha <=2.0.0-rc. Neither comparator
    // pins the tuple 1.5.0, so a 1.5.0 prerelease is not admitted, while the
    // stable 1.5.0 is. Checked against node-semver 7.8.5.
    const prerelease = JSON.parse(
      execute({
        action: "satisfies",
        version: "1.5.0-beta",
        range: "1.0.0-alpha - 2.0.0-rc",
      }),
    );
    expect(prerelease.satisfies).toBe(false);

    const stable = JSON.parse(
      execute({
        action: "satisfies",
        version: "1.5.0",
        range: "1.0.0-alpha - 2.0.0-rc",
      }),
    );
    expect(stable.satisfies).toBe(true);
  });
});

describe("semver - prerelease versions against ranges", () => {
  const satisfies = (version: string, range: string) =>
    JSON.parse(execute({ action: "satisfies", version, range })).satisfies;

  test("a prerelease is excluded from a range that never mentions one", () => {
    // <2.0.0 pins the tuple 2.0.0 but carries no prerelease tag, so 2.0.0-rc.1
    // must not satisfy it.
    expect(satisfies("2.0.0-rc.1", ">=1.4.0 <2.0.0")).toBe(false);
    expect(satisfies("1.4.0-beta.2", ">=1.4.0 <2.0.0")).toBe(false);
    expect(satisfies("1.0.0-rc.1", "^1.0.0")).toBe(false);
    expect(satisfies("1.2.3-rc.1", "1.x")).toBe(false);
  });

  test("stable versions in the same range are unaffected", () => {
    expect(satisfies("1.4.0", ">=1.4.0 <2.0.0")).toBe(true);
    expect(satisfies("1.9.0", ">=1.4.0 <2.0.0")).toBe(true);
    expect(satisfies("1.10.2", ">=1.4.0 <2.0.0")).toBe(true);
    expect(satisfies("2.0.0", ">=1.4.0 <2.0.0")).toBe(false);
  });

  test("a comparator with a prerelease opts that tuple in", () => {
    expect(satisfies("1.2.3-alpha.7", ">1.2.3-alpha.3")).toBe(true);
    expect(satisfies("3.4.5-alpha.9", ">1.2.3-alpha.3")).toBe(false);
    expect(satisfies("3.4.5", ">1.2.3-alpha.3")).toBe(true);
    expect(satisfies("1.0.0-rc.2", "^1.0.0-rc.1")).toBe(true);
  });

  test("the rule applies to the comparator set, not to each comparator", () => {
    // >=1.4.0-rc.1 opts the 1.4.0 tuple in; <2.0.0 must not veto it.
    expect(satisfies("1.4.0-rc.2", ">=1.4.0-rc.1 <2.0.0")).toBe(true);
  });

  test("each alternative of an OR range is its own set", () => {
    expect(satisfies("1.2.3-rc.1", ">=1.0.0 || 1.2.3-rc.1")).toBe(true);
    expect(satisfies("1.2.3-rc.1", ">=1.0.0 || >=2.0.0")).toBe(false);
  });
});
