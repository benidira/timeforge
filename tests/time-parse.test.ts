import { describe, expect, it } from "vitest";
import {
  MAX_MS,
  MESSAGES,
  MIN_MS,
  daysInMonth,
  detectUnit,
  isLeapYear,
  parseTimestamp,
  toIsoUtc,
  utcFromParts,
} from "@/lib/time";

function iso(input: string, unit: "auto" | "seconds" | "milliseconds" = "auto") {
  const r = parseTimestamp(input, unit);
  if (!r.ok) throw new Error(r.error);
  return toIsoUtc(r.value.ms);
}

describe("parseTimestamp: seconds and milliseconds", () => {
  it("parses seconds", () => {
    const r = parseTimestamp("1790000000");
    expect(r).toEqual({ ok: true, value: { ms: 1790000000000, unit: "seconds", detected: true } });
    expect(iso("1790000000")).toBe("2026-09-21T14:13:20.000Z");
  });

  it("parses milliseconds and keeps the fraction of a second", () => {
    const r = parseTimestamp("1790000000123");
    expect(r).toEqual({ ok: true, value: { ms: 1790000000123, unit: "milliseconds", detected: true } });
    expect(iso("1790000000123")).toBe("2026-09-21T14:13:20.123Z");
  });

  it("respects an explicit unit and does not report it as detected", () => {
    const r = parseTimestamp("1790000000", "milliseconds");
    expect(r).toEqual({ ok: true, value: { ms: 1790000000, unit: "milliseconds", detected: false } });
    expect(iso("1790000000", "milliseconds")).toBe("1970-01-21T17:13:20.000Z");
    expect(parseTimestamp("1790000000000", "seconds")).toEqual({ ok: false, error: MESSAGES.range });
  });

  it("auto-detects at the 12 digit boundary", () => {
    expect(detectUnit(99_999_999_999)).toBe("seconds");
    expect(detectUnit(100_000_000_000)).toBe("milliseconds");
    expect(detectUnit(-100_000_000_000)).toBe("milliseconds");
    expect(detectUnit(0)).toBe("seconds");
  });

  it("accepts decimals, signs, spaces, commas and underscores", () => {
    expect(iso("1790000000.5")).toBe("2026-09-21T14:13:20.500Z");
    expect(iso("+1790000000")).toBe("2026-09-21T14:13:20.000Z");
    expect(iso("  1,790,000,000 ")).toBe("2026-09-21T14:13:20.000Z");
    expect(iso("1 790 000 000")).toBe("2026-09-21T14:13:20.000Z");
    expect(iso("1_790_000_000")).toBe("2026-09-21T14:13:20.000Z");
    expect(iso("1790000000.123", "seconds")).toBe("2026-09-21T14:13:20.123Z");
  });

  it("rounds sub-millisecond fractions to the nearest millisecond", () => {
    expect(iso("1790000000123.6", "milliseconds")).toBe("2026-09-21T14:13:20.124Z");
  });
});

describe("parseTimestamp: negative timestamps and the epoch", () => {
  it("handles zero and never returns -0", () => {
    expect(iso("0")).toBe("1970-01-01T00:00:00.000Z");
    const r = parseTimestamp("-0.0001", "seconds");
    expect(r.ok && Object.is(r.value.ms, 0)).toBe(true);
  });

  it("handles negative values (before 1970)", () => {
    expect(iso("-1")).toBe("1969-12-31T23:59:59.000Z");
    expect(iso("-86400")).toBe("1969-12-31T00:00:00.000Z");
    expect(iso("-1500", "milliseconds")).toBe("1969-12-31T23:59:58.500Z");
    expect(iso("-2147483648")).toBe("1901-12-13T20:45:52.000Z");
  });

  it("handles the 32-bit overflow moment", () => {
    expect(iso("2147483647")).toBe("2038-01-19T03:14:07.000Z");
    expect(iso("2147483648")).toBe("2038-01-19T03:14:08.000Z");
  });
});

describe("parseTimestamp: leap years", () => {
  it("converts leap days correctly", () => {
    expect(iso(String(Date.UTC(2024, 1, 29) / 1000))).toBe("2024-02-29T00:00:00.000Z");
    expect(iso(String(Date.UTC(2024, 1, 29) / 1000 + 86400))).toBe("2024-03-01T00:00:00.000Z");
    expect(iso(String(Date.UTC(2023, 1, 28) / 1000 + 86400))).toBe("2023-03-01T00:00:00.000Z");
    expect(iso(String(Date.UTC(2000, 1, 29) / 1000))).toBe("2000-02-29T00:00:00.000Z");
  });

  it("knows which years are leap years", () => {
    expect([2000, 2004, 2024, 2400].every(isLeapYear)).toBe(true);
    expect([1900, 2100, 2023, 2026].some(isLeapYear)).toBe(false);
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2023, 2)).toBe(28);
    expect(daysInMonth(2026, 4)).toBe(30);
    expect(daysInMonth(2026, 12)).toBe(31);
  });

  it("does not treat years 0-99 as 1900-1999", () => {
    expect(new Date(utcFromParts(50, 1, 1)).getUTCFullYear()).toBe(50);
  });
});

describe("parseTimestamp: invalid input", () => {
  it.each(["", "   ", "abc", "12abc", "1e9", "--1", "1.2.3", "Infinity", "NaN", "0x10", "1790000000s", ".5", "1,,", "1,79,000", "17,9000", "1__2", "٣٤٥"])(
    "rejects %j with a friendly message",
    (input) => {
      const r = parseTimestamp(input);
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.error).toBe(MESSAGES.timestamp);
        expect(r.error).not.toMatch(/NaN|Invalid Date|TypeError/);
      }
    },
  );

  it("explains values that look like microseconds or nanoseconds", () => {
    for (const v of ["1790000000000000", "1790000000000000000", "-1790000000000000"]) {
      const r = parseTimestamp(v);
      expect(r).toEqual({ ok: false, error: MESSAGES.tooManyDigits });
    }
  });

  it("reports the supported range", () => {
    expect(parseTimestamp("300000000000", "seconds")).toEqual({ ok: false, error: MESSAGES.range });
    expect(parseTimestamp("253402300800", "seconds")).toEqual({ ok: false, error: MESSAGES.range });
    expect(parseTimestamp("-62135596801", "seconds")).toEqual({ ok: false, error: MESSAGES.range });
    expect(parseTimestamp("253402300800000", "milliseconds")).toEqual({ ok: false, error: MESSAGES.range });
    expect(parseTimestamp("999999999999999")).toEqual({ ok: false, error: MESSAGES.range });
  });

  it("accepts the very first and very last supported moments", () => {
    expect(iso("-62135596800", "seconds")).toBe("0001-01-01T00:00:00.000Z");
    expect(iso("253402300799", "seconds")).toBe("9999-12-31T23:59:59.000Z");
    expect(toIsoUtc(MIN_MS)).toBe("0001-01-01T00:00:00.000Z");
    expect(toIsoUtc(MAX_MS)).toBe("9999-12-31T23:59:59.999Z");
  });
});
