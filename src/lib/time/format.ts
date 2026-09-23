import { pad } from "./core";
import { getOffsetMs, getZonedParts } from "./zones";

interface FormatOptions {
  /** Include the millisecond fraction. */
  withMs?: boolean;
}

/** "2026-09-26 15:33:20" (24-hour clock) in the given IANA time zone. */
export function formatCompact(ms: number, timeZone: string, { withMs = false }: FormatOptions = {}): string {
  const p = getZonedParts(ms, timeZone);
  const date = `${pad(p.year, 4)}-${pad(p.month)}-${pad(p.day)}`;
  const time = `${pad(p.hour)}:${pad(p.minute)}:${pad(p.second)}`;
  return `${date} ${time}${withMs ? `.${pad(p.millisecond, 3)}` : ""}`;
}

/** "Saturday, September 26, 2026 at 3:33:20 PM UTC" */
export function formatLong(ms: number, timeZone: string, { withMs = false }: FormatOptions = {}): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    ...(withMs ? { fractionalSecondDigits: 3 as const } : {}),
    timeZoneName: "short",
  }).format(new Date(ms));
}

/** "+01:00", "-04:00", "+05:45" (adds ":ss" only for historical offsets with seconds). */
export function formatOffset(offsetMs: number): string {
  const sign = offsetMs < 0 ? "-" : "+";
  const total = Math.round(Math.abs(offsetMs) / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${sign}${pad(h)}:${pad(m)}${s ? `:${pad(s)}` : ""}`;
}

/** "UTC-4", "UTC+5:30" (compact form for cards). */
export function formatOffsetShort(offsetMs: number): string {
  if (offsetMs === 0) return "UTC";
  const sign = offsetMs < 0 ? "-" : "+";
  const total = Math.round(Math.abs(offsetMs) / 60_000);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `UTC${sign}${h}${m ? `:${pad(m)}` : ""}`;
}

/** "UTC+01:00" (or just "UTC" at zero offset). */
export function formatOffsetLabel(offsetMs: number): string {
  return offsetMs === 0 ? "UTC" : `UTC${formatOffset(offsetMs)}`;
}

/** Always ends with Z, always has milliseconds: 2026-09-26T15:33:20.000Z */
export function toIsoUtc(ms: number): string {
  return new Date(ms).toISOString();
}

/** ISO 8601 with the zone's UTC offset: 2026-09-26T17:33:20.000+02:00 (Z for UTC). */
export function toIsoOffset(ms: number, timeZone: string): string {
  if (timeZone === "UTC") return toIsoUtc(ms);
  const p = getZonedParts(ms, timeZone);
  const offset = getOffsetMs(ms, timeZone);
  const date = `${pad(p.year, 4)}-${pad(p.month)}-${pad(p.day)}`;
  const time = `${pad(p.hour)}:${pad(p.minute)}:${pad(p.second)}.${pad(p.millisecond, 3)}`;
  return `${date}T${time}${formatOffset(offset)}`;
}

/** "in 3 days", "5 minutes ago", "now". */
export function relativeTime(ms: number, nowMs: number): string {
  const diffSeconds = Math.round((ms - nowMs) / 1000);
  const abs = Math.abs(diffSeconds);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (abs < 1) return rtf.format(0, "second");
  if (abs < 60) return rtf.format(diffSeconds, "second");
  if (abs < 3600) return rtf.format(Math.round(diffSeconds / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSeconds / 3600), "hour");
  if (abs < 86400 * 30) return rtf.format(Math.round(diffSeconds / 86400), "day");
  if (abs < 86400 * 365) return rtf.format(Math.round(diffSeconds / (86400 * 30)), "month");
  return rtf.format(Math.round(diffSeconds / (86400 * 365)), "year");
}

/** Plain number without grouping, trimmed to `maxDecimals` decimals. */
export function formatNumber(n: number, maxDecimals = 6): string {
  return new Intl.NumberFormat("en-US", { useGrouping: false, maximumFractionDigits: maxDecimals }).format(n);
}
