import { pad } from "./core";
import { formatOffsetShort } from "./format";
import { getOffsetMs, getZonedParts } from "./zones";

const dateFormatters = new Map<string, Intl.DateTimeFormat>();

function dateFormatter(timeZone: string): Intl.DateTimeFormat {
  let f = dateFormatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "long", month: "long", day: "numeric" });
    dateFormatters.set(timeZone, f);
  }
  return f;
}

export interface ClockReading {
  time: string;
  /** Seconds part only, so the card can animate it. */
  seconds: string;
  date: string;
  offset: string;
  isDay: boolean;
}

/** Everything a world clock card shows for one zone. Daytime is 06:00 to 17:59 local time. */
export function readClock(ms: number, timeZone: string): ClockReading {
  const p = getZonedParts(ms, timeZone);
  return {
    time: `${pad(p.hour)}:${pad(p.minute)}`,
    seconds: pad(p.second),
    date: dateFormatter(timeZone).format(new Date(ms)),
    offset: formatOffsetShort(getOffsetMs(ms, timeZone)),
    isDay: p.hour >= 6 && p.hour < 18,
  };
}
