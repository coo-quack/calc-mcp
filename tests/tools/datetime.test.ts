import { describe, expect, test } from "bun:test";
import { execute } from "../../src/tools/datetime.js";

describe("datetime - now", () => {
  test("returns current UTC datetime in ISO format", () => {
    const result = execute({ action: "now" });
    // Should be a valid ISO-like string with +00:00
    expect(result).toContain("+00:00");
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  test("returns current datetime in specified timezone", () => {
    const result = execute({ action: "now", timezone: "Asia/Tokyo" });
    expect(result).toContain("+09:00");
  });

  test("returns date-only with format=date", () => {
    const result = execute({ action: "now", format: "date" });
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test("returns time-only with format=time", () => {
    const result = execute({ action: "now", format: "time" });
    expect(result).toMatch(/^\d{2}:\d{2}:\d{2}/);
  });

  test("returns full format", () => {
    const result = execute({
      action: "now",
      timezone: "America/New_York",
      format: "full",
    });
    // Should contain day name and timezone name
    expect(result).toMatch(
      /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/,
    );
    expect(result).toContain("Eastern");
  });
});

describe("datetime - convert", () => {
  test("converts UTC to Asia/Tokyo", () => {
    const result = execute({
      action: "convert",
      datetime: "2025-01-15T12:00:00Z",
      toTimezone: "Asia/Tokyo",
    });
    expect(result).toContain("2025-01-15T21:00:00");
    expect(result).toContain("+09:00");
  });

  test("converts between non-UTC timezones", () => {
    const result = execute({
      action: "convert",
      datetime: "2025-06-15T12:00:00+09:00",
      toTimezone: "America/New_York",
    });
    // JST 12:00 = UTC 03:00 = EDT 23:00 (previous day)
    expect(result).toContain("2025-06-14T23:00:00");
  });

  test("throws on missing datetime", () => {
    expect(() => execute({ action: "convert", toTimezone: "UTC" })).toThrow(
      "datetime is required",
    );
  });

  test("throws on invalid datetime", () => {
    expect(() =>
      execute({
        action: "convert",
        datetime: "not-a-date",
        toTimezone: "UTC",
      }),
    ).toThrow("Invalid datetime");
  });
});

describe("datetime - format", () => {
  test("formats datetime as ISO in timezone", () => {
    const result = execute({
      action: "format",
      datetime: "2025-07-04T12:00:00Z",
      timezone: "America/Los_Angeles",
    });
    expect(result).toContain("2025-07-04T05:00:00");
  });

  test("formats as date only", () => {
    const result = execute({
      action: "format",
      datetime: "2025-03-20T15:30:00Z",
      timezone: "UTC",
      format: "date",
    });
    expect(result).toBe("2025-03-20");
  });

  test("formats with custom Intl options", () => {
    const result = execute({
      action: "format",
      datetime: "2025-12-25T00:00:00Z",
      timezone: "UTC",
      format: '{"dateStyle":"long"}',
    });
    expect(result).toContain("December");
    expect(result).toContain("25");
    expect(result).toContain("2025");
  });

  test("formats with date-fns pattern yyyy/MM/dd", () => {
    const result = execute({
      action: "format",
      datetime: "2025-12-25T10:30:00Z",
      timezone: "UTC",
      format: "yyyy/MM/dd",
    });
    expect(result).toBe("2025/12/25");
  });

  test("formats with date-fns pattern yyyy-MM-dd HH:mm", () => {
    const result = execute({
      action: "format",
      datetime: "2025-12-25T10:30:00Z",
      timezone: "UTC",
      format: "yyyy-MM-dd HH:mm",
    });
    expect(result).toBe("2025-12-25 10:30");
  });

  test("formats with short format", () => {
    const result = execute({
      action: "format",
      datetime: "2025-12-25T10:30:00Z",
      timezone: "UTC",
      format: "short",
    });
    expect(result).toContain("Dec");
    expect(result).toContain("25");
    expect(result).toContain("2025");
  });
});

describe("datetime - timestamp", () => {
  test("converts UNIX timestamp to ISO datetime", () => {
    const result = execute({
      action: "timestamp",
      timestamp: 0,
    });
    expect(result).toContain("1970-01-01T00:00:00");
  });

  test("converts UNIX timestamp with timezone", () => {
    const result = execute({
      action: "timestamp",
      timestamp: 1736899200,
      timezone: "Asia/Tokyo",
    });
    expect(result).toContain("+09:00");
  });

  test("converts ISO datetime to UNIX timestamp", () => {
    const result = execute({
      action: "timestamp",
      datetime: "2025-01-15T03:00:00Z",
    });
    expect(result).toBe("1736910000");
  });

  test("returns current timestamp when no input given", () => {
    const before = Math.floor(Date.now() / 1000);
    const result = Number(execute({ action: "timestamp" }));
    const after = Math.floor(Date.now() / 1000);
    expect(result).toBeGreaterThanOrEqual(before);
    expect(result).toBeLessThanOrEqual(after);
  });

  test("roundtrips timestamp correctly", () => {
    const original = 1700000000;
    const iso = execute({ action: "timestamp", timestamp: original });
    const back = execute({ action: "timestamp", datetime: iso });
    expect(Number(back)).toBe(original);
  });
});

describe("datetime - convert reads the source timezone", () => {
  test("interprets a bare wall clock in fromTimezone", () => {
    // 2026-11-03 falls after US DST ends, so New York is EST (UTC-5).
    const result = execute({
      action: "convert",
      datetime: "2026-11-03 14:30",
      fromTimezone: "America/New_York",
      toTimezone: "UTC",
    });
    expect(result).toContain("2026-11-03T19:30:00");
    expect(result).toContain("+00:00");
  });

  test("uses the offset in effect on that date, not a fixed one", () => {
    // The same wall clock in June, when New York is EDT (UTC-4).
    const result = execute({
      action: "convert",
      datetime: "2026-06-15 14:30",
      fromTimezone: "America/New_York",
      toTimezone: "UTC",
    });
    expect(result).toContain("2026-06-15T18:30:00");
  });

  test("UTC to UTC leaves the wall clock untouched", () => {
    const result = execute({
      action: "convert",
      datetime: "2026-11-03 14:30",
      fromTimezone: "UTC",
      toTimezone: "UTC",
    });
    expect(result).toContain("2026-11-03T14:30:00");
  });

  test("defaults the source to UTC, so output does not depend on the host", () => {
    const implicit = execute({
      action: "convert",
      datetime: "2026-11-03 14:30",
      toTimezone: "UTC",
    });
    const explicit = execute({
      action: "convert",
      datetime: "2026-11-03 14:30",
      fromTimezone: "UTC",
      toTimezone: "UTC",
    });
    expect(implicit).toBe(explicit);
    expect(implicit).toContain("2026-11-03T14:30:00");
  });

  test("accepts timezone as the source when fromTimezone is absent", () => {
    const result = execute({
      action: "convert",
      datetime: "2026-11-03 14:30",
      timezone: "America/New_York",
      toTimezone: "UTC",
    });
    expect(result).toContain("2026-11-03T19:30:00");
  });

  test("an offset in the string wins over fromTimezone", () => {
    const result = execute({
      action: "convert",
      datetime: "2026-11-03T19:30:00Z",
      fromTimezone: "America/New_York",
      toTimezone: "Asia/Tokyo",
    });
    expect(result).toContain("2026-11-04T04:30:00");
  });

  test("throws on an unknown source timezone", () => {
    expect(() =>
      execute({
        action: "convert",
        datetime: "2026-11-03 14:30",
        fromTimezone: "Mars/Olympus",
        toTimezone: "UTC",
      }),
    ).toThrow("Invalid timezone");
  });

  test("throws on an unknown target timezone", () => {
    expect(() =>
      execute({
        action: "convert",
        datetime: "2026-11-03T14:30:00Z",
        toTimezone: "Mars/Olympus",
      }),
    ).toThrow("Invalid timezone");
  });
});

describe("datetime - fromTimezone on format and timestamp", () => {
  test("format reads the source timezone", () => {
    const result = execute({
      action: "format",
      datetime: "2026-03-01 12:00",
      fromTimezone: "Europe/Berlin",
      timezone: "UTC",
      format: "iso",
    });
    expect(result).toContain("2026-03-01T11:00:00");
  });

  test("timestamp reads the source timezone", () => {
    expect(
      execute({
        action: "timestamp",
        datetime: "2026-01-01 00:00",
        fromTimezone: "Asia/Tokyo",
      }),
    ).toBe("1767193200");
  });

  test("timestamp defaults the source to UTC", () => {
    expect(execute({ action: "timestamp", datetime: "2026-01-01 00:00" })).toBe(
      "1767225600",
    );
  });
});
