import {
  MESSAGES,
  daysInMonth,
  fail,
  isInRange,
  ok,
  utcFromParts,
  type Result,
} from "./core";
import { resolveZone, wallClockToInstant } from "./zones";

const ISO_RE =
  /^(\d{4})-(\d{2})-(\d{2})(?:[Tt ](\d{2}):(\d{2})(?::(\d{2})(?:[.,](\d{1,9}))?)?(Z|z|[+-]\d{2}(?::?\d{2})?)?)?$/;

export interface ParsedIso {
  ms: number;
  /** The string carried its own UTC offset (Z counts). */
  hasOffset: boolean;
  /** Offset in minutes when `hasOffset` is true. */
  offsetMinutes: number | null;
  /** True when the input was a date without a time. */
  dateOnly: boolean;
  /** Zone that was assumed when the string had no offset. */
  assumedZone: string | null;
  ambiguous: boolean;
}

/**
 * Parses an extended-format ISO 8601 / RFC 3339 date-time.
 * Strings without an offset are interpreted in `assumedZone` ("UTC", "local" or an IANA zone).
 */
export function parseIso8601(input: string, assumedZone = "UTC"): Result<ParsedIso> {
  const m = ISO_RE.exec(input.trim());
  if (!m) return fail(MESSAGES.iso);

  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const dateOnly = m[4] === undefined;
  const hour = dateOnly ? 0 : Number(m[4]);
  const minute = dateOnly ? 0 : Number(m[5]);
  const second = m[6] === undefined ? 0 : Number(m[6]);
  const millisecond = m[7] === undefined ? 0 : Number(m[7].padEnd(3, "0").slice(0, 3));
  const offsetRaw = m[8];

  if (year < 1) return fail(MESSAGES.range);
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return fail(MESSAGES.iso);
  if (hour > 23 || minute > 59 || second > 59) return fail(MESSAGES.iso);

  if (offsetRaw !== undefined) {
    let offsetMinutes = 0;
    if (offsetRaw.toUpperCase() !== "Z") {
      const om = /^([+-])(\d{2}):?(\d{2})?$/.exec(offsetRaw);
      if (!om) return fail(MESSAGES.iso);
      const oh = Number(om[2]);
      const omin = om[3] === undefined ? 0 : Number(om[3]);
      if (oh > 23 || omin > 59) return fail(MESSAGES.iso);
      offsetMinutes = (om[1] === "-" ? -1 : 1) * (oh * 60 + omin);
    }
    const ms = utcFromParts(year, month, day, hour, minute, second, millisecond) - offsetMinutes * 60_000;
    if (!isInRange(ms)) return fail(MESSAGES.range);
    return ok({ ms, hasOffset: true, offsetMinutes, dateOnly, assumedZone: null, ambiguous: false });
  }

  const zone = resolveZone(assumedZone);
  const zoned = wallClockToInstant({ year, month, day, hour, minute, second }, zone);
  if (!zoned.ok) return zoned;
  const ms = zoned.value.ms + millisecond;
  if (!isInRange(ms)) return fail(MESSAGES.range);
  return ok({
    ms,
    hasOffset: false,
    offsetMinutes: null,
    dateOnly,
    assumedZone: zone,
    ambiguous: zoned.value.ambiguous,
  });
}

export interface DateParts {
  year: number;
  month: number;
  day: number;
}

/** Parses the value of an <input type="date"> ("YYYY-MM-DD"). Checks real calendar dates. */
export function parseDateInput(input: string): Result<DateParts> {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.trim());
  if (!m) return fail(MESSAGES.dateTime);
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (year < 1) return fail(MESSAGES.range);
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return fail(MESSAGES.dateTime);
  return ok({ year, month, day });
}

export interface TimeParts {
  hour: number;
  minute: number;
  second: number;
}

/** Parses the value of an <input type="time"> ("HH:mm" or "HH:mm:ss"). */
export function parseTimeInput(input: string): Result<TimeParts> {
  const m = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(input.trim());
  if (!m) return fail(MESSAGES.dateTime);
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  const second = m[3] === undefined ? 0 : Number(m[3]);
  if (hour > 23 || minute > 59 || second > 59) return fail(MESSAGES.dateTime);
  return ok({ hour, minute, second });
}
