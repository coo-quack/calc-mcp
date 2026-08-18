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

describe("ip - info accepts a prefix", () => {
  test("takes CIDR notation in ip and reports the network it describes", () => {
    const result = JSON.parse(execute({ action: "info", ip: "10.0.0.0/29" }));
    expect(result.ip).toBe("10.0.0.0");
    expect(result.version).toBe(4);
    expect(result.network).toBe("10.0.0.0");
    expect(result.broadcast).toBe("10.0.0.7");
    expect(result.hostCount).toBe(6);
    expect(result.totalAddresses).toBe(8);
  });

  test("takes the prefix through cidr instead", () => {
    const result = JSON.parse(
      execute({ action: "info", cidr: "192.168.5.130/26" }),
    );
    expect(result.ip).toBe("192.168.5.130");
    expect(result.network).toBe("192.168.5.128");
    expect(result.broadcast).toBe("192.168.5.191");
  });

  test("a bare address carries no network fields", () => {
    const result = JSON.parse(execute({ action: "info", ip: "192.168.5.130" }));
    expect(result.isPrivate).toBe(true);
    expect(result.network).toBeUndefined();
  });

  test("throws when neither ip nor cidr is given", () => {
    expect(() => execute({ action: "info" })).toThrow("ip or cidr is required");
  });
});

describe("ip - range reports the address count", () => {
  test("counts every address in the block, not just usable hosts", () => {
    const result = JSON.parse(
      execute({ action: "range", cidr: "10.1.0.0/20" }),
    );
    expect(result.totalAddresses).toBe(4096);
    expect(result.hostCount).toBe(4094);
    expect(result.broadcast).toBe("10.1.15.255");
  });
});

describe("ip - info rejects an IPv6 prefix clearly", () => {
  test("names the address to pass instead", () => {
    // cidrRange is IPv4-only, so the old path failed as though the address
    // itself were malformed.
    expect(() => execute({ action: "info", ip: "2001:db8::/32" })).toThrow(
      "IPv6 prefixes are not supported",
    );
    expect(() => execute({ action: "info", cidr: "2001:db8::/32" })).toThrow(
      "2001:db8::",
    );
  });

  test("a bare IPv6 address still works", () => {
    const result = JSON.parse(execute({ action: "info", ip: "2001:db8::1" }));
    expect(result.version).toBe(6);
    expect(result.type).toBe("global");
  });
});
