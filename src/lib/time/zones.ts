import { DAY_MS, MESSAGES, fail, isInRange, ok, utcFromParts, type Result } from "./core";

export const LOCAL_ZONE = "local";

/** Curated zones shown first in every time zone picker. */
export const COMMON_TIME_ZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Africa/Algiers",
  "Africa/Cairo",
  "Africa/Lagos",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
] as const;

export const DEFAULT_COMPARE_ZONES = [
  "UTC",
  "America/New_York",
  "Europe/London",
  "Europe/Paris",
  "Asia/Dubai",
  "Asia/Tokyo",
  "Africa/Algiers",
];

const LOCALE = "en-US-u-ca-gregory-nu-latn";

const partsFormatters = new Map<string, Intl.DateTimeFormat>();

function getPartsFormatter(timeZone: string): Intl.DateTimeFormat {
  let f = partsFormatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat(LOCALE, {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    partsFormatters.set(timeZone, f);
  }
  return f;
}

export function isValidTimeZone(timeZone: string): boolean {
  if (!timeZone) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function getLocalTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/** Turns the "local" sentinel into the browser's IANA zone. */
export function resolveZone(zone: string): string {
  return zone === LOCAL_ZONE ? getLocalTimeZone() : zone;
}

export interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}

export function getZonedParts(ms: number, timeZone: string): ZonedParts {
  const parts = getPartsFormatter(timeZone).formatToParts(new Date(ms));
  const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour") % 24,
    minute: get("minute"),
    second: get("second"),
    millisecond: ((ms % 1000) + 1000) % 1000,
  };
}

/** UTC offset of `timeZone` at the instant `ms`, in milliseconds (east of UTC is positive). */
export function getOffsetMs(ms: number, timeZone: string): number {
  if (timeZone === "UTC") return 0;
  const p = getZonedParts(ms, timeZone);
  const asUtc = utcFromParts(p.year, p.month, p.day, p.hour, p.minute, p.second);
  const flooredMs = ms - (((ms % 1000) + 1000) % 1000);
  return asUtc - flooredMs;
}

export interface WallClock {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export interface ZonedInstant {
  ms: number;
  /** True when the wall-clock time happens twice (clocks go back). The earlier moment is used. */
  ambiguous: boolean;
}

function sameWallClock(p: ZonedParts, w: WallClock): boolean {
  return (
    p.year === w.year &&
    p.month === w.month &&
    p.day === w.day &&
    p.hour === w.hour &&
    p.minute === w.minute &&
    p.second === w.second
  );
}

/**
 * Converts a wall-clock date and time in an IANA time zone to an instant.
 * Handles daylight saving time: times that do not exist return an error and times that
 * happen twice resolve to the earlier occurrence (flagged as `ambiguous`).
 */
export function wallClockToInstant(w: WallClock, timeZone: string): Result<ZonedInstant> {
  if (!isValidTimeZone(timeZone)) return fail(MESSAGES.timezone);
  if (w.year < 1 || w.year > 9999) return fail(MESSAGES.range);

  const guess = utcFromParts(w.year, w.month, w.day, w.hour, w.minute, w.second);
  if (timeZone === "UTC") {
    return isInRange(guess) ? ok({ ms: guess, ambiguous: false }) : fail(MESSAGES.range);
  }

  const before = getOffsetMs(guess - DAY_MS, timeZone);
  const after = getOffsetMs(guess + DAY_MS, timeZone);
  const candidates = Array.from(new Set([guess - before, guess - after])).sort((a, b) => a - b);
  const valid = candidates.filter((c) => sameWallClock(getZonedParts(c, timeZone), w));

  if (valid.length === 0) return fail(MESSAGES.nonexistent);
  const ms = valid[0];
  if (!isInRange(ms)) return fail(MESSAGES.range);
  return ok({ ms, ambiguous: valid.length > 1 });
}

export function getAllTimeZones(): string[] {
  try {
    if (typeof Intl.supportedValuesOf === "function") {
      const zones = Intl.supportedValuesOf("timeZone");
      if (zones.length > 0) return zones.includes("UTC") ? zones : ["UTC", ...zones];
    }
  } catch {
    /* fall through to the curated list */
  }
  return [...COMMON_TIME_ZONES];
}

/** "America/New_York" -> "New York". "UTC" stays "UTC". */
export function zoneLabel(timeZone: string): string {
  if (timeZone === "UTC") return "UTC";
  if (timeZone === "America/St_Johns") return "St. John's";
  const city = timeZone.split("/").pop() ?? timeZone;
  return city.replace(/_/g, " ");
}

/** Short zone name such as "EDT", "GMT+1" or "UTC". */
export function zoneAbbreviation(ms: number, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "short" }).formatToParts(new Date(ms));
  return parts.find((p) => p.type === "timeZoneName")?.value ?? timeZone;
}

/**
 * Like `wallClockToInstant`, but a clock time that does not exist (daylight saving gap) is moved
 * forward by the size of the gap instead of failing, the way calendar apps do.
 */
export function wallClockToInstantLenient(
  w: WallClock,
  timeZone: string,
): Result<ZonedInstant & { adjusted: boolean }> {
  const strict = wallClockToInstant(w, timeZone);
  if (strict.ok) return ok({ ...strict.value, adjusted: false });
  if (strict.error !== MESSAGES.nonexistent) return strict;
  const guess = utcFromParts(w.year, w.month, w.day, w.hour, w.minute, w.second);
  const ms = guess - getOffsetMs(guess - DAY_MS, timeZone);
  return isInRange(ms) ? ok({ ms, ambiguous: false, adjusted: true }) : fail(MESSAGES.range);
}

const longNameFormatters = new Map<string, Intl.DateTimeFormat>();

/** "Eastern Time", "Newfoundland Time", "Japan Standard Time": used to make zone search friendlier. */
export function zoneLongName(timeZone: string, ms = Date.UTC(2026, 0, 15)): string {
  let f = longNameFormatters.get(timeZone);
  if (!f) {
    try {
      f = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longGeneric" });
    } catch {
      f = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "long" });
    }
    longNameFormatters.set(timeZone, f);
  }
  return f.formatToParts(new Date(ms)).find((p) => p.type === "timeZoneName")?.value ?? "";
}
