import { describe, expect, test } from "bun:test";
import { execute } from "../../src/tools/ip.js";

describe("ip", () => {
  test("info for private IPv4", () => {
    const result = JSON.parse(execute({ action: "info", ip: "192.168.1.1" }));
    expect(result.version).toBe(4);
    expect(result.isPrivate).toBe(true);
    expect(result.class).toBe("C");
  });

  test("info for public IPv4", () => {
    const result = JSON.parse(execute({ action: "info", ip: "8.8.8.8" }));
    expect(result.isPrivate).toBe(false);
    expect(result.class).toBe("A");
  });

  test("info for IPv6", () => {
    const result = JSON.parse(execute({ action: "info", ip: "::1" }));
    expect(result.version).toBe(6);
    expect(result.type).toBe("loopback");
  });

  test("contains - IP in CIDR", () => {
    const result = JSON.parse(
      execute({
        action: "contains",
        cidr: "192.168.1.0/24",
        target: "192.168.1.100",
      }),
    );
    expect(result.contains).toBe(true);
  });

  test("contains - IP not in CIDR", () => {
    const result = JSON.parse(
      execute({
        action: "contains",
        cidr: "192.168.1.0/24",
        target: "192.168.2.1",
      }),
    );
    expect(result.contains).toBe(false);
  });

  test("range calculation", () => {
    const result = JSON.parse(
      execute({ action: "range", cidr: "10.0.0.0/24" }),
    );
    expect(result.network).toBe("10.0.0.0");
    expect(result.broadcast).toBe("10.0.0.255");
    expect(result.firstHost).toBe("10.0.0.1");
    expect(result.lastHost).toBe("10.0.0.254");
    expect(result.hostCount).toBe(254);
  });

  test("range - invalid CIDR notation (missing prefix length)", () => {
    expect(() => execute({ action: "range", cidr: "192.168.1.0" })).toThrow();
  });

  test("range - CIDR with invalid IP address", () => {
    expect(() =>
      execute({ action: "range", cidr: "999.999.999.0/24" }),
    ).toThrow();
  });

  test("range - prefix length outside 0-32", () => {
    expect(() =>
      execute({ action: "range", cidr: "192.168.1.0/33" }),
    ).toThrow();
  });

  test("info - malformed IPv6 address", () => {
    expect(() => execute({ action: "info", ip: ":::1" })).toThrow();
  });
});
