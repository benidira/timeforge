"use client";

import { useId, useState, type FormEvent } from "react";
import {
  LOCAL_ZONE,
  formatLong,
  formatOffsetLabel,
  getOffsetMs,
  getZonedParts,
  pad,
  parseDateInput,
  parseTimeInput,
  resolveZone,
  toIsoUtc,
  wallClockToInstant,
  type ResultRowData,
} from "@/lib/time";
import { ResultList } from "../ui/result-list";
import { TimezoneSelect } from "../ui/timezone-select";

const DEFAULT_TIME = "12:00:00";

type State = { status: "idle" } | { status: "error"; message: string } | { status: "ok"; rows: ResultRowData[]; note: string };

/** Converts a local date and time (in any zone) to UTC, or a UTC time back to any local zone. */
export function UtcConverterTool() {
  const uid = useId();
  const [date, setDate] = useState("");
  const [time, setTime] = useState(DEFAULT_TIME);
  const [zone, setZone] = useState(LOCAL_ZONE);
  const [state, setState] = useState<State>({ status: "idle" });

  function run(d: string, t: string, z: string) {
    const pd = parseDateInput(d);
    if (!pd.ok) return setState({ status: "error", message: pd.error });
    const pt = parseTimeInput(t);
    if (!pt.ok) return setState({ status: "error", message: pt.error });
    const tz = resolveZone(z);
    const r = wallClockToInstant({ ...pd.value, ...pt.value }, tz);
    if (!r.ok) return setState({ status: "error", message: r.error });

    const { ms } = r.value;
    setState({
      status: "ok",
      note: `${d} ${t} in ${tz} is ${formatOffsetLabel(getOffsetMs(ms, tz))} from UTC on that date.`,
      rows: [
        { id: "utc", label: "UTC", value: formatLong(ms, "UTC") },
        { id: "iso", label: "ISO 8601", value: toIsoUtc(ms) },
        { id: "unix", label: "Unix timestamp (seconds)", value: String(Math.floor(ms / 1000)) },
      ],
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    run(date, time, zone);
  }

  function handleNow() {
    const p = getZonedParts(Date.now(), resolveZone(zone));
    const d = `${pad(p.year, 4)}-${pad(p.month)}-${pad(p.day)}`;
    const t = `${pad(p.hour)}:${pad(p.minute)}:${pad(p.second)}`;
    setDate(d);
    setTime(t);
    run(d, t, zone);
  }

  function handleClear() {
    setDate("");
    setTime(DEFAULT_TIME);
    setZone(LOCAL_ZONE);
    setState({ status: "idle" });
  }

  const hasError = state.status === "error";
  const errorId = `${uid}-error`;

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="UTC converter">
      <TimezoneSelect id={`${uid}-zone`} label="Time zone of the date and time below" value={zone} onChange={setZone} includeLocal />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${uid}-date`} className="field-label">
            Date
          </label>
          <input
            id={`${uid}-date`}
            className="input input-mono"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : undefined}
          />
        </div>
        <div>
          <label htmlFor={`${uid}-time`} className="field-label">
            Time
          </label>
          <input
            id={`${uid}-time`}
            className="input input-mono"
            type="time"
            step={1}
            value={time}
            onChange={(e) => setTime(e.target.value)}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : undefined}
          />
        </div>
      </div>

      {hasError ? (
        <p id={errorId} role="alert" className="error-text">
          {state.message}
        </p>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
        <button type="submit" className="btn btn-primary col-span-2 sm:col-auto">
          Convert to UTC
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleNow}>
          Use current time
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleClear}>
          Clear
        </button>
      </div>

      <div aria-live="polite" className="mt-6">
        {state.status === "ok" ? (
          <>
            <h2 className="mb-1 text-lg font-semibold">Result</h2>
            <p className="field-hint mb-3 mt-0">{state.note}</p>
            <ResultList rows={state.rows} />
          </>
        ) : null}
      </div>
    </form>
  );
}
