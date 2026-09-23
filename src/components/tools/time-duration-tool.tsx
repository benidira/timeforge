"use client";

import { useId, useState, type FormEvent } from "react";
import { parseTimeInput, timeOfDayDuration, type TimeOfDayDuration } from "@/lib/time";
import { ResultList } from "../ui/result-list";

type State = { status: "idle" } | { status: "error"; message: string } | { status: "ok"; d: TimeOfDayDuration };

export function TimeDurationTool() {
  const uid = useId();
  const [start, setStart] = useState("09:00:00");
  const [end, setEnd] = useState("17:00:00");
  const [extraDays, setExtraDays] = useState("0");
  const [state, setState] = useState<State>({ status: "idle" });

  function run(s: string, e: string, days: string) {
    const ps = parseTimeInput(s);
    const pe = parseTimeInput(e);
    if (!ps.ok) return setState({ status: "error", message: `Start time: ${ps.error}` });
    if (!pe.ok) return setState({ status: "error", message: `End time: ${pe.error}` });
    const n = Number(days.trim() || "0");
    if (!Number.isInteger(n) || n < 0) return setState({ status: "error", message: "Extra days must be a whole number of 0 or more." });
    setState({ status: "ok", d: timeOfDayDuration(ps.value, pe.value, n) });
  }

  function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    run(start, end, extraDays);
  }

  function handleClear() {
    setStart("09:00:00");
    setEnd("17:00:00");
    setExtraDays("0");
    setState({ status: "idle" });
  }

  const hasError = state.status === "error";
  const errorId = `${uid}-error`;

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Time duration calculator">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor={`${uid}-start`} className="field-label">
            Start time
          </label>
          <input
            id={`${uid}-start`}
            className="input input-mono"
            type="time"
            step={1}
            value={start}
            onChange={(e) => setStart(e.target.value)}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : undefined}
          />
        </div>
        <div>
          <label htmlFor={`${uid}-end`} className="field-label">
            End time
          </label>
          <input
            id={`${uid}-end`}
            className="input input-mono"
            type="time"
            step={1}
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : undefined}
          />
        </div>
        <div>
          <label htmlFor={`${uid}-days`} className="field-label">
            Extra whole days
          </label>
          <input
            id={`${uid}-days`}
            className="input input-mono"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={extraDays}
            onChange={(e) => setExtraDays(e.target.value)}
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
          Calculate
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleClear}>
          Clear
        </button>
      </div>

      <div aria-live="polite" className="mt-6">
        {state.status === "ok" ? (
          <>
            <h2 className="mb-1 text-lg font-semibold">Duration</h2>
            {state.d.crossedMidnight ? (
              <p className="field-hint mb-3 mt-0">The end time is earlier than the start time, so it was read as happening the next day.</p>
            ) : null}
            <ResultList
              rows={[
                { id: "human", label: "Duration", value: state.d.human },
                { id: "seconds", label: "Seconds", value: state.d.totals.seconds },
                { id: "minutes", label: "Minutes", value: state.d.totals.minutes },
                { id: "hours", label: "Hours", value: state.d.totals.hours },
                { id: "days", label: "Days", value: state.d.totals.days },
              ]}
            />
          </>
        ) : null}
      </div>
    </form>
  );
}
