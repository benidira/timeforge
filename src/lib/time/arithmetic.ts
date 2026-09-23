import { MESSAGES, fail, isInRange, ok, utcFromParts, type Result } from "./core";
import { getZonedParts, wallClockToInstantLenient } from "./zones";

export type AddUnit = "seconds" | "minutes" | "hours" | "days" | "weeks";
export const ADD_UNITS: AddUnit[] = ["seconds", "minutes", "hours", "days", "weeks"];

const FIXED_MS = { seconds: 1000, minutes: 60_000, hours: 3_600_000 } as const;

export const AMOUNT_MESSAGES = {
  invalid: "Please enter a valid number for the duration, for example 90.",
  negative: "Enter a positive duration. Use the Subtract Time calculator to go back in time.",
  whole: "Days and weeks must be whole numbers. Use hours for fractions of a day.",
} as const;

export function parseAmount(raw: string): Result<number> {
  const cleaned = raw.trim().replace(/,/g, "");
  if (!/^[+-]?\d+(\.\d+)?$/.test(cleaned)) return fail(AMOUNT_MESSAGES.invalid);
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return fail(AMOUNT_MESSAGES.invalid);
  if (n < 0) return fail(AMOUNT_MESSAGES.negative);
  return ok(n);
}

export interface ShiftedInstant {
  ms: number;
  /** The result landed in a daylight saving gap and was moved forward. */
  adjusted: boolean;
  ambiguous: boolean;
}

/**
 * Adds (sign = 1) or subtracts (sign = -1) a duration.
 * Seconds, minutes and hours are exact elapsed time. Days and weeks are calendar days in `timeZone`:
 * the clock time is kept, even when a daylight saving change makes the day 23 or 25 hours long.
 */
export function shiftInstant(
  ms: number,
  amount: number,
  unit: AddUnit,
  timeZone: string,
  sign: 1 | -1 = 1,
): Result<ShiftedInstant> {
  if (unit === "days" || unit === "weeks") {
    if (!Number.isInteger(amount)) return fail(AMOUNT_MESSAGES.whole);
    const days = amount * (unit === "weeks" ? 7 : 1) * sign;
    const p = getZonedParts(ms, timeZone);
    const shifted = new Date(utcFromParts(p.year, p.month, p.day + days, p.hour, p.minute, p.second));
    if (!isInRange(shifted.getTime())) return fail(MESSAGES.range);
    const wall = {
      year: shifted.getUTCFullYear(),
      month: shifted.getUTCMonth() + 1,
      day: shifted.getUTCDate(),
      hour: shifted.getUTCHours(),
      minute: shifted.getUTCMinutes(),
      second: shifted.getUTCSeconds(),
    };
    const r = wallClockToInstantLenient(wall, timeZone);
    if (!r.ok) return r;
    const result = r.value.ms + p.millisecond;
    return isInRange(result) ? ok({ ms: result, adjusted: r.value.adjusted, ambiguous: r.value.ambiguous }) : fail(MESSAGES.range);
  }
  const result = Math.round(ms + sign * amount * FIXED_MS[unit]);
  return isInRange(result) ? ok({ ms: result, adjusted: false, ambiguous: false }) : fail(MESSAGES.range);
}
