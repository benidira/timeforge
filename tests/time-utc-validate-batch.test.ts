import { describe, expect, it } from "vitest";
import {
  MESSAGES,
  batchToCsv,
  convertBatch,
  csvCell,
  formatOffset,
  getOffsetMs,
  MAX_BATCH_ROWS,
  TIMESTAMP_LIMITS,
  toIsoOffset,
  validateTimestamp,
  wallClockToInstant,
} from "@/lib/time";

describe("UTC offsets (UTC Converter)", () => {
  it("computes positive, negative and zero offsets, with DST applied", () => {
    const summer = wallClockToInstant({ year: 2026, month: 7, day: 1, hour: 12, minute: 0, second: 0 }, "UTC");
    if (!summer.ok) throw new Error("setup");
    expect(getOffsetMs(summer.value.ms, "Europe/Paris")).toBe(2 * 3_600_000); // CEST, positive
    expect(getOffsetMs(summer.value.ms, "America/New_York")).toBe(-4 * 3_600_000); // EDT, negative
    expect(getOffsetMs(summer.value.ms, "UTC")).toBe(0);

    const winter = wallClockToInstant({ year: 2026, month: 1, day: 1, hour: 12, minute: 0, second: 0 }, "UTC");
    if (!winter.ok) throw new Error("setup");
    expect(getOffsetMs(winter.value.ms, "Europe/Paris")).toBe(1 * 3_600_000); // CET
    expect(getOffsetMs(winter.value.ms, "America/New_York")).toBe(-5 * 3_600_000); // EST
    expect(formatOffset(getOffsetMs(winter.value.ms, "Asia/Kolkata"))).toBe("+05:30");
    expect(toIsoOffset(summer.value.ms, "UTC")).toBe(toIsoOffset(summer.value.ms, "UTC")); // Z form stable
  });
});

describe("validateTimestamp (Unix Timestamp Validator)", () => {
  it("accepts valid seconds and milliseconds", () => {
    const s = validateTimestamp("1790000000", "seconds");
    expect(s).toMatchObject({ valid: true, unit: "seconds", digits: 10 });
    const m = validateTimestamp("1790000000123", "milliseconds");
    expect(m).toMatchObject({ valid: true, unit: "milliseconds", digits: 13 });
    const auto = validateTimestamp("1790000000000");
    expect(auto).toMatchObject({ valid: true, unit: "milliseconds", detected: true });
  });

  it("rejects non-numeric text with a specific reason", () => {
    const r = validateTimestamp("hello world");
    expect(r).toMatchObject({ valid: false, problem: "characters" });
    expect(validateTimestamp("")).toMatchObject({ valid: false, problem: "empty" });
    expect(validateTimestamp("1.5e10")).toMatchObject({ valid: false, problem: "scientific" });
  });

  it("accepts negative timestamps and flags them in a note", () => {
    const r = validateTimestamp("-86400", "seconds");
    expect(r).toMatchObject({ valid: true, ms: -86_400_000 });
    expect(r.valid && r.notes.some((n) => n.includes("before 1 January 1970"))).toBe(true);
  });

  it("flags boundary values", () => {
    expect(validateTimestamp(String(TIMESTAMP_LIMITS.maxSeconds), "seconds")).toMatchObject({ valid: true });
    expect(validateTimestamp(String(TIMESTAMP_LIMITS.maxSeconds + 1), "seconds")).toMatchObject({ valid: false, problem: "range" });
    expect(validateTimestamp(String(TIMESTAMP_LIMITS.minSeconds), "seconds")).toMatchObject({ valid: true });
    expect(validateTimestamp("99999999999999999", "seconds")).toMatchObject({ valid: false, problem: "tooManyDigits" });
  });
});

describe("convertBatch (Unix Timestamp Batch Converter)", () => {
  it("converts multiple values", () => {
    const r = convertBatch("0\n86400\n1790000000", "seconds", "UTC");
    expect(r.validCount).toBe(3);
    expect(r.invalidCount).toBe(0);
    expect(r.rows[0]).toMatchObject({ ok: true, utc: "1970-01-01 00:00:00" });
  });

  it("skips blank lines without reporting them", () => {
    const r = convertBatch("0\n\n   \n86400\n", "seconds", "UTC");
    expect(r.rows).toHaveLength(2);
    expect(r.rows.map((x) => x.line)).toEqual([1, 4]);
  });

  it("reports invalid lines individually, keeping the good ones", () => {
    const r = convertBatch("0\nnot-a-number\n86400", "seconds", "UTC");
    expect(r.rows.map((x) => x.ok)).toEqual([true, false, true]);
    expect(r.rows[1].error).toBe(MESSAGES.timestamp);
    expect(r.validCount).toBe(2);
    expect(r.invalidCount).toBe(1);
  });

  it("auto-detects mixed units per line", () => {
    const r = convertBatch("1790000000\n1790000000000", "auto", "UTC");
    expect(r.rows.map((x) => x.unit)).toEqual(["seconds", "milliseconds"]);
    expect(r.rows[0].utc).toBe(r.rows[1].utc);
  });

  it("truncates beyond the row limit", () => {
    const text = Array.from({ length: MAX_BATCH_ROWS + 5 }, (_, i) => i).join("\n");
    const r = convertBatch(text, "seconds", "UTC");
    expect(r.rows).toHaveLength(MAX_BATCH_ROWS);
    expect(r.truncated).toBe(true);
  });

  it("produces CSV that neutralises formula-looking cells and quotes commas", () => {
    expect(csvCell("=1+1")).toBe("'=1+1");
    expect(csvCell("hello, world")).toBe('"hello, world"');
    expect(csvCell("-86400")).toBe("-86400");
    const csv = batchToCsv(convertBatch("0", "seconds", "UTC").rows);
    expect(csv.startsWith("Timestamp,Unit,UTC,Local,ISO 8601,Status\r\n")).toBe(true);
  });
});
