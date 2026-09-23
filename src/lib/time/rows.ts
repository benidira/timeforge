import { dateDetails } from "./details";
import { formatCompact, formatLong, formatNumber, relativeTime, toIsoOffset, toIsoUtc } from "./format";

export type TimestampVariant = "unix" | "epoch" | "toDate" | "ms" | "toIso";

export interface ResultRowData {
  id: string;
  label: string;
  value: string;
  hint?: string;
  /** Rows with the same group are rendered under one sub-heading. */
  group?: string;
}

export interface RowContext {
  localTimeZone: string;
  nowMs: number;
}

/** The result rows shown by each timestamp tool. Pure, so it is easy to test. */
export function buildTimestampRows(
  variant: TimestampVariant,
  ms: number,
  ctx: RowContext,
): ResultRowData[] {
  const tz = ctx.localTimeZone;
  const localLabel = `Local Time (${tz})`;
  const hasMs = ((ms % 1000) + 1000) % 1000 !== 0;

  switch (variant) {
    case "unix":
      return [
        { id: "utc", label: "UTC", value: formatLong(ms, "UTC", { withMs: hasMs }) },
        { id: "local", label: localLabel, value: formatLong(ms, tz, { withMs: hasMs }) },
        { id: "iso", label: "ISO 8601", value: toIsoUtc(ms) },
        { id: "relative", label: "Relative to now", value: relativeTime(ms, ctx.nowMs) },
      ];

    case "epoch":
      return [
        { id: "seconds", label: "Epoch Seconds", value: formatNumber(ms / 1000, 3) },
        { id: "milliseconds", label: "Epoch Milliseconds", value: String(ms) },
        { id: "utc", label: "UTC", value: formatLong(ms, "UTC", { withMs: hasMs }) },
        { id: "local", label: localLabel, value: formatLong(ms, tz, { withMs: hasMs }) },
        { id: "iso", label: "ISO 8601", value: toIsoUtc(ms) },
      ];

    case "toDate": {
      const d = dateDetails(ms);
      return [
        { id: "utc", label: "UTC", value: formatLong(ms, "UTC", { withMs: hasMs }) },
        { id: "local", label: localLabel, value: formatLong(ms, tz, { withMs: hasMs }) },
        { id: "iso", label: "ISO 8601", value: toIsoUtc(ms) },
        { id: "weekday", label: "Day of week", value: d.weekday, group: "Calendar details (UTC date)" },
        { id: "dayOfYear", label: "Day of year", value: String(d.dayOfYear), group: "Calendar details (UTC date)" },
        {
          id: "isoWeek",
          label: "ISO week",
          value: `${d.isoWeekYear}-W${String(d.isoWeek).padStart(2, "0")}`,
          group: "Calendar details (UTC date)",
        },
        { id: "leap", label: "Leap year", value: d.leapYear ? "Yes" : "No", group: "Calendar details (UTC date)" },
      ];
    }

    case "ms":
      return [
        { id: "utc", label: "UTC", value: `${formatCompact(ms, "UTC", { withMs: true })} UTC` },
        { id: "local", label: localLabel, value: `${formatCompact(ms, tz, { withMs: true })} (${tz})` },
        { id: "iso", label: "ISO 8601", value: toIsoUtc(ms) },
        { id: "readable", label: "Readable Date", value: formatLong(ms, "UTC", { withMs: true }) },
      ];

    case "toIso":
      return [
        { id: "isoUtc", label: "ISO 8601 (UTC)", value: toIsoUtc(ms) },
        { id: "isoLocal", label: `ISO 8601 (${tz}, with UTC offset)`, value: toIsoOffset(ms, tz) },
        { id: "utc", label: "UTC", value: `${formatCompact(ms, "UTC", { withMs: hasMs })} UTC` },
        { id: "local", label: localLabel, value: `${formatCompact(ms, tz, { withMs: hasMs })} (${tz})` },
      ];
  }
}
