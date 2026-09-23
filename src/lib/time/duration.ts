import { formatNumber } from "./format";

export interface DurationParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

export function splitDuration(absMs: number): DurationParts {
  let rest = Math.abs(Math.round(absMs));
  const days = Math.floor(rest / 86_400_000);
  rest -= days * 86_400_000;
  const hours = Math.floor(rest / 3_600_000);
  rest -= hours * 3_600_000;
  const minutes = Math.floor(rest / 60_000);
  rest -= minutes * 60_000;
  const seconds = Math.floor(rest / 1000);
  const milliseconds = rest - seconds * 1000;
  return { days, hours, minutes, seconds, milliseconds };
}

function plural(n: number, unit: string): string {
  return `${n} ${unit}${n === 1 ? "" : "s"}`;
}

/** "2 days 4 hours 12 minutes 30 seconds". Zero parts are skipped; zero total is "0 seconds". */
export function humanDuration(absMs: number): string {
  const p = splitDuration(absMs);
  const out: string[] = [];
  if (p.days) out.push(plural(p.days, "day"));
  if (p.hours) out.push(plural(p.hours, "hour"));
  if (p.minutes) out.push(plural(p.minutes, "minute"));
  if (p.seconds) out.push(plural(p.seconds, "second"));
  if (p.milliseconds) out.push(plural(p.milliseconds, "millisecond"));
  return out.length ? out.join(" ") : "0 seconds";
}

export interface TimestampDifference {
  /** B minus A in milliseconds (negative when B is earlier). */
  signedMs: number;
  absMs: number;
  direction: "after" | "before" | "same";
  totals: {
    milliseconds: string;
    seconds: string;
    minutes: string;
    hours: string;
    days: string;
  };
  human: string;
}

export function diffTimestamps(aMs: number, bMs: number): TimestampDifference {
  const signedMs = bMs - aMs;
  const absMs = Math.abs(signedMs);
  return {
    signedMs,
    absMs,
    direction: signedMs > 0 ? "after" : signedMs < 0 ? "before" : "same",
    totals: {
      milliseconds: formatNumber(absMs, 0),
      seconds: formatNumber(absMs / 1000, 3),
      minutes: formatNumber(absMs / 60_000, 6),
      hours: formatNumber(absMs / 3_600_000, 6),
      days: formatNumber(absMs / 86_400_000, 6),
    },
    human: humanDuration(absMs),
  };
}

export interface TimeOfDayParts {
  hour: number;
  minute: number;
  second: number;
}

export interface TimeOfDayDuration {
  ms: number;
  crossedMidnight: boolean;
  totals: { seconds: string; minutes: string; hours: string; days: string };
  human: string;
}

/**
 * Elapsed time from one clock time to another. When the end is earlier than the start the
 * end is on the next day (23:30 to 01:15 is 1 hour 45 minutes). `extraDays` adds whole days.
 * Equal times are 0 unless `extraDays` is set (09:00 to 09:00 with 1 extra day is 24 hours).
 */
export function timeOfDayDuration(start: TimeOfDayParts, end: TimeOfDayParts, extraDays = 0): TimeOfDayDuration {
  const toMs = (t: TimeOfDayParts) => ((t.hour * 60 + t.minute) * 60 + t.second) * 1000;
  let ms = toMs(end) - toMs(start);
  const crossedMidnight = ms < 0;
  if (crossedMidnight) ms += 86_400_000;
  ms += Math.max(0, Math.floor(extraDays)) * 86_400_000;
  return {
    ms,
    crossedMidnight,
    totals: {
      seconds: formatNumber(ms / 1000, 0),
      minutes: formatNumber(ms / 60_000, 4),
      hours: formatNumber(ms / 3_600_000, 4),
      days: formatNumber(ms / 86_400_000, 6),
    },
    human: humanDuration(ms),
  };
}
