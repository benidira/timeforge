import { afterEach, describe, expect, it } from "vitest";
import {
  COMMON_TIME_ZONES,
  DEFAULT_COMPARE_ZONES,
  MESSAGES,
  formatCompact,
  formatLong,
  formatOffset,
  formatOffsetLabel,
  getAllTimeZones,
  getLocalTimeZone,
  getOffsetMs,
  isValidTimeZone,
  relativeTime,
  resolveZone,
  toIsoOffset,
  toIsoUtc,
  wallClockToInstant,
  zoneAbbreviation,
  zoneLabel,
} from "@/lib/time";

const HOUR = 3_600_000;
const wc = (year: number, month: number, day: number, hour = 0, minute = 0, second = 0) => ({
  year,
  month,
  day,
  hour,
  minute,
  second,
});

describe("time zone offsets", () => {
  it("knows daylight saving offsets", () => {
    expect(getOffsetMs(Date.UTC(2026, 0, 15), "America/New_York")).toBe(-5 * HOUR);
    expect(getOffsetMs(Date.UTC(2026, 6, 15), "America/New_York")).toBe(-4 * HOUR);
    expect(getOffsetMs(Date.UTC(2026, 6, 15), "Europe/London")).toBe(1 * HOUR);
    expect(getOffsetMs(Date.UTC(2026, 0, 15), "Europe/London")).toBe(0);
  });

  it("handles zones without daylight saving and with unusual offsets", () => {
    expect(getOffsetMs(Date.UTC(2026, 0, 15), "Africa/Algiers")).toBe(1 * HOUR);
    expect(getOffsetMs(Date.UTC(2026, 6, 15), "Africa/Algiers")).toBe(1 * HOUR);
    expect(getOffsetMs(Date.UTC(2026, 6, 15), "Asia/Kolkata")).toBe(5.5 * HOUR);
    expect(getOffsetMs(Date.UTC(2026, 6, 15), "Asia/Kathmandu")).toBe(5.75 * HOUR);
    expect(getOffsetMs(Date.UTC(2026, 6, 15), "Asia/Dubai")).toBe(4 * HOUR);
    expect(getOffsetMs(Date.UTC(2026, 6, 15), "UTC")).toBe(0);
  });

  it("works for negative timestamps and milliseconds", () => {
    expect(getOffsetMs(-1000, "America/New_York")).toBe(-5 * HOUR);
    expect(getOffsetMs(1790000000123, "Asia/Tokyo")).toBe(9 * HOUR);
  });

  it("validates zone names", () => {
    expect(isValidTimeZone("America/New_York")).toBe(true);
    expect(isValidTimeZone("UTC")).toBe(true);
    expect(isValidTimeZone("Mars/Olympus")).toBe(false);
    expect(isValidTimeZone("")).toBe(false);
  });

  it("lists zones, with the common ones valid and UTC first", () => {
    const all = getAllTimeZones();
    expect(all.length).toBeGreaterThan(100);
    expect(all[0]).toBe("UTC");
    for (const z of [...COMMON_TIME_ZONES, ...DEFAULT_COMPARE_ZONES]) expect(isValidTimeZone(z)).toBe(true);
  });

  it("labels zones", () => {
    expect(zoneLabel("America/New_York")).toBe("New York");
    expect(zoneLabel("Africa/Algiers")).toBe("Algiers");
    expect(zoneLabel("UTC")).toBe("UTC");
    expect(zoneAbbreviation(Date.UTC(2026, 6, 15), "America/New_York")).toBe("EDT");
  });
});

describe("local time zone", () => {
  const original = process.env.TZ;
  afterEach(() => {
    process.env.TZ = original;
  });

  it("uses the test machine's zone (America/New_York) and resolves the 'local' sentinel", () => {
    expect(getLocalTimeZone()).toBe("America/New_York");
    expect(resolveZone("local")).toBe("America/New_York");
    expect(resolveZone("Asia/Tokyo")).toBe("Asia/Tokyo");
  });

  it("follows a changed local zone", () => {
    process.env.TZ = "Asia/Tokyo";
    expect(getLocalTimeZone()).toBe("Asia/Tokyo");
    expect(formatCompact(0, getLocalTimeZone())).toBe("1970-01-01 09:00:00");
  });
});

describe("wallClockToInstant", () => {
  it("converts simple cases", () => {
    expect(wallClockToInstant(wc(2026, 9, 20, 12), "UTC")).toEqual({ ok: true, value: { ms: Date.UTC(2026, 8, 20, 12), ambiguous: false } });
    expect(wallClockToInstant(wc(2026, 9, 20, 12), "Asia/Tokyo")).toEqual({ ok: true, value: { ms: Date.UTC(2026, 8, 20, 3), ambiguous: false } });
    expect(wallClockToInstant(wc(2026, 9, 20, 12), "Asia/Kolkata")).toEqual({ ok: true, value: { ms: Date.UTC(2026, 8, 20, 6, 30), ambiguous: false } });
    expect(wallClockToInstant(wc(2026, 9, 20, 12), "America/New_York")).toEqual({ ok: true, value: { ms: Date.UTC(2026, 8, 20, 16), ambiguous: false } });
  });

  it("rejects times that do not exist (spring forward)", () => {
    expect(wallClockToInstant(wc(2026, 3, 8, 2, 30), "America/New_York")).toEqual({ ok: false, error: MESSAGES.nonexistent });
    expect(wallClockToInstant(wc(2026, 3, 29, 1, 30), "Europe/London")).toEqual({ ok: false, error: MESSAGES.nonexistent });
    expect(wallClockToInstant(wc(2026, 3, 8, 3, 30), "America/New_York")).toEqual({ ok: true, value: { ms: Date.UTC(2026, 2, 8, 7, 30), ambiguous: false } });
    expect(wallClockToInstant(wc(2026, 3, 8, 1, 59, 59), "America/New_York")).toEqual({ ok: true, value: { ms: Date.UTC(2026, 2, 8, 6, 59, 59), ambiguous: false } });
  });

  it("uses the first occurrence for times that happen twice (fall back)", () => {
    expect(wallClockToInstant(wc(2026, 11, 1, 1, 30), "America/New_York")).toEqual({ ok: true, value: { ms: Date.UTC(2026, 10, 1, 5, 30), ambiguous: true } });
    expect(wallClockToInstant(wc(2026, 11, 1, 2, 30), "America/New_York")).toEqual({ ok: true, value: { ms: Date.UTC(2026, 10, 1, 7, 30), ambiguous: false } });
    expect(wallClockToInstant(wc(2026, 10, 25, 1, 30), "Europe/London")).toEqual({ ok: true, value: { ms: Date.UTC(2026, 9, 25, 0, 30), ambiguous: true } });
  });

  it("rejects invalid zones and out-of-range years", () => {
    expect(wallClockToInstant(wc(2026, 9, 20), "Mars/Olympus")).toEqual({ ok: false, error: MESSAGES.timezone });
    expect(wallClockToInstant(wc(10000, 1, 1), "UTC")).toEqual({ ok: false, error: MESSAGES.range });
    expect(wallClockToInstant(wc(0, 1, 1), "UTC")).toEqual({ ok: false, error: MESSAGES.range });
  });

  it("round-trips wall-clock times across many zones and dates", () => {
    for (const zone of ["America/New_York", "Europe/Paris", "Asia/Kolkata", "Australia/Sydney", "Africa/Algiers", "Pacific/Auckland"]) {
      for (const ms of [Date.UTC(2026, 0, 15, 12), Date.UTC(2026, 6, 15, 12), Date.UTC(1999, 11, 31, 23, 59, 59), -1_000_000_000]) {
        const local = formatCompact(ms, zone);
        const [date, time] = local.split(" ");
        const [y, mo, d] = date.split("-").map(Number);
        const [h, mi, s] = time.split(":").map(Number);
        const r = wallClockToInstant(wc(y, mo, d, h, mi, s), zone);
        expect(r.ok && r.value.ms).toBe(ms);
      }
    }
  });
});

describe("formatting", () => {
  const ms = 1790000000123;

  it("formats compact times in any zone, with and without milliseconds", () => {
    expect(formatCompact(ms, "UTC", { withMs: true })).toBe("2026-09-21 14:13:20.123");
    expect(formatCompact(ms, "UTC")).toBe("2026-09-21 14:13:20");
    expect(formatCompact(ms, "America/New_York")).toBe("2026-09-21 10:13:20");
    expect(formatCompact(-1000, "America/New_York")).toBe("1969-12-31 18:59:59");
    expect(formatCompact(0, "UTC")).toBe("1970-01-01 00:00:00");
    expect(formatCompact(Date.UTC(2026, 0, 1, 0, 0, 0), "UTC")).toBe("2026-01-01 00:00:00");
  });

  it("formats long dates", () => {
    expect(formatLong(1790000000000, "UTC")).toContain("Monday, September 21, 2026");
    expect(formatLong(1790000000000, "UTC")).toContain("2:13:20 PM");
    expect(formatLong(ms, "UTC", { withMs: true })).toContain(":20.123");
    expect(formatLong(ms, "UTC")).toMatch(/UTC$/);
  });

  it("formats ISO 8601 with offsets", () => {
    expect(toIsoUtc(ms)).toBe("2026-09-21T14:13:20.123Z");
    expect(toIsoOffset(ms, "UTC")).toBe("2026-09-21T14:13:20.123Z");
    expect(toIsoOffset(ms, "Asia/Tokyo")).toBe("2026-09-21T23:13:20.123+09:00");
    expect(toIsoOffset(ms, "America/New_York")).toBe("2026-09-21T10:13:20.123-04:00");
    expect(toIsoOffset(ms, "Asia/Kolkata")).toBe("2026-09-21T19:43:20.123+05:30");
    expect(toIsoOffset(ms, "Asia/Kathmandu")).toBe("2026-09-21T19:58:20.123+05:45");
    expect(toIsoOffset(ms, "Africa/Algiers")).toBe("2026-09-21T15:13:20.123+01:00");
  });

  it("formats offsets", () => {
    expect(formatOffset(-4 * HOUR)).toBe("-04:00");
    expect(formatOffset(5.75 * HOUR)).toBe("+05:45");
    expect(formatOffset(0)).toBe("+00:00");
    expect(formatOffsetLabel(0)).toBe("UTC");
    expect(formatOffsetLabel(HOUR)).toBe("UTC+01:00");
  });

  it("formats the earliest supported year", () => {
    expect(toIsoUtc(-62135596800000)).toBe("0001-01-01T00:00:00.000Z");
    expect(formatCompact(-62135596800000, "UTC")).toBe("0001-01-01 00:00:00");
  });

  it("describes relative time", () => {
    const now = 1_790_000_000_000;
    expect(relativeTime(now, now)).toBe("now");
    expect(relativeTime(now + 3 * 86_400_000, now)).toBe("in 3 days");
    expect(relativeTime(now - 5 * 60_000, now)).toBe("5 minutes ago");
    expect(relativeTime(now - 2 * 3_600_000, now)).toBe("2 hours ago");
    expect(relativeTime(now + 400 * 86_400_000, now)).toBe("next year");
  });
});
