/** Shared primitives for the time library. Everything here is pure and runs in the browser. */

/** 0001-01-01T00:00:00.000Z */
export const MIN_MS = -62135596800000;
/** 9999-12-31T23:59:59.999Z */
export const MAX_MS = 253402300799999;

export const DAY_MS = 86_400_000;

export const MESSAGES = {
  timestamp: "Please enter a valid Unix timestamp.",
  dateTime: "Please enter a valid date and time.",
  range: "The timestamp is outside the supported date range.",
  iso: "Please enter a valid ISO 8601 date and time, for example 2026-09-20T12:30:00Z.",
  timezone: "Please select a valid time zone.",
  nonexistent:
    "That local time does not exist in the selected time zone because clocks skip forward at that moment (daylight saving time).",
  tooManyDigits:
    "This value has too many digits for seconds or milliseconds. It may be in microseconds or nanoseconds: divide it by 1,000 or 1,000,000 to get milliseconds.",
} as const;

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function fail(error: string): Result<never> {
  return { ok: false, error };
}

export function isInRange(ms: number): boolean {
  return Number.isFinite(ms) && ms >= MIN_MS && ms <= MAX_MS;
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

/**
 * Milliseconds since the epoch for a UTC calendar date.
 * Unlike `Date.UTC`, years 0-99 are NOT mapped to 1900-1999.
 */
export function utcFromParts(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0,
): number {
  const d = new Date(0);
  d.setUTCFullYear(year, month - 1, day);
  d.setUTCHours(hour, minute, second, millisecond);
  return d.getTime();
}

/** Avoids returning -0. */
export function normalizeZero(n: number): number {
  return n === 0 ? 0 : n;
}

export function pad(n: number, width = 2): string {
  return String(Math.abs(n)).padStart(width, "0");
}
