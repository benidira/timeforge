"use client";

import { useId, useState } from "react";
import { DEFAULT_COMPARE_ZONES, readClock, zoneLabel } from "@/lib/time";
import { useNow } from "@/lib/use-now";
import { TimezoneSelect } from "../ui/timezone-select";

const DEFAULT_CITIES = [
  "America/New_York",
  "Europe/London",
  "Europe/Paris",
  "Africa/Algiers",
  "Asia/Dubai",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
  "America/Los_Angeles",
];

void DEFAULT_COMPARE_ZONES;

function ClockCard({ ms, zone, onRemove }: { ms: number; zone: string; onRemove: () => void }) {
  const c = readClock(ms, zone);
  return (
    <div className="card relative overflow-hidden p-4" data-testid="world-clock-card">
      <span
        aria-hidden="true"
        className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-xs text-muted"
      >
        {c.isDay ? "\u2600\ufe0f Day" : "\ud83c\udf19 Night"}
      </span>
      <p className="!mt-0 text-lg font-semibold">{zoneLabel(zone)}</p>
      <p className="mt-1 font-mono text-3xl font-bold tabular-nums">
        {c.time}
        <span className="text-muted">:{c.seconds}</span>
      </p>
      <p className="mt-1 text-sm text-muted">{c.date}</p>
      <p className="text-sm text-muted">{c.offset}</p>
      <button type="button" className="btn btn-secondary btn-sm mt-3" onClick={onRemove}>
        Remove
      </button>
    </div>
  );
}

export function WorldClockTool() {
  const uid = useId();
  const { now } = useNow(true);
  const [cities, setCities] = useState<string[]>(DEFAULT_CITIES);
  const [addZone, setAddZone] = useState("Asia/Kolkata");

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {now === null
          ? null
          : cities.map((z) => (
              <ClockCard key={z} ms={now} zone={z} onRemove={() => setCities((list) => list.filter((x) => x !== z))} />
            ))}
      </div>

      <div className="mt-6 grid items-end gap-3 sm:grid-cols-[1fr_auto]">
        <TimezoneSelect id={`${uid}-add`} label="Add a city" value={addZone} onChange={setAddZone} />
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setCities((list) => (list.includes(addZone) ? list : [...list, addZone]))}
        >
          Add city
        </button>
      </div>
    </div>
  );
}
