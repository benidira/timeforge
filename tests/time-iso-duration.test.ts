import { describe, expect, it } from "vitest";
import {
  MAX_MS,
  MESSAGES,
  buildTimestampRows,
  dateDetails,
  diffTimestamps,
  humanDuration,
  parseDateInput,
  parseIso8601,
  parseTimeInput,
  splitDuration,
  toIsoUtc,
} from "@/lib/time";

const ms = (input: string, zone?: string) => {
  const r = parseIso8601(input, zone);
  if (!r.ok) throw new Error(`${input}: ${r.error}`);
  return r.value.ms;
};

describe("parseIso8601", () => {
  const instant = Date.UTC(2026, 8, 20, 12, 30);

  it("parses UTC and offsets to the same instant", () => {
    expect(ms("2026-09-20T12:30:00Z")).toBe(instant);
    expect(ms("2026-09-20T14:30:00+02:00")).toBe(instant);
    expect(ms("2026-09-20T14:30:00+0200")).toBe(instant);
    expect(ms("2026-09-20T14:30:00+02")).toBe(instant);
    expect(ms("2026-09-20T07:30:00-05:00")).toBe(instant);
    expect(ms("2026-09-20T18:00:00+05:30")).toBe(instant);
    expect(ms("2026-09-20T12:30Z")).toBe(instant);
    expect(ms("2026-09-20t12:30:00z")).toBe(instant);
    expect(ms("2026-09-20 12:30:00Z")).toBe(instant);
    expect(ms("  2026-09-20T12:30:00Z  ")).toBe(instant);
  });

  it("reports offset details", () => {
    expect(parseIso8601("2026-09-20T12:30:00Z")).toMatchObject({ ok: true, value: { hasOffset: true, offsetMinutes: 0, assumedZone: null } });
    expect(parseIso8601("2026-09-20T12:30:00-05:00")).toMatchObject({ ok: true, value: { offsetMinutes: -300 } });
  });

  it("parses fractional seconds and truncates beyond milliseconds", () => {
    expect(ms("2026-09-20T12:30:00.250Z")).toBe(instant + 250);
    expect(ms("2026-09-20T12:30:00.2Z")).toBe(instant + 200);
    expect(ms("2026-09-20T12:30:00,5Z")).toBe(instant + 500);
    expect(ms("2026-09-20T12:30:00.123456789Z")).toBe(instant + 123);
  });

  it("reads strings without an offset in the assumed zone", () => {
    expect(ms("2026-09-20T12:30:00")).toBe(instant);
    expect(ms("2026-09-20T12:30:00", "America/New_York")).toBe(instant + 4 * 3_600_000);
    expect(ms("2026-09-20T12:30:00", "local")).toBe(instant + 4 * 3_600_000);
    expect(parseIso8601("2026-09-20T12:30:00", "Asia/Tokyo")).toMatchObject({ ok: true, value: { hasOffset: false, assumedZone: "Asia/Tokyo" } });
  });

  it("reads a date without a time as midnight", () => {
    expect(ms("2026-09-20")).toBe(Date.UTC(2026, 8, 20));
    expect(parseIso8601("2026-09-20")).toMatchObject({ ok: true, value: { dateOnly: true, assumedZone: "UTC" } });
    expect(ms("2026-09-20", "Asia/Tokyo")).toBe(Date.UTC(2026, 8, 19, 15));
  });

  it("validates calendar dates and leap years", () => {
    expect(ms("2024-02-29T00:00:00Z")).toBe(Date.UTC(2024, 1, 29));
    expect(ms("2000-02-29")).toBe(Date.UTC(2000, 1, 29));
    for (const bad of ["2023-02-29T00:00:00Z", "1900-02-29", "2026-04-31", "2026-02-30", "2026-13-01T00:00:00Z", "2026-00-10", "2026-01-00"]) {
      expect(parseIso8601(bad)).toEqual({ ok: false, error: MESSAGES.iso });
    }
  });

  it.each([
    "",
    "hello",
    "2026-9-20",
    "20260920T123000Z",
    "2026-09-20T24:00:00Z",
    "2026-09-20T12:60:00Z",
    "2026-09-20T12:30:60Z",
    "2026-09-20T12:30:00+25:00",
    "2026-09-20T12:30:00+02:60",
    "2026-09-20T12",
    "2026-09-20T12:30:00Zextra",
    "2026-09-20Z",
    "1790000000",
  ])("rejects %j", (bad) => {
    const r = parseIso8601(bad);
    expect(r).toEqual({ ok: false, error: MESSAGES.iso });
  });

  it("rejects local times that do not exist in the assumed zone", () => {
    expect(parseIso8601("2026-03-08T02:30:00", "America/New_York")).toEqual({ ok: false, error: MESSAGES.nonexistent });
  });

  it("flags ambiguous local times", () => {
    expect(parseIso8601("2026-11-01T01:30:00", "America/New_York")).toMatchObject({ ok: true, value: { ambiguous: true } });
  });

  it("checks the supported range", () => {
    expect(parseIso8601("0000-01-01T00:00:00Z")).toEqual({ ok: false, error: MESSAGES.range });
    expect(ms("9999-12-31T23:59:59.999Z")).toBe(MAX_MS);
    expect(parseIso8601("9999-12-31T23:59:59-01:00")).toEqual({ ok: false, error: MESSAGES.range });
    expect(toIsoUtc(ms("0001-01-01T00:00:00Z"))).toBe("0001-01-01T00:00:00.000Z");
  });
});

describe("date and time inputs", () => {
  it("parses <input type=date> values", () => {
    expect(parseDateInput("2026-09-20")).toEqual({ ok: true, value: { year: 2026, month: 9, day: 20 } });
    expect(parseDateInput("2024-02-29").ok).toBe(true);
    for (const bad of ["", "2023-02-29", "2026-13-01", "2026-9-1", "20-09-2026", "abc", "0000-01-01"]) {
      expect(parseDateInput(bad).ok).toBe(false);
    }
    expect(parseDateInput("")).toEqual({ ok: false, error: MESSAGES.dateTime });
  });

  it("parses <input type=time> values", () => {
    expect(parseTimeInput("12:30")).toEqual({ ok: true, value: { hour: 12, minute: 30, second: 0 } });
    expect(parseTimeInput("23:59:59")).toEqual({ ok: true, value: { hour: 23, minute: 59, second: 59 } });
    for (const bad of ["", "24:00", "12:60", "12:30:60", "1:30", "noon"]) expect(parseTimeInput(bad).ok).toBe(false);
  });
});

describe("timestamp differences", () => {
  const a = 1790000000000;
  const gap = (2 * 86400 + 4 * 3600 + 12 * 60 + 30) * 1000;

  it("calculates the documented example", () => {
    const d = diffTimestamps(a, a + gap);
    expect(d.human).toBe("2 days 4 hours 12 minutes 30 seconds");
    expect(d.direction).toBe("after");
    expect(d.totals).toEqual({
      milliseconds: "187950000",
      seconds: "187950",
      minutes: "3132.5",
      hours: "52.208333",
      days: "2.175347",
    });
  });

  it("is symmetric and reports direction", () => {
    const d = diffTimestamps(a + gap, a);
    expect(d.direction).toBe("before");
    expect(d.signedMs).toBe(-gap);
    expect(d.human).toBe("2 days 4 hours 12 minutes 30 seconds");
    expect(diffTimestamps(a, a)).toMatchObject({ direction: "same", human: "0 seconds", signedMs: 0 });
  });

  it("uses singular and plural correctly and keeps milliseconds", () => {
    expect(humanDuration(86_400_000 + 3_600_000 + 60_000 + 1000)).toBe("1 day 1 hour 1 minute 1 second");
    expect(humanDuration(1500)).toBe("1 second 500 milliseconds");
    expect(humanDuration(1)).toBe("1 millisecond");
    expect(splitDuration(90_061_001)).toEqual({ days: 1, hours: 1, minutes: 1, seconds: 1, milliseconds: 1 });
  });

  it("handles fractions, negative epochs and huge gaps", () => {
    expect(diffTimestamps(0, 500).totals.seconds).toBe("0.5");
    expect(diffTimestamps(-1000, 1000).human).toBe("2 seconds");
    expect(diffTimestamps(-62135596800000, 253402300799999).totals.milliseconds).toBe("315537897599999");
  });
});

describe("date details", () => {
  it("reports weekday, day of year and leap year", () => {
    expect(dateDetails(Date.UTC(2024, 1, 29))).toEqual({ weekday: "Thursday", dayOfYear: 60, isoWeek: 9, isoWeekYear: 2024, leapYear: true });
    expect(dateDetails(0)).toEqual({ weekday: "Thursday", dayOfYear: 1, isoWeek: 1, isoWeekYear: 1970, leapYear: false });
    expect(dateDetails(Date.UTC(2024, 11, 31)).dayOfYear).toBe(366);
    expect(dateDetails(Date.UTC(2023, 11, 31)).dayOfYear).toBe(365);
  });

  it("follows ISO 8601 week numbering across year boundaries", () => {
    expect(dateDetails(Date.UTC(2026, 0, 1))).toMatchObject({ isoWeek: 1, isoWeekYear: 2026 });
    expect(dateDetails(Date.UTC(2027, 0, 1))).toMatchObject({ isoWeek: 53, isoWeekYear: 2026 });
    expect(dateDetails(Date.UTC(2024, 11, 30))).toMatchObject({ isoWeek: 1, isoWeekYear: 2025 });
    expect(dateDetails(Date.UTC(2021, 0, 3))).toMatchObject({ isoWeek: 53, isoWeekYear: 2020 });
  });
});

describe("result rows", () => {
  const ctx = { localTimeZone: "America/New_York", nowMs: 1790000000000 };
  const value = (rows: { id: string; value: string }[], id: string) => rows.find((r) => r.id === id)?.value;

  it("unix", () => {
    const rows = buildTimestampRows("unix", 1790000000000, ctx);
    expect(rows.map((r) => r.label)).toEqual(["UTC", "Local Time (America/New_York)", "ISO 8601", "Relative to now"]);
    expect(value(rows, "iso")).toBe("2026-09-21T14:13:20.000Z");
    expect(value(rows, "utc")).toContain("2:13:20 PM");
    expect(value(rows, "local")).toContain("10:13:20 AM");
    expect(value(rows, "relative")).toBe("now");
  });

  it("epoch shows both units", () => {
    expect(value(buildTimestampRows("epoch", 1790000000000, ctx), "seconds")).toBe("1790000000");
    expect(value(buildTimestampRows("epoch", 1790000000123, ctx), "seconds")).toBe("1790000000.123");
    expect(value(buildTimestampRows("epoch", 1790000000123, ctx), "milliseconds")).toBe("1790000000123");
  });

  it("toDate adds calendar details", () => {
    const rows = buildTimestampRows("toDate", Date.UTC(2024, 1, 29), ctx);
    expect(value(rows, "weekday")).toBe("Thursday");
    expect(value(rows, "dayOfYear")).toBe("60");
    expect(value(rows, "isoWeek")).toBe("2024-W09");
    expect(value(rows, "leap")).toBe("Yes");
    expect(rows.filter((r) => r.group).length).toBe(4);
  });

  it("ms keeps milliseconds", () => {
    const rows = buildTimestampRows("ms", 1790000000123, ctx);
    expect(value(rows, "utc")).toBe("2026-09-21 14:13:20.123 UTC");
    expect(value(rows, "local")).toBe("2026-09-21 10:13:20.123 (America/New_York)");
    expect(value(rows, "readable")).toContain(":20.123");
  });

  it("toIso gives UTC and offset forms", () => {
    const rows = buildTimestampRows("toIso", 1790000000123, ctx);
    expect(value(rows, "isoUtc")).toBe("2026-09-21T14:13:20.123Z");
    expect(value(rows, "isoLocal")).toBe("2026-09-21T10:13:20.123-04:00");
  });

  it("works for negative timestamps", () => {
    const rows = buildTimestampRows("unix", -86400000, ctx);
    expect(value(rows, "iso")).toBe("1969-12-31T00:00:00.000Z");
  });
});
