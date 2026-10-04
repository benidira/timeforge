const FROM_MS = Date.UTC(2026, 9, 3, 12, 0, 0);

function pad(n) { return n < 10 ? '0' + n : '' + n; }

function toISO(ms) {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}Z`;
}

const MONTH_NAMES = {JAN:1,FEB:2,MAR:3,APR:4,MAY:5,JUN:6,JUL:7,AUG:8,SEP:9,OCT:10,NOV:11,DEC:12};
const DOW_NAMES = {SUN:0,MON:1,TUE:2,WED:3,THU:4,FRI:5,SAT:6};

const SPECS = [
  { name: "minute", min: 0, max: 59 },
  { name: "hour", min: 0, max: 23 },
  { name: "day-of-month", min: 1, max: 31 },
  { name: "month", min: 1, max: 12, names: MONTH_NAMES },
  { name: "day-of-week", min: 0, max: 7, names: DOW_NAMES },
];

function parseValue(token, spec) {
  if (/^\d+$/.test(token)) {
    const n = Number(token);
    if (n < spec.min || n > spec.max) return null;
    return n;
  }
  const named = spec.names?.[token.toUpperCase()];
  if (named !== undefined) return named;
  return null;
}

function parseField(raw, spec) {
  if (raw === "?") return null;
  const values = new Set();
  for (const part of raw.split(",")) {
    if (!part) return null;
    const [rangePart, stepPart, ...extra] = part.split("/");
    if (extra.length) return null;
    let step = 1;
    if (stepPart !== undefined) {
      if (!/^\d+$/.test(stepPart) || Number(stepPart) < 1) return null;
      step = Number(stepPart);
    }
    let from, to;
    if (rangePart === "*") {
      from = spec.name === "day-of-week" ? 0 : spec.min;
      to = spec.name === "day-of-week" ? 6 : spec.max;
    } else if (rangePart.includes("-")) {
      const bounds = rangePart.split("-");
      if (bounds.length !== 2 || !bounds[0] || !bounds[1]) return null;
      const a = parseValue(bounds[0], spec);
      const b = parseValue(bounds[1], spec);
      if (a === null || b === null || a > b) return null;
      from = a; to = b;
    } else {
      const v = parseValue(rangePart, spec);
      if (v === null) return null;
      from = v;
      to = stepPart !== undefined ? (spec.name === "day-of-week" ? 6 : spec.max) : v;
    }
    for (let v = from; v <= to; v += step) values.add(spec.name === "day-of-week" && v === 7 ? 0 : v);
  }
  return { raw, values: [...values].sort((a, b) => a - b), starred: raw.startsWith("*") };
}

function parseCron(input) {
  let expression = input.trim().replace(/\s+/g, " ");
  if (expression.startsWith("@")) {
    const MACROS = {"@yearly":"0 0 1 1 *","@monthly":"0 0 1 * *","@weekly":"0 0 * * 0","@daily":"0 0 * * *","@hourly":"0 * * * *"};
    const macro = MACROS[expression.toLowerCase()];
    if (!macro) return null;
    expression = macro;
  }
  const fields = expression.split(" ");
  if (fields.length !== 5) return null;
  const parsed = [];
  for (let i = 0; i < 5; i++) {
    const r = parseField(fields[i], SPECS[i]);
    if (!r) return null;
    parsed.push(r);
  }
  return { minute: parsed[0], hour: parsed[1], dayOfMonth: parsed[2], month: parsed[3], dayOfWeek: parsed[4], expression };
}

function dayMatches(c, day, weekday) {
  const domOk = c.dayOfMonth.values.includes(day);
  const dowOk = c.dayOfWeek.values.includes(weekday);
  return c.dayOfMonth.starred || c.dayOfWeek.starred ? domOk && dowOk : domOk || dowOk;
}

function nextRuns(c, fromMs, count = 5) {
  const out = [];
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

const presets = [
  ["every-minute", "* * * * *"],
  ["every-5-minutes", "*/5 * * * *"],
  ["every-15-minutes", "*/15 * * * *"],
  ["every-30-minutes", "*/30 * * * *"],
  ["hourly", "0 * * * *"],
  ["hourly-at-30", "30 * * * *"],
  ["daily-midnight", "0 0 * * *"],
  ["daily-6am", "0 6 * * *"],
  ["daily-9am", "0 9 * * *"],
  ["daily-noon", "0 12 * * *"],
  ["daily-6pm", "0 18 * * *"],
  ["daily-11pm", "0 23 * * *"],
  ["weekly-monday-morning", "0 9 * * 1"],
  ["weekly-friday-evening", "0 18 * * 5"],
  ["weekly-sunday-midnight", "0 0 * * 0"],
  ["monthly-1st-midnight", "0 0 1 * *"],
  ["monthly-15th-9am", "0 9 15 * *"],
  ["yearly-jan1-midnight", "0 0 1 1 *"],
  ["yearly-dec31-2359", "59 23 31 12 *"],
  ["business-weekdays-9am", "0 9 * * 1-5"],
  ["business-weekdays-5pm", "0 17 * * 1-5"],
  ["business-mon-wed-fri-10am", "0 10 * * 1,3,5"],
  ["reboot-stub-daily-4am", "0 4 * * *"],
  ["every-second-weekday", "0 0 */2 * 1-5"],
];

for (const [slug, expr] of presets) {
  const c = parseCron(expr);
  if (!c) { console.log(`${slug}: PARSE ERROR`); continue; }
  const runs = nextRuns(c, FROM_MS, 5);
  console.log(`${slug}|${expr}|${runs.map(toISO).join(',')}`);
}
