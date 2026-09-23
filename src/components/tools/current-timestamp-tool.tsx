"use client";

import { useState } from "react";
import { formatLong, getLocalTimeZone, toIsoUtc } from "@/lib/time";
import { useNow } from "@/lib/use-now";
import { CopyButton } from "../ui/copy-button";
import { ResultList } from "../ui/result-list";

function Clock({ label, value, copyLabel }: { label: string; value: string; copyLabel: string }) {
  return (
    <div className="rounded-xl border border-line bg-field p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="my-2 break-all font-mono text-3xl font-semibold tabular-nums sm:text-4xl" data-testid={`clock-${label}`}>
        {value || "\u2014"}
      </p>
      <CopyButton value={value} label={label} disabled={!value}>
        {copyLabel}
      </CopyButton>
    </div>
  );
}

export function CurrentTimestampTool() {
  const [paused, setPaused] = useState(false);
  const { now, refresh } = useNow(!paused);

  const seconds = now === null ? "" : String(Math.floor(now / 1000));
  const milliseconds = now === null ? "" : String(now);
  const zone = now === null ? "" : getLocalTimeZone();

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Clock label="Seconds" value={seconds} copyLabel="Copy Seconds" />
        <Clock label="Milliseconds" value={milliseconds} copyLabel="Copy Milliseconds" />
      </div>

      <p role="status" className="field-hint">
        {paused ? "Paused. The values are frozen." : "Updates every second."}
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className="btn btn-secondary" onClick={refresh}>
          Refresh
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
          {paused ? "Resume" : "Pause"}
        </button>
      </div>

      {now !== null ? (
        <div className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">Current time</h2>
          <ResultList
            rows={[
              { id: "utc", label: "UTC", value: formatLong(now, "UTC") },
              { id: "local", label: `Local Time (${zone})`, value: formatLong(now, zone) },
              { id: "iso", label: "ISO 8601", value: toIsoUtc(now) },
            ]}
          />
        </div>
      ) : null}
    </div>
  );
}
