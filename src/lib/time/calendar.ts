import { DAY_MS, MESSAGES, daysInMonth, fail, ok, pad, utcFromParts, type Result } from "./core";
import { formatNumber } from "./format";

export interface DateTimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export function partsToUtcMs(p: DateTimeParts): number {
  return utcFromParts(p.year, p.month, p.day, p.hour, p.minute, p.second);
}

export function utcMsToParts(ms: number): DateTimeParts {
  const d = new Date(ms);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
    second: d.getUTCSeconds(),
  };
}

/** Adds calendar months; a day that does not exist in the target month is clamped (Jan 31 + 1 month = Feb 28/29). */
export function addMonthsClamped(p: DateTimeParts, months: number): DateTimeParts {
  const index = p.year * 12 + (p.month - 1) + months;
  const year = Math.floor(index / 12);
  const month = (index % 12) + 1;
  return { ...p, year, month, day: Math.min(p.day, daysInMonth(year, month)) };
}

export interface CalendarDifference {
  /** True when the end is before the start. The breakdown is always positive. */
  reversed: boolean;
  years: number;
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totals: { weeks: string; days: string; hours: string; minutes: string; seconds: string };
  human: string;
}

function plural(n: number, unit: string): string {
  return `${n} ${unit}${n === 1 ? "" : "s"}`;
}

/**
 * Calendar difference between two clock readings (no time zone, so daylight saving changes are not counted).
 * Whole months are taken first (with day clamping), then the remaining days, hours, minutes and seconds.
 */
export function calendarDifference(a: DateTimeParts, b: DateTimeParts): CalendarDifference {
  const reversed = partsToUtcMs(b) < partsToUtcMs(a);
  const start = reversed ? b : a;
  const end = reversed ? a : b;
  const startMs = partsToUtcMs(start);
  const endMs = partsToUtcMs(end);

  let months = (end.year - start.year) * 12 + (end.month - start.month);
  if (partsToUtcMs(addMonthsClamped(start, months)) > endMs) months -= 1;
  const anchorMs = partsToUtcMs(addMonthsClamped(start, months));

  let rest = endMs - anchorMs;
  const daysTotalRest = Math.floor(rest / DAY_MS);
  rest -= daysTotalRest * DAY_MS;
  const hours = Math.floor(rest / 3_600_000);
  rest -= hours * 3_600_000;
  const minutes = Math.floor(rest / 60_000);
  const seconds = Math.floor((rest - minutes * 60_000) / 1000);

  const years = Math.floor(months / 12);
  const monthsPart = months % 12;
  const weeks = Math.floor(daysTotalRest / 7);
  const days = daysTotalRest % 7;

  const total = endMs - startMs;
  const pieces: string[] = [];
  if (years) pieces.push(plural(years, "year"));
  if (monthsPart) pieces.push(plural(monthsPart, "month"));
  if (weeks) pieces.push(plural(weeks, "week"));
  if (days) pieces.push(plural(days, "day"));
  if (hours) pieces.push(plural(hours, "hour"));
  if (minutes) pieces.push(plural(minutes, "minute"));
  if (seconds) pieces.push(plural(seconds, "second"));

  return {
    reversed,
    years,
    months: monthsPart,
    weeks,
    days,
    hours,
    minutes,
    seconds,
    totals: {
      weeks: formatNumber(total / (7 * DAY_MS), 4),
      days: formatNumber(total / DAY_MS, 4),
      hours: formatNumber(total / 3_600_000, 4),
      minutes: formatNumber(total / 60_000, 2),
      seconds: formatNumber(total / 1000, 0),
    },
    human: pieces.length ? pieces.join(" ") : "0 seconds",
  };
}

export function formatDateTimeParts(p: DateTimeParts): string {
  return `${pad(p.year, 4)}-${pad(p.month)}-${pad(p.day)} ${pad(p.hour)}:${pad(p.minute)}:${pad(p.second)}`;
}

export function checkYearRange(p: { year: number }): Result<true> {
  return p.year >= 1 && p.year <= 9999 ? ok(true) : fail(MESSAGES.range);
}
