import { DAY_MS, MESSAGES, fail, ok, pad, type Result } from "./core";
import { getOffsetMs, getZonedParts, wallClockToInstantLenient } from "./zones";
import { parseTimeInput } from "./iso";
import { formatOffsetShort } from "./format";

export interface HoursEntry {
  zone: string;
  /** "HH:mm" */
  start: string;
  end: string;
}

export interface BusinessRow {
  zone: string;
  startMs: number;
  endMs: number;
  /** Local hours in the row's own zone, e.g. "09:00\u201317:00". */
  local: string;
  /** Same window in the reference (first) zone, e.g. "09:00\u201317:00 (+1 day)". */
  inReference: string;
  offset: string;
}

export interface BusinessHoursResult {
  reference: string;
  rows: BusinessRow[];
  /** Overlap of all windows, or null. */
  overlap: { startMs: number; endMs: number; perZone: { zone: string; text: string }[]; minutes: number } | null;
  axis: { startMs: number; endMs: number };
}

export const BUSINESS_MESSAGES = {
  same: "Start and end time must be different. Use an end time later or earlier than the start (overnight shifts are allowed).",
  few: "Add at least two time zones to compare working hours.",
} as const;

/** "09:00\u201317:00", with "(+1 day)" or "(-1 day)" when the local date differs from `date` in that zone. */
export function formatWindow(startMs: number, endMs: number, zone: string, date: { year: number; month: number; day: number }): string {
  const s = getZonedParts(startMs, zone);
  const e = getZonedParts(endMs, zone);
  const dayIndex = (p: { year: number; month: number; day: number }) => Date.UTC(p.year, p.month - 1, p.day) / DAY_MS;
  const base = dayIndex(date);
  const mark = (p: typeof s) => {
    const d = dayIndex(p) - base;
    return d === 0 ? "" : ` (${d > 0 ? "+" : ""}${d} day${Math.abs(d) === 1 ? "" : "s"})`;
  };
  return `${pad(s.hour)}:${pad(s.minute)}${mark(s)}\u2013${pad(e.hour)}:${pad(e.minute)}${mark(e)}`;
}

/**
 * Working hours on the calendar `date` in each zone (every zone uses the same calendar date, like
 * real offices do). Daylight saving is applied per zone for that date.
 */
export function computeBusinessHours(
  date: { year: number; month: number; day: number },
  entries: HoursEntry[],
): Result<BusinessHoursResult> {
  if (entries.length < 2) return fail(BUSINESS_MESSAGES.few);

  const windows: { zone: string; startMs: number; endMs: number }[] = [];
  for (const entry of entries) {
    const st = parseTimeInput(entry.start);
    const en = parseTimeInput(entry.end);
    if (!st.ok || !en.ok) return fail(MESSAGES.dateTime);
    if (entry.start === entry.end) return fail(BUSINESS_MESSAGES.same);
    const start = wallClockToInstantLenient({ ...date, ...st.value }, entry.zone);
    if (!start.ok) return start;
    const overnight = en.value.hour * 60 + en.value.minute <= st.value.hour * 60 + st.value.minute;
    const endDay = new Date(Date.UTC(date.year, date.month - 1, date.day + (overnight ? 1 : 0)));
    const end = wallClockToInstantLenient(
      { year: endDay.getUTCFullYear(), month: endDay.getUTCMonth() + 1, day: endDay.getUTCDate(), ...en.value },
      entry.zone,
    );
    if (!end.ok) return end;
    windows.push({ zone: entry.zone, startMs: start.value.ms, endMs: end.value.ms });
  }

  const reference = windows[0].zone;
  const rows: BusinessRow[] = windows.map((w, i) => ({
    zone: w.zone,
    startMs: w.startMs,
    endMs: w.endMs,
    local: formatWindow(w.startMs, w.endMs, w.zone, date),
    inReference: formatWindow(w.startMs, w.endMs, reference, date),
    offset: formatOffsetShort(getOffsetMs(w.startMs, entries[i].zone)),
  }));

  const overlapStart = Math.max(...windows.map((w) => w.startMs));
  const overlapEnd = Math.min(...windows.map((w) => w.endMs));
  const overlap =
    overlapStart < overlapEnd
      ? {
          startMs: overlapStart,
          endMs: overlapEnd,
          minutes: Math.round((overlapEnd - overlapStart) / 60_000),
          perZone: windows.map((w) => ({ zone: w.zone, text: formatWindow(overlapStart, overlapEnd, w.zone, date) })),
        }
      : null;

  const hour = 3_600_000;
  const axisStart = Math.floor(Math.min(...windows.map((w) => w.startMs)) / hour) * hour - hour;
  const axisEnd = Math.ceil(Math.max(...windows.map((w) => w.endMs)) / hour) * hour + hour;
  return ok({ reference, rows, overlap, axis: { startMs: axisStart, endMs: axisEnd } });
}
