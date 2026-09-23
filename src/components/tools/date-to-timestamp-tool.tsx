"use client";

import { useId, useState, type FormEvent } from "react";
import {
  LOCAL_ZONE,
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

type State =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "ok"; rows: ResultRowData[]; notes: string[] };

const DEFAULT_TIME = "12:00:00";

export function DateToTimestampTool() {
  const uid = useId();
  const [date, setDate] = useState("");
  const [time, setTime] = useState(DEFAULT_TIME);
  const [zone, setZone] = useState<string>(LOCAL_ZONE);
  const [state, setState] = useState<State>({ status: "idle" });

  function run(d: string, t: string, z: string) {
    const parsedDate = parseDateInput(d);
    if (!parsedDate.ok) return setState({ status: "error", message: parsedDate.error });
    const parsedTime = parseTimeInput(t);
    if (!parsedTime.ok) return setState({ status: "error", message: parsedTime.error });

    const tz = resolveZone(z);
    const result = wallClockToInstant({ ...parsedDate.value, ...parsedTime.value }, tz);
    if (!result.ok) return setState({ status: "error", message: result.error });

    const { ms, ambiguous } = result.value;
    const notes = [`Read as ${d} ${t} in ${tz}.`];
    if (ambiguous) {
      notes.push("This clock time happens twice because clocks go back. The earlier occurrence was used.");
    }
    setState({
      status: "ok",
      notes,
      rows: [
        { id: "seconds", label: "Unix Timestamp (seconds)", value: String(Math.floor(ms / 1000)) },
        { id: "milliseconds", label: "Unix Timestamp (milliseconds)", value: String(ms) },
        { id: "iso", label: "ISO 8601 (UTC)", value: toIsoUtc(ms) },
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
    <form onSubmit={handleSubmit} noValidate aria-label="Date to Unix timestamp converter">
      <div className="grid gap-4 sm:grid-cols-2">
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
      <div className="mt-4">
        <TimezoneSelect id={`${uid}-zone`} label="Time zone" value={zone} onChange={setZone} includeLocal />
      </div>

      {hasError ? (
        <p id={errorId} role="alert" className="error-text">
          {state.message}
        </p>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
        <button type="submit" className="btn btn-primary col-span-2 sm:col-auto">
          Convert to timestamp
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
            {state.notes.map((n) => (
              <p key={n} className="field-hint mb-3 mt-0">
                {n}
              </p>
            ))}
            <ResultList rows={state.rows} />
          </>
        ) : null}
      </div>
    </form>
  );
}
