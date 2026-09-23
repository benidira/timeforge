import { DAY_MS, isLeapYear, utcFromParts } from "./core";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export interface DateDetails {
  weekday: string;
  dayOfYear: number;
  isoWeek: number;
  isoWeekYear: number;
  leapYear: boolean;
}

/** Calendar facts for the UTC date of an instant. */
export function dateDetails(ms: number): DateDetails {
  const d = new Date(ms);
  const year = d.getUTCFullYear();
  const midnight = utcFromParts(year, d.getUTCMonth() + 1, d.getUTCDate());
  const dayOfYear = Math.round((midnight - utcFromParts(year, 1, 1)) / DAY_MS) + 1;

  // ISO 8601 week: the week containing the year's first Thursday is week 1.
  const thursday = new Date(midnight);
  thursday.setUTCDate(thursday.getUTCDate() + 4 - (thursday.getUTCDay() || 7));
  const isoWeekYear = thursday.getUTCFullYear();
  const firstDay = utcFromParts(isoWeekYear, 1, 1);
  const isoWeek = Math.ceil(((thursday.getTime() - firstDay) / DAY_MS + 1) / 7);

  return { weekday: WEEKDAYS[d.getUTCDay()], dayOfYear, isoWeek, isoWeekYear, leapYear: isLeapYear(year) };
}
