import { pad, type Result, fail, ok } from "./core";

export interface CronField {
  raw: string;
  /** Sorted, unique values the field matches. */
  values: number[];
  /** Starts with "*": affects how day-of-month and day-of-week combine. */
  starred: boolean;
}

export interface ParsedCron {
  minute: CronField;
  hour: CronField;
  dayOfMonth: CronField;
  month: CronField;
  dayOfWeek: CronField;
  expression: string;
}

interface FieldSpec {
  name: string;
  min: number;
  max: number;
  names?: Record<string, number>;
}

const MONTH_NAMES: Record<string, number> = { JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6, JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12 };
const DOW_NAMES: Record<string, number> = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 };

const SPECS: FieldSpec[] = [
  { name: "minute", min: 0, max: 59 },
  { name: "hour", min: 0, max: 23 },
  { name: "day-of-month", min: 1, max: 31 },
  { name: "month", min: 1, max: 12, names: MONTH_NAMES },
  { name: "day-of-week", min: 0, max: 7, names: DOW_NAMES },
];

const MACROS: Record<string, string> = {
  "@yearly": "0 0 1 1 *",
  "@annually": "0 0 1 1 *",
  "@monthly": "0 0 1 * *",
  "@weekly": "0 0 * * 0",
  "@daily": "0 0 * * *",
  "@midnight": "0 0 * * *",
  "@hourly": "0 * * * *",
};

export const MONTH_LABELS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const WEEKDAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function parseValue(token: string, spec: FieldSpec): number | string {
  if (/^\d+$/.test(token)) {
    const n = Number(token);
    if (n < spec.min || n > spec.max) return `${n} is out of range for the ${spec.name} field (${spec.min}-${spec.max}).`;
    return n;
  }
  const named = spec.names?.[token.toUpperCase()];
  if (named !== undefined) return named;
  if (/[LW#?]/i.test(token) && !/^[A-Za-z]{3}$/.test(token)) {
    return `"${token}" uses Quartz-style syntax (L, W, # or ?), which standard 5-field cron does not support.`;
  }
  return `"${token}" is not valid in the ${spec.name} field.`;
}

function parseField(raw: string, spec: FieldSpec): Result<CronField> {
  if (raw === "?") return fail(`"?" is not valid in standard 5-field cron. Use * in the ${spec.name} field.`);
  const values = new Set<number>();
  for (const part of raw.split(",")) {
    if (!part) return fail(`The ${spec.name} field has an empty value. Remove the extra comma.`);
    const [rangePart, stepPart, ...extra] = part.split("/");
    if (extra.length) return fail(`"${part}" has more than one step (/) in the ${spec.name} field.`);
    let step = 1;
    if (stepPart !== undefined) {
      if (!/^\d+$/.test(stepPart) || Number(stepPart) < 1) return fail(`The step in "${part}" must be a whole number of 1 or more.`);
      step = Number(stepPart);
    }
    let from: number;
    let to: number;
    if (rangePart === "*") {
      from = spec.name === "day-of-week" ? 0 : spec.min;
      to = spec.name === "day-of-week" ? 6 : spec.max;
    } else if (rangePart.includes("-")) {
      const bounds = rangePart.split("-");
      if (bounds.length !== 2 || !bounds[0] || !bounds[1]) return fail(`"${rangePart}" is not a valid range in the ${spec.name} field.`);
      const a = parseValue(bounds[0], spec);
      const b = parseValue(bounds[1], spec);
      if (typeof a === "string") return fail(a);
      if (typeof b === "string") return fail(b);
      if (a > b) return fail(`The range "${rangePart}" in the ${spec.name} field starts after it ends.`);
      from = a;
      to = b;
    } else {
      const v = parseValue(rangePart, spec);
      if (typeof v === "string") return fail(v);
      from = v;
      to = stepPart !== undefined ? (spec.name === "day-of-week" ? 6 : spec.max) : v;
    }
    if (step > to - from + 1 && stepPart !== undefined && rangePart === "*") {
      return fail(`The step /${step} is larger than the ${spec.name} field allows.`);
    }
    for (let v = from; v <= to; v += step) values.add(spec.name === "day-of-week" && v === 7 ? 0 : v);
  }
  return ok({ raw, values: [...values].sort((a, b) => a - b), starred: raw.startsWith("*") });
}

export const CRON_MESSAGES = {
  empty: "Enter a cron expression with five fields, for example */15 * * * *.",
  sixFields:
    "This looks like a 6 or 7 field expression (with seconds or a year), as used by Quartz or Spring. Standard cron has 5 fields: minute hour day-of-month month day-of-week.",
  fewFields: "A cron expression needs exactly 5 fields: minute hour day-of-month month day-of-week.",
} as const;

export function parseCron(input: string): Result<ParsedCron> {
  let expression = input.trim().replace(/\s+/g, " ");
  if (!expression) return fail(CRON_MESSAGES.empty);
  if (expression.startsWith("@")) {
    if (expression.toLowerCase() === "@reboot") return fail("@reboot runs once at startup and has no schedule to explain.");
    const macro = MACROS[expression.toLowerCase()];
    if (!macro) return fail(`"${expression}" is not a known shortcut. Try @hourly, @daily, @weekly, @monthly or @yearly.`);
    expression = macro;
  }
  const fields = expression.split(" ");
  if (fields.length > 5) return fail(CRON_MESSAGES.sixFields);
  if (fields.length < 5) return fail(CRON_MESSAGES.fewFields);

  const parsed: CronField[] = [];
  for (let i = 0; i < 5; i++) {
    const r = parseField(fields[i], SPECS[i]);
    if (!r.ok) return r;
    parsed.push(r.value);
  }
  return ok({ minute: parsed[0], hour: parsed[1], dayOfMonth: parsed[2], month: parsed[3], dayOfWeek: parsed[4], expression });
}

function dayMatches(c: ParsedCron, day: number, weekday: number): boolean {
  const domOk = c.dayOfMonth.values.includes(day);
  const dowOk = c.dayOfWeek.values.includes(weekday);
  // Standard (Vixie) cron: if both fields are restricted, either may match; otherwise both must.
  return c.dayOfMonth.starred || c.dayOfWeek.starred ? domOk && dowOk : domOk || dowOk;
}

/** The next `count` run times (UTC, as milliseconds) after `fromMs`. Searches up to 8 years ahead. */
export function nextRuns(c: ParsedCron, fromMs: number, count = 5): number[] {
  const out: number[] = [];
  const start = new Date(fromMs);
  const dayStart = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  for (let i = 0; i < 8 * 366 && out.length < count; i++) {
    const day = new Date(dayStart + i * 86_400_000);
    if (!c.month.values.includes(day.getUTCMonth() + 1)) continue;
    if (!dayMatches(c, day.getUTCDate(), day.getUTCDay())) continue;
    for (const h of c.hour.values) {
      for (const m of c.minute.values) {
        const t = dayStart + i * 86_400_000 + (h * 60 + m) * 60_000;
        if (t > fromMs) {
          out.push(t);
          if (out.length === count) return out;
        }
      }
    }
  }
  return out;
}

// ---------- human-readable description ----------

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

function isStepOfAll(f: CronField, step: RegExp): number | null {
  const m = step.exec(f.raw);
  return m ? Number(m[1]) : null;
}

function describeTime(c: ParsedCron): string {
  const { minute, hour } = c;
  const hourAll = hour.raw === "*";
  const minuteAll = minute.raw === "*";
  const minStep = isStepOfAll(minute, /^\*\/(\d+)$/);
  const hourStep = isStepOfAll(hour, /^\*\/(\d+)$/);
  const single = (f: CronField) => f.values.length === 1 && !f.raw.includes("-") && !f.raw.includes("/") && !f.raw.includes("*");
  const hourRange = /^(\d+)-(\d+)$/.exec(hour.raw);

  if (minuteAll && hourAll) return "Every minute";
  if (minStep && hourAll) return minStep === 1 ? "Every minute" : `Every ${minStep} minutes`;
  if (single(minute) && hourAll) return minute.values[0] === 0 ? "At the start of every hour" : `At minute ${minute.values[0]} past every hour`;
  if (single(minute) && single(hour)) return `At ${pad(hour.values[0])}:${pad(minute.values[0])}`;
  if (single(minute) && hour.values.length <= 6 && !hour.raw.includes("*") && !hourRange && !hour.raw.includes("/")) {
    return `At ${joinList(hour.values.map((h) => `${pad(h)}:${pad(minute.values[0])}`))}`;
  }
  if (hourRange && (minuteAll || minStep)) {
    const lead = minuteAll ? "Every minute" : `Every ${minStep} minutes`;
    return `${lead}, between ${pad(Number(hourRange[1]))}:00 and ${pad(Number(hourRange[2]))}:59`;
  }
  if (hourRange && single(minute)) {
    return `At minute ${minute.values[0]} past every hour from ${hourRange[1]} through ${hourRange[2]}`;
  }
  if (minuteAll && single(hour)) return `Every minute, from ${pad(hour.values[0])}:00 to ${pad(hour.values[0])}:59`;
  if (hourStep && single(minute)) return `At minute ${minute.values[0]} past every ${hourStep === 1 ? "hour" : `${hourStep} hours`}`;
  if (minStep && hour.values.length === 1) return `Every ${minStep} minutes, from ${pad(hour.values[0])}:00 to ${pad(hour.values[0])}:59`;

  const minutes = minuteAll ? "every minute" : `minute ${joinList(minute.values.map(String))}`;
  const hours = hourAll ? "every hour" : `hour ${joinList(hour.values.map(String))}`;
  return `At ${minutes} past ${hours}`;
}

function describeDayOfMonth(f: CronField): string {
  if (f.raw === "*") return "";
  const step = isStepOfAll(f, /^\*\/(\d+)$/);
  if (step) return `on every ${ordinal(step)} day-of-month`;
  const range = /^(\d+)-(\d+)$/.exec(f.raw);
  if (range) return `on every day-of-month from ${range[1]} through ${range[2]}`;
  return `on day-of-month ${joinList(f.values.map(String))}`;
}

function describeMonth(f: CronField): string {
  if (f.raw === "*") return "";
  const step = isStepOfAll(f, /^\*\/(\d+)$/);
  if (step) return `in every ${ordinal(step)} month`;
  const names = f.values.map((v) => MONTH_LABELS[v - 1]);
  if (f.values.length > 2 && f.values.every((v, i) => i === 0 || v === f.values[i - 1] + 1)) {
    return `in ${names[0]} through ${names[names.length - 1]}`;
  }
  return `in ${joinList(names)}`;
}

function describeDayOfWeek(f: CronField): string {
  if (f.raw === "*") return "";
  const names = f.values.map((v) => WEEKDAY_LABELS[v]);
  if (f.values.length > 2 && f.values.every((v, i) => i === 0 || v === f.values[i - 1] + 1)) {
    return `on ${names[0]} through ${names[names.length - 1]}`;
  }
  return `on ${joinList(names)}`;
}

/** English description, e.g. "At 09:00, on Monday through Friday". */
export function describeCron(c: ParsedCron): string {
  const dom = describeDayOfMonth(c.dayOfMonth);
  const dow = describeDayOfWeek(c.dayOfWeek);
  const month = describeMonth(c.month);
  const bothDays = !c.dayOfMonth.starred && !c.dayOfWeek.starred;
  const days = bothDays ? `${dom} or ${dow}` : [dom, dow].filter(Boolean).join(", ");
  const parts = [describeTime(c), days, month].filter(Boolean);
  return parts.join(", ");
}

// ---------- generator ----------

export type CronPreset = "every-minute" | "hourly" | "daily" | "weekly" | "monthly" | "custom";

export interface CronConfig {
  preset: CronPreset;
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  weekdays: number[];
  custom: string;
}

export const DEFAULT_CRON_CONFIG: CronConfig = {
  preset: "daily",
  minute: "0",
  hour: "9",
  dayOfMonth: "1",
  month: "*",
  weekdays: [1],
  custom: "*/15 * * * *",
};

/** Builds the expression for a preset. Returns an error message when a field is not valid. */
export function buildCron(config: CronConfig): Result<string> {
  let expression: string;
  switch (config.preset) {
    case "every-minute":
      expression = "* * * * *";
      break;
    case "hourly":
      expression = `${config.minute.trim()} * * * *`;
      break;
    case "daily":
      expression = `${config.minute.trim()} ${config.hour.trim()} * * *`;
      break;
    case "weekly":
      if (config.weekdays.length === 0) return fail("Choose at least one weekday.");
      expression = `${config.minute.trim()} ${config.hour.trim()} * * ${[...config.weekdays].sort((a, b) => a - b).join(",")}`;
      break;
    case "monthly":
      expression = `${config.minute.trim()} ${config.hour.trim()} ${config.dayOfMonth.trim()} * *`;
      break;
    case "custom":
      expression = config.custom.trim().replace(/\s+/g, " ");
      break;
  }
  const parsed = parseCron(expression);
  return parsed.ok ? ok(parsed.value.expression) : parsed;
}
