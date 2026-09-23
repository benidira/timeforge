import { formatCompact, toIsoUtc } from "./format";
import { parseTimestamp, type Unit, type UnitChoice } from "./timestamp";

export const MAX_BATCH_ROWS = 5000;

export interface BatchRow {
  line: number;
  input: string;
  ok: boolean;
  error?: string;
  unit?: Unit;
  utc?: string;
  local?: string;
  iso?: string;
}

export interface BatchResult {
  rows: BatchRow[];
  validCount: number;
  invalidCount: number;
  /** True when the input had more non-blank lines than MAX_BATCH_ROWS. */
  truncated: boolean;
}

/** Converts one timestamp per line. Blank lines are skipped; bad lines are reported, not dropped. */
export function convertBatch(text: string, choice: UnitChoice, localTimeZone: string): BatchResult {
  const rows: BatchRow[] = [];
  let truncated = false;
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const input = lines[i].trim();
    if (!input) continue;
    if (rows.length >= MAX_BATCH_ROWS) {
      truncated = true;
      break;
    }
    const parsed = parseTimestamp(input, choice);
    if (!parsed.ok) {
      rows.push({ line: i + 1, input, ok: false, error: parsed.error });
      continue;
    }
    const { ms, unit } = parsed.value;
    const withMs = ((ms % 1000) + 1000) % 1000 !== 0;
    rows.push({
      line: i + 1,
      input,
      ok: true,
      unit,
      utc: formatCompact(ms, "UTC", { withMs }),
      local: formatCompact(ms, localTimeZone, { withMs }),
      iso: toIsoUtc(ms),
    });
  }
  const validCount = rows.filter((r) => r.ok).length;
  return { rows, validCount, invalidCount: rows.length - validCount, truncated };
}

/** Neutralises spreadsheet formulas ("=1+1", "@SUM") and quotes fields that need it. */
export function csvCell(value: string): string {
  let v = value;
  if (/^[=+@\t\r]/.test(v) || /^-(?!\d+(\.\d+)?$)/.test(v)) v = `'${v}`;
  return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

const HEADER = ["Timestamp", "Unit", "UTC", "Local", "ISO 8601", "Status"];

function rowValues(r: BatchRow): string[] {
  return [r.input, r.unit ?? "", r.utc ?? "", r.local ?? "", r.iso ?? "", r.ok ? "OK" : (r.error ?? "Invalid")];
}

export function batchToCsv(rows: BatchRow[]): string {
  return [HEADER, ...rows.map(rowValues)].map((line) => line.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

/** Tab-separated, ready to paste into a spreadsheet. */
export function batchToTsv(rows: BatchRow[]): string {
  return [HEADER, ...rows.map(rowValues)].map((line) => line.map((c) => c.replace(/[\t\r\n]+/g, " ")).join("\t")).join("\n");
}
