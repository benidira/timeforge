"use client";

import { useId, useState, type FormEvent } from "react";
import {
  formatCompact,
  formatOffsetLabel,
  getOffsetMs,
  getZonedParts,
  humanDuration,
  pad,
  parseDateInput,
  wallClockToInstant,
  zoneLabel,
} from "@/lib/time";
import { TimezoneSelect } from "../ui/timezone-select";

type State = { status: "idle" } | { status: "error"; message: string } | { status: "ok"; ms: number };

export function TimezoneOffsetTool() {
  const uid = useId();
  const [zoneA, setZoneA] = useState("UTC");
  const [zoneB, setZoneB] = useState("America/New_York");
  const [date, setDate] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  function run(d: string) {
    const pd = parseDateInput(d);
    if (!pd.ok) return setState({ status: "error", message: pd.error });
    const r = wallClockToInstant({ ...pd.value, hour: 12, minute: 0, second: 0 }, "UTC");
    if (!r.ok) return setState({ status: "error", message: r.error });
    setState({ status: "ok", ms: r.value.ms });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    run(date);
  }

  function handleToday() {
    const p = getZonedParts(Date.now(), "UTC");
    const d = `${pad(p.year, 4)}-${pad(p.month)}-${pad(p.day)}`;
    setDate(d);
    run(d);
  }

  const hasError = state.status === "error";
  const errorId = `${uid}-error`;

  const offsetA = state.status === "ok" ? getOffsetMs(state.ms, zoneA) : 0;
  const offsetB = state.status === "ok" ? getOffsetMs(state.ms, zoneB) : 0;
  const diff = offsetB - offsetA;

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Time zone offset calculator">
      <div className="grid gap-4 sm:grid-cols-2">
        <TimezoneSelect id={`${uid}-a`} label="Time zone A" value={zoneA} onChange={setZoneA} />
        <TimezoneSelect id={`${uid}-b`} label="Time zone B" value={zoneB} onChange={setZoneB} />
      </div>
      <div className="mt-4">
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

      {hasError ? (
        <p id={errorId} role="alert" className="error-text">
          {state.message}
        </p>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
        <button type="submit" className="btn btn-primary col-span-2 sm:col-auto">
          Compare
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleToday}>
          Use today
        </button>
      </div>

      <div aria-live="polite" className="mt-6">
        {state.status === "ok" ? (
          <>
            <h2 className="mb-3 text-lg font-semibold">Result</h2>
            <div className="result-list">
              <dl>
                <div className="result-row">
                  <dt>{zoneLabel(zoneA)} offset</dt>
                  <dd>{formatOffsetLabel(offsetA)}</dd>
                </div>
                <div className="result-row">
                  <dt>{zoneLabel(zoneB)} offset</dt>
                  <dd>{formatOffsetLabel(offsetB)}</dd>
                </div>
                <div className="result-row">
                  <dt>Difference</dt>
                  <dd>{diff === 0 ? "No difference" : `${zoneLabel(zoneB)} is ${humanDuration(Math.abs(diff))} ${diff > 0 ? "ahead of" : "behind"} ${zoneLabel(zoneA)}`}</dd>
                </div>
                <div className="result-row">
                  <dt>Noon in {zoneLabel(zoneA)} is</dt>
                  <dd>{formatCompact(state.ms, zoneB)} in {zoneLabel(zoneB)}</dd>
                </div>
              </dl>
            </div>
          </>
        ) : null}
      </div>
    </form>
  );
}
