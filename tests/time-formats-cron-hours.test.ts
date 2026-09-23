import { describe, expect, it } from "vitest";
import {
  RFC2822_MESSAGE,
  RFC3339_MESSAGE,
  computeBusinessHours,
  BUSINESS_MESSAGES,
  buildCron,
  CRON_MESSAGES,
  DEFAULT_CRON_CONFIG,
  describeCron,
  nextRuns,
  parseAnyDate,
  parseCron,
  parseRfc2822,
  parseRfc3339,
  toIsoUtc,
  toRfc2822,
  toRfc3339,
} from "@/lib/time";

function cron(expr: string) {
  const r = parseCron(expr);
  if (!r.ok) throw new Error(`expected ${expr} to parse: ${r.error}`);
  return r.value;
}

describe("RFC 3339 Converter", () => {
  it("round-trips Unix -> RFC 3339 -> Unix", () => {
    const ms = Date.UTC(2026, 8, 20, 12, 30, 0);
    expect(toRfc3339(ms, "UTC")).toBe("2026-09-20T12:30:00Z");
    expect(toRfc3339(ms, "Asia/Tokyo")).toBe("2026-09-20T21:30:00+09:00");
    expect(parseRfc3339("2026-09-20T12:30:00Z")).toEqual({ ok: true, value: { ms, offsetMinutes: 0 } });
    expect(parseRfc3339("2026-09-20T14:30:00+02:00")).toEqual({ ok: true, value: { ms, offsetMinutes: 120 } });
  });

  it("keeps a non-zero millisecond fraction and omits a zero one", () => {
    expect(toRfc3339(Date.UTC(2026, 8, 20, 12, 30, 0, 250), "UTC")).toBe("2026-09-20T12:30:00.250Z");
    expect(toRfc3339(Date.UTC(2026, 8, 20, 12, 30, 0, 0), "UTC")).toBe("2026-09-20T12:30:00Z");
  });

  it("requires an offset, unlike plain ISO 8601", () => {
    expect(parseRfc3339("2026-09-20T12:30:00")).toEqual({ ok: false, error: expect.stringContaining("offset") });
    expect(parseRfc3339("2026-09-20")).toEqual({ ok: false, error: expect.stringContaining("time as well") });
    expect(parseRfc3339("not a date")).toEqual({ ok: false, error: RFC3339_MESSAGE });
  });
});

describe("RFC 2822 (Date Format Converter)", () => {
  it("round-trips with a numeric offset and validates the weekday", () => {
    const ms = Date.UTC(2026, 8, 21, 14, 13, 20); // 21 Sep 2026 is a Monday
    expect(toRfc2822(ms, "UTC")).toBe("Mon, 21 Sep 2026 14:13:20 +0000");
    expect(parseRfc2822("Mon, 21 Sep 2026 14:13:20 +0000")).toEqual({ ok: true, value: { ms, offsetMinutes: 0 } });
    expect(parseRfc2822("21 Sep 2026 14:13:20 +0000")).toEqual({ ok: true, value: { ms, offsetMinutes: 0 } });
  });

  it("accepts common zone abbreviations and rejects a mismatched weekday", () => {
    expect(parseRfc2822("Mon, 21 Sep 2026 09:13:20 EST")).toEqual({
      ok: true,
      value: { ms: Date.UTC(2026, 8, 21, 14, 13, 20), offsetMinutes: -300 },
    });
    expect(parseRfc2822("Tue, 21 Sep 2026 14:13:20 +0000")).toEqual({ ok: false, error: expect.stringContaining("is a Mon") });
    expect(parseRfc2822("garbage")).toEqual({ ok: false, error: RFC2822_MESSAGE });
  });
});

describe("parseAnyDate (ISO 8601 Converter / Date Format Converter)", () => {
  it("detects Unix seconds, milliseconds, ISO 8601, RFC 3339 and RFC 2822", () => {
    expect(parseAnyDate("1790000000")).toMatchObject({ ok: true, value: { format: "Unix seconds" } });
    expect(parseAnyDate("1790000000000")).toMatchObject({ ok: true, value: { format: "Unix milliseconds" } });
    expect(parseAnyDate("2026-09-20T12:30:00Z")).toMatchObject({ ok: true, value: { format: "RFC 3339" } });
    expect(parseAnyDate("2026-09-20")).toMatchObject({ ok: true, value: { format: "ISO 8601" } });
    expect(parseAnyDate("Mon, 21 Sep 2026 14:13:20 +0000")).toMatchObject({ ok: true, value: { format: "RFC 2822" } });
    expect(parseAnyDate("not a date at all")).toMatchObject({ ok: false });
  });
});

describe("computeBusinessHours (Business Hours Converter)", () => {
  const date = { year: 2026, month: 9, day: 21 }; // no DST change that week anywhere used below

  it("compares overlapping working hours between zones", () => {
    const r = computeBusinessHours(date, [
      { zone: "America/New_York", start: "09:00", end: "17:00" },
      { zone: "Europe/London", start: "09:00", end: "17:00" },
    ]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.rows[0].local).toBe("09:00\u201317:00");
    expect(r.value.rows[0].inReference).toBe("09:00\u201317:00");
    expect(r.value.rows[1].inReference).toBe("04:00\u201312:00"); // London's hours, shown in NY (the reference zone)
    expect(r.value.overlap).not.toBeNull();
    expect(r.value.overlap?.minutes).toBe(3 * 60);
  });

  it("reports no overlap when working hours never coincide", () => {
    const r = computeBusinessHours(date, [
      { zone: "America/Los_Angeles", start: "09:00", end: "12:00" },
      { zone: "Asia/Tokyo", start: "09:00", end: "12:00" },
    ]);
    expect(r.ok && r.value.overlap).toBeNull();
  });

  it("supports an overnight shift (end time before start time)", () => {
    const r = computeBusinessHours(date, [
      { zone: "UTC", start: "22:00", end: "06:00" },
      { zone: "UTC", start: "22:00", end: "06:00" },
    ]);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.rows[0].local).toBe("22:00\u201306:00 (+1 day)");
      expect((r.value.rows[0].endMs - r.value.rows[0].startMs) / 3_600_000).toBe(8);
    }
  });

  it("requires at least two zones and rejects equal start/end", () => {
    expect(computeBusinessHours(date, [{ zone: "UTC", start: "09:00", end: "17:00" }])).toEqual({
      ok: false,
      error: BUSINESS_MESSAGES.few,
    });
    expect(
      computeBusinessHours(date, [
        { zone: "UTC", start: "09:00", end: "09:00" },
        { zone: "UTC", start: "09:00", end: "17:00" },
      ]),
    ).toEqual({ ok: false, error: BUSINESS_MESSAGES.same });
  });

  it("applies DST correctly when the reference and target differ across a change", () => {
    // London (UK) ends BST on 2026-10-25; New York ends EDT a week later on 2026-11-01.
    // Before either change: BST(+1) vs EDT(-4) = 5h apart. After London falls back but before
    // New York does (e.g. 2026-10-27): GMT(0) vs EDT(-4) = only 4h apart.
    const before = computeBusinessHours(
      { year: 2026, month: 10, day: 20 },
      [
        { zone: "Europe/London", start: "09:00", end: "17:00" },
        { zone: "America/New_York", start: "09:00", end: "17:00" },
      ],
    );
    const between = computeBusinessHours(
      { year: 2026, month: 10, day: 27 },
      [
        { zone: "Europe/London", start: "09:00", end: "17:00" },
        { zone: "America/New_York", start: "09:00", end: "17:00" },
      ],
    );
    expect(before.ok && before.value.rows[1].inReference).toBe("14:00\u201322:00");
    expect(between.ok && between.value.rows[1].inReference).toBe("13:00\u201321:00");
  });
});

describe("Cron Expression Generator", () => {
  it("parses common expressions and describes them in English", () => {
    expect(describeCron(cron("* * * * *"))).toBe("Every minute");
    expect(describeCron(cron("*/15 * * * *"))).toBe("Every 15 minutes");
    expect(describeCron(cron("0 9 * * *"))).toBe("At 09:00");
    expect(describeCron(cron("0 9 * * 1-5"))).toBe("At 09:00, on Monday through Friday");
    expect(describeCron(cron("0 0 1 * *"))).toBe("At 00:00, on day-of-month 1");
    expect(describeCron(cron("@daily"))).toBe("At 00:00");
    expect(describeCron(cron("@weekly"))).toBe("At 00:00, on Sunday");
  });

  it("computes upcoming run times", () => {
    const c = cron("0 9 * * 1-5");
    const from = Date.UTC(2026, 8, 21, 10, 0, 0); // Monday 21 Sep, 10:00 (after 09:00 run)
    const runs = nextRuns(c, from, 3);
    expect(runs.map((ms) => toIsoUtc(ms))).toEqual([
      "2026-09-22T09:00:00.000Z",
      "2026-09-23T09:00:00.000Z",
      "2026-09-24T09:00:00.000Z",
    ]);
  });

  it("rejects invalid expressions with specific errors", () => {
    expect(parseCron("")).toEqual({ ok: false, error: CRON_MESSAGES.empty });
    expect(parseCron("* * * *")).toEqual({ ok: false, error: CRON_MESSAGES.fewFields });
    expect(parseCron("0 0 * * * *")).toEqual({ ok: false, error: CRON_MESSAGES.sixFields });
    expect(parseCron("60 * * * *")).toEqual({ ok: false, error: expect.stringContaining("out of range") });
    expect(parseCron("* 25 * * *")).toEqual({ ok: false, error: expect.stringContaining("out of range") });
    expect(parseCron("* * * * 8")).toEqual({ ok: false, error: expect.stringContaining("out of range") });
    expect(parseCron("@nope").ok).toBe(false);
  });

  it("generates an expression from the preset builder", () => {
    expect(buildCron({ ...DEFAULT_CRON_CONFIG, preset: "every-minute" })).toEqual({ ok: true, value: "* * * * *" });
    expect(buildCron({ ...DEFAULT_CRON_CONFIG, preset: "daily", minute: "0", hour: "9" })).toEqual({
      ok: true,
      value: "0 9 * * *",
    });
    expect(buildCron({ ...DEFAULT_CRON_CONFIG, preset: "weekly", minute: "0", hour: "9", weekdays: [1, 3, 5] })).toEqual({
      ok: true,
      value: "0 9 * * 1,3,5",
    });
    expect(buildCron({ ...DEFAULT_CRON_CONFIG, preset: "weekly", weekdays: [] })).toEqual({ ok: false, error: "Choose at least one weekday." });
    expect(buildCron({ ...DEFAULT_CRON_CONFIG, preset: "custom", custom: "invalid" }).ok).toBe(false);
  });
});
