import { describe, expect, it } from "vitest";
import {
  ADD_UNITS,
  AMOUNT_MESSAGES,
  MESSAGES,
  addMonthsClamped,
  calendarDifference,
  parseAmount,
  shiftInstant,
  timeOfDayDuration,
  toIsoUtc,
  wallClockToInstant,
  wallClockToInstantLenient,
  type DateTimeParts,
} from "@/lib/time";

const dt = (year: number, month: number, day: number, hour = 0, minute = 0, second = 0): DateTimeParts => ({
  year, month, day, hour, minute, second,
});

describe("calendarDifference (Date Difference Calculator)", () => {
  it("returns zero for the same date and time", () => {
    const d = calendarDifference(dt(2026, 9, 21, 10), dt(2026, 9, 21, 10));
    expect(d).toMatchObject({ reversed: false, years: 0, months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
    expect(d.human).toBe("0 seconds");
    expect(d.totals.days).toBe("0");
  });

  it("counts a leap day: 2024-02-28 to 2024-03-01 is 2 days, 2023 is 1 day", () => {
    expect(calendarDifference(dt(2024, 2, 28), dt(2024, 3, 1)).days).toBe(2);
    expect(calendarDifference(dt(2023, 2, 28), dt(2023, 3, 1)).days).toBe(1);
    // 2024-02-29 + 12 clamped months lands exactly on 2025-02-28, so that IS a whole year.
    expect(calendarDifference(dt(2024, 2, 29), dt(2025, 2, 28))).toMatchObject({ years: 1, months: 0, days: 0 });
    expect(calendarDifference(dt(2024, 2, 29), dt(2025, 3, 1))).toMatchObject({ years: 1, months: 0, days: 1 });
  });

  it("handles whole years across leap years", () => {
    const d = calendarDifference(dt(2020, 1, 1), dt(2024, 1, 1));
    expect(d).toMatchObject({ years: 4, months: 0, days: 0 });
    expect(d.totals.days).toBe("1461");
  });

  it("crosses a month boundary with different month lengths", () => {
    const d = calendarDifference(dt(2026, 1, 31), dt(2026, 3, 1));
    expect(d).toMatchObject({ years: 0, months: 1, weeks: 0, days: 1 });
    expect(d.totals.days).toBe("29");
    expect(calendarDifference(dt(2026, 3, 15), dt(2026, 4, 14))).toMatchObject({ months: 0, weeks: 4, days: 2 });
  });

  it("crosses a year boundary", () => {
    const d = calendarDifference(dt(2025, 12, 31, 23, 59, 59), dt(2026, 1, 1, 0, 0, 0));
    expect(d).toMatchObject({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 1 });
    expect(calendarDifference(dt(2025, 11, 15), dt(2026, 2, 20))).toMatchObject({ years: 0, months: 3, weeks: 0, days: 5 });
  });

  it("is symmetric and flags reversed order", () => {
    const forward = calendarDifference(dt(2026, 1, 1), dt(2026, 9, 21, 12, 30, 15));
    const backward = calendarDifference(dt(2026, 9, 21, 12, 30, 15), dt(2026, 1, 1));
    expect(forward.reversed).toBe(false);
    expect(backward.reversed).toBe(true);
    expect({ ...backward, reversed: false }).toEqual(forward);
    expect(forward).toMatchObject({ months: 8, weeks: 2, days: 6, hours: 12, minutes: 30, seconds: 15 });
  });

  it("reports totals in every unit", () => {
    const d = calendarDifference(dt(2026, 1, 1), dt(2026, 1, 2, 6));
    expect(d.totals).toEqual({ weeks: "0.1786", days: "1.25", hours: "30", minutes: "1800", seconds: "108000" });
    expect(d.human).toBe("1 day 6 hours");
  });

  it("clamps the day when adding months", () => {
    expect(addMonthsClamped(dt(2026, 1, 31), 1)).toMatchObject({ month: 2, day: 28 });
    expect(addMonthsClamped(dt(2024, 1, 31), 1)).toMatchObject({ month: 2, day: 29 });
    expect(addMonthsClamped(dt(2026, 11, 30), 3)).toMatchObject({ year: 2027, month: 2, day: 28 });
  });
});

describe("timeOfDayDuration (Time Duration Calculator)", () => {
  const t = (hour: number, minute = 0, second = 0) => ({ hour, minute, second });

  it("same day", () => {
    const d = timeOfDayDuration(t(9), t(17, 30));
    expect(d.human).toBe("8 hours 30 minutes");
    expect(d.totals).toMatchObject({ seconds: "30600", minutes: "510", hours: "8.5" });
    expect(d.crossedMidnight).toBe(false);
  });

  it("midnight crossing: 23:30 to 01:15 is 1 hour 45 minutes", () => {
    const d = timeOfDayDuration(t(23, 30), t(1, 15));
    expect(d.human).toBe("1 hour 45 minutes");
    expect(d.crossedMidnight).toBe(true);
    expect(d.totals.minutes).toBe("105");
  });

  it("equal times are zero, or 24 hours with one extra day", () => {
    expect(timeOfDayDuration(t(9), t(9)).human).toBe("0 seconds");
    const day = timeOfDayDuration(t(9), t(9), 1);
    expect(day.human).toBe("1 day");
    expect(day.totals.hours).toBe("24");
    expect(day.totals.days).toBe("1");
  });

  it("multiple days", () => {
    const d = timeOfDayDuration(t(22), t(6), 2);
    expect(d.human).toBe("2 days 8 hours");
    expect(d.totals.hours).toBe("56");
  });

  it("includes seconds and ignores negative extra days", () => {
    expect(timeOfDayDuration(t(0, 0, 10), t(0, 1, 5)).human).toBe("55 seconds");
    expect(timeOfDayDuration(t(1), t(2), -3).human).toBe("1 hour");
  });
});

describe("shiftInstant (Add / Subtract Time)", () => {
  const start = Date.UTC(2026, 8, 21, 12, 0, 0);

  it("adds and subtracts exact elapsed time for seconds, minutes and hours", () => {
    const add = shiftInstant(start, 90, "minutes", "UTC");
    expect(add.ok && toIsoUtc(add.value.ms)).toBe("2026-09-21T13:30:00.000Z");
    const sub = shiftInstant(start, 36, "hours", "UTC", -1);
    expect(sub.ok && toIsoUtc(sub.value.ms)).toBe("2026-09-20T00:00:00.000Z");
    const sec = shiftInstant(start, 1.5, "seconds", "UTC");
    expect(sec.ok && sec.value.ms - start).toBe(1500);
  });

  it("adds weeks and days across month and year ends, including leap days", () => {
    const w = shiftInstant(Date.UTC(2024, 1, 22, 8), 1, "weeks", "UTC");
    expect(w.ok && toIsoUtc(w.value.ms)).toBe("2024-02-29T08:00:00.000Z");
    const y = shiftInstant(Date.UTC(2025, 11, 31, 23, 59), 1, "days", "UTC");
    expect(y.ok && toIsoUtc(y.value.ms)).toBe("2026-01-01T23:59:00.000Z");
    const back = shiftInstant(Date.UTC(2026, 2, 1), 1, "days", "UTC", -1);
    expect(back.ok && toIsoUtc(back.value.ms)).toBe("2026-02-28T00:00:00.000Z");
  });

  it("keeps the clock time across a daylight saving change when adding days", () => {
    const noon = wallClockToInstant({ year: 2026, month: 3, day: 7, hour: 12, minute: 0, second: 0 }, "America/New_York");
    if (!noon.ok) throw new Error("setup");
    const next = shiftInstant(noon.value.ms, 1, "days", "America/New_York");
    // 12:00 EST on 7 March is 17:00Z; 12:00 EDT on 8 March is 16:00Z (only 23 hours later)
    expect(next.ok && toIsoUtc(next.value.ms)).toBe("2026-03-08T16:00:00.000Z");
    const elapsed = shiftInstant(noon.value.ms, 24, "hours", "America/New_York");
    expect(elapsed.ok && toIsoUtc(elapsed.value.ms)).toBe("2026-03-08T17:00:00.000Z");
  });

  it("moves a nonexistent local time forward and reports it", () => {
    const start = wallClockToInstant({ year: 2026, month: 3, day: 7, hour: 2, minute: 30, second: 0 }, "America/New_York");
    if (!start.ok) throw new Error("setup");
    const r = shiftInstant(start.value.ms, 1, "days", "America/New_York");
    expect(r.ok && r.value.adjusted).toBe(true);
    expect(r.ok && toIsoUtc(r.value.ms)).toBe("2026-03-08T07:30:00.000Z"); // 03:30 EDT
  });

  it("rejects fractional days and results outside the supported range", () => {
    expect(shiftInstant(start, 1.5, "days", "UTC")).toEqual({ ok: false, error: AMOUNT_MESSAGES.whole });
    expect(shiftInstant(start, 8000 * 366, "days", "UTC")).toEqual({ ok: false, error: MESSAGES.range });
    expect(shiftInstant(Date.UTC(9999, 11, 31), 1, "days", "UTC")).toEqual({ ok: false, error: MESSAGES.range });
  });

  it("parses amounts politely", () => {
    expect(parseAmount("90")).toEqual({ ok: true, value: 90 });
    expect(parseAmount(" 1,500 ")).toEqual({ ok: true, value: 1500 });
    expect(parseAmount("abc")).toEqual({ ok: false, error: AMOUNT_MESSAGES.invalid });
    expect(parseAmount("")).toEqual({ ok: false, error: AMOUNT_MESSAGES.invalid });
    expect(parseAmount("-5")).toEqual({ ok: false, error: AMOUNT_MESSAGES.negative });
    expect(ADD_UNITS).toEqual(["seconds", "minutes", "hours", "days", "weeks"]);
  });
});

describe("wallClockToInstantLenient", () => {
  it("returns strict results unchanged and only adjusts gaps", () => {
    const ok = wallClockToInstantLenient({ year: 2026, month: 9, day: 21, hour: 10, minute: 0, second: 0 }, "Europe/Paris");
    expect(ok).toMatchObject({ ok: true, value: { adjusted: false } });
    const gap = wallClockToInstantLenient({ year: 2026, month: 3, day: 29, hour: 2, minute: 30, second: 0 }, "Europe/Paris");
    expect(gap.ok && toIsoUtc(gap.value.ms)).toBe("2026-03-29T01:30:00.000Z"); // 03:30 CEST
    expect(gap.ok && gap.value.adjusted).toBe(true);
    expect(wallClockToInstantLenient({ year: 2026, month: 9, day: 21, hour: 10, minute: 0, second: 0 }, "Nope/Zone")).toEqual({
      ok: false,
      error: MESSAGES.timezone,
    });
  });
});
