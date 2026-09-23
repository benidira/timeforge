import { MESSAGES, daysInMonth, fail, isInRange, ok, pad, utcFromParts, type Result } from "./core";
import { formatOffset } from "./format";
import { parseIso8601 } from "./iso";
import { parseTimestamp } from "./timestamp";
import { getOffsetMs, getZonedParts } from "./zones";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function compactOffset(offsetMs: number): string {
  return formatOffset(offsetMs).replace(":", "").slice(0, 5);
}

/** "Mon, 21 Sep 2026 14:13:20 +0000" */
export function toRfc2822(ms: number, timeZone = "UTC"): string {
  const p = getZonedParts(ms, timeZone);
  const weekday = WEEKDAYS[new Date(utcFromParts(p.year, p.month, p.day)).getUTCDay()];
  return `${weekday}, ${p.day} ${MONTHS[p.month - 1]} ${pad(p.year, 4)} ${pad(p.hour)}:${pad(p.minute)}:${pad(p.second)} ${compactOffset(getOffsetMs(ms, timeZone))}`;
}

/** "2026-09-21T14:13:20Z" or "2026-09-21T16:13:20.250+02:00" (fraction only when not zero). */
export function toRfc3339(ms: number, timeZone = "UTC"): string {
  const p = getZonedParts(ms, timeZone);
  const offset = getOffsetMs(ms, timeZone);
  const fraction = p.millisecond ? `.${pad(p.millisecond, 3)}` : "";
  const zone = timeZone === "UTC" || offset === 0 ? "Z" : formatOffset(offset);
  return `${pad(p.year, 4)}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}:${pad(p.second)}${fraction}${zone}`;
}

export const RFC3339_MESSAGE =
  "Please enter a valid RFC 3339 timestamp, for example 2026-09-20T12:30:00Z or 2026-09-20T14:30:00+02:00.";

const RFC3339_RE = /^(\d{4})-(\d{2})-(\d{2})[Tt ](\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?([Zz]|[+-]\d{2}:\d{2})$/;

export interface ParsedRfc3339 {
  ms: number;
  offsetMinutes: number;
}

/** Strict RFC 3339: full date, full time with seconds and a REQUIRED offset (Z or +hh:mm). */
export function parseRfc3339(input: string): Result<ParsedRfc3339> {
  const raw = input.trim();
  const m = RFC3339_RE.exec(raw);
  if (!m) {
    if (/^\d{4}-\d{2}-\d{2}[Tt ]\d{2}:\d{2}(:\d{2})?(\.\d+)?$/.test(raw)) {
      return fail("RFC 3339 requires a time zone offset at the end: add Z for UTC or an offset such as +02:00.");
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return fail("RFC 3339 timestamps need a time as well as a date, for example 2026-09-20T00:00:00Z.");
    return fail(RFC3339_MESSAGE);
  }
  const [year, month, day, hour, minute, second] = [1, 2, 3, 4, 5, 6].map((i) => Number(m[i]));
  if (year < 1) return fail(MESSAGES.range);
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month) || hour > 23 || minute > 59) {
    return fail(RFC3339_MESSAGE);
  }
  if (second === 60) return fail("Leap seconds (:60) are not supported. Use :59 or the following second.");
  if (second > 59) return fail(RFC3339_MESSAGE);
  const zone = m[8];
  let offsetMinutes = 0;
  if (zone.toUpperCase() !== "Z") {
    const oh = Number(zone.slice(1, 3));
    const om = Number(zone.slice(4, 6));
    if (oh > 23 || om > 59) return fail(RFC3339_MESSAGE);
    offsetMinutes = (zone[0] === "-" ? -1 : 1) * (oh * 60 + om);
  }
  const millisecond = m[7] ? Number(m[7].padEnd(3, "0").slice(0, 3)) : 0;
  const ms = utcFromParts(year, month, day, hour, minute, second, millisecond) - offsetMinutes * 60_000;
  return isInRange(ms) ? ok({ ms, offsetMinutes }) : fail(MESSAGES.range);
}

export const RFC2822_MESSAGE = "Please enter a valid RFC 2822 date, for example Mon, 21 Sep 2026 14:13:20 +0000.";

const ZONE_ABBREVIATIONS: Record<string, number> = {
  UT: 0, UTC: 0, GMT: 0, Z: 0, EST: -300, EDT: -240, CST: -360, CDT: -300, MST: -420, MDT: -360, PST: -480, PDT: -420,
};

const RFC2822_RE =
  /^(?:([A-Za-z]{3}),\s*)?(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?\s+([+-]\d{4}|[A-Za-z]{1,3})$/;

export function parseRfc2822(input: string): Result<{ ms: number; offsetMinutes: number }> {
  const m = RFC2822_RE.exec(input.trim());
  if (!m) return fail(RFC2822_MESSAGE);
  const monthIndex = MONTHS.findIndex((x) => x.toLowerCase() === m[3].toLowerCase());
  if (monthIndex < 0) return fail(RFC2822_MESSAGE);
  const [day, year, hour, minute] = [2, 4, 5, 6].map((i) => Number(m[i]));
  const second = m[7] ? Number(m[7]) : 0;
  const month = monthIndex + 1;
  if (year < 1) return fail(MESSAGES.range);
  if (day < 1 || day > daysInMonth(year, month) || hour > 23 || minute > 59 || second > 59) return fail(RFC2822_MESSAGE);

  let offsetMinutes: number;
  const z = m[8];
  if (/^[+-]\d{4}$/.test(z)) {
    const oh = Number(z.slice(1, 3));
    const om = Number(z.slice(3, 5));
    if (oh > 23 || om > 59) return fail(RFC2822_MESSAGE);
    offsetMinutes = (z[0] === "-" ? -1 : 1) * (oh * 60 + om);
  } else if (z.toUpperCase() in ZONE_ABBREVIATIONS) {
    offsetMinutes = ZONE_ABBREVIATIONS[z.toUpperCase()];
  } else {
    return fail(`The time zone "${z}" is not recognised. Use a numeric offset such as +0200.`);
  }
  if (m[1]) {
    const weekday = new Date(utcFromParts(year, month, day)).getUTCDay();
    if (WEEKDAYS[weekday].toLowerCase() !== m[1].toLowerCase()) {
      return fail(`The weekday ${m[1]} does not match ${day} ${m[3]} ${year}, which is a ${WEEKDAYS[weekday]}.`);
    }
  }
  const ms = utcFromParts(year, month, day, hour, minute, second) - offsetMinutes * 60_000;
  return isInRange(ms) ? ok({ ms, offsetMinutes }) : fail(MESSAGES.range);
}

export type DetectedFormat = "Unix seconds" | "Unix milliseconds" | "ISO 8601" | "RFC 3339" | "RFC 2822";

export const ANY_FORMAT_MESSAGE =
  "This value is not recognised. Enter a Unix timestamp, an ISO 8601 or RFC 3339 date such as 2026-09-20T12:30:00Z, or an RFC 2822 date such as Mon, 21 Sep 2026 14:13:20 +0000.";

/** Detects and parses any of the supported date formats. `assumedZone` is used for ISO strings without an offset. */
export function parseAnyDate(input: string, assumedZone = "UTC"): Result<{ ms: number; format: DetectedFormat; note?: string }> {
  const raw = input.trim();
  if (!raw) return fail(ANY_FORMAT_MESSAGE);

  if (/^[+-]?\d[\d,_ ]*(\.\d+)?$/.test(raw)) {
    const t = parseTimestamp(raw, "auto");
    if (!t.ok) return t;
    return ok({ ms: t.value.ms, format: t.value.unit === "seconds" ? "Unix seconds" : "Unix milliseconds" });
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const rfc = parseRfc3339(raw);
    if (rfc.ok) return ok({ ms: rfc.value.ms, format: "RFC 3339" });
    const iso = parseIso8601(raw, assumedZone);
    if (!iso.ok) return iso;
    const note = iso.value.hasOffset ? undefined : `No UTC offset in the input, so it was read as ${iso.value.assumedZone}.`;
    return ok({ ms: iso.value.ms, format: "ISO 8601", note });
  }
  const r2822 = parseRfc2822(raw);
  if (r2822.ok) return ok({ ms: r2822.value.ms, format: "RFC 2822" });
  return fail(/^[A-Za-z]{3},|^\d{1,2}\s+[A-Za-z]{3}/.test(raw) ? r2822.error : ANY_FORMAT_MESSAGE);
}
