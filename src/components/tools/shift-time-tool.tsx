"use client";

import { useId, useState, type FormEvent } from "react";
import {
  ADD_UNITS,
  LOCAL_ZONE,
  formatLong,
  getZonedParts,
  pad,
  parseAmount,
  parseDateInput,
  parseTimeInput,
  resolveZone,
  shiftInstant,
  toIsoUtc,
  wallClockToInstant,
  type AddUnit,
  type ResultRowData,
} from "@/lib/time";
import { ResultList } from "../ui/result-list";
import { TimezoneSelect } from "../ui/timezone-select";

const UNIT_LABELS: Record<AddUnit, string> = {
  seconds: "Seconds",
  minutes: "Minutes",
  hours: "Hours",
  days: "Days",
  weeks: "Weeks",
};

const DEFAULT_TIME = "12:00:00";

type State =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "ok"; rows: ResultRowData[]; note: string | null };

/** Shared implementation for the Add Time and Subtract Time calculators; `sign` picks the direction. */
export function ShiftTimeTool({ sign }: { sign: 1 | -1 }) {
  const uid = useId();
  const verb = sign === 1 ? "Add" : "Subtract";
  const [date, setDate] = useState("");
  const [time, setTime] = useState(DEFAULT_TIME);
  const [zone, setZone] = useState(LOCAL_ZONE);
  const [amount, setAmount] = useState("1");
  const [unit, setUnit] = useState<AddUnit>("days");
  const [state, setState] = useState<State>({ status: "idle" });

  function run(d: string, t: string, z: string, amt: string, u: AddUnit) {
    const pd = parseDateInput(d);
    if (!pd.ok) return setState({ status: "error", message: pd.error });
    const pt = parseTimeInput(t);
    if (!pt.ok) return setState({ status: "error", message: pt.error });
    const pa = parseAmount(amt);
    if (!pa.ok) return setState({ status: "error", message: pa.error });

    const tz = resolveZone(z);
    const start = wallClockToInstant({ ...pd.value, ...pt.value }, tz);
    if (!start.ok) return setState({ status: "error", message: start.error });

    const shifted = shiftInstant(start.value.ms, pa.value, u, tz, sign);
    if (!shifted.ok) return setState({ status: "error", message: shifted.error });

    setState({
      status: "ok",
      note: shifted.value.adjusted
        ? "That result falls in a gap created by clocks moving forward (daylight saving time), so it was moved forward by the size of the gap."
        : null,
      rows: [
        { id: "result", label: `Resulting date and time (${tz})`, value: formatLong(shifted.value.ms, tz) },
        { id: "utc", label: "UTC", value: formatLong(shifted.value.ms, "UTC") },
        { id: "iso", label: "ISO 8601", value: toIsoUtc(shifted.value.ms) },
      ],
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    run(date, time, zone, amount, unit);
  }

  function handleNow() {
    const p = getZonedParts(Date.now(), resolveZone(zone));
    const d = `${pad(p.year, 4)}-${pad(p.month)}-${pad(p.day)}`;
    const t = `${pad(p.hour)}:${pad(p.minute)}:${pad(p.second)}`;
    setDate(d);
    setTime(t);
    run(d, t, zone, amount, unit);
  }

  function handleClear() {
    setDate("");
    setTime(DEFAULT_TIME);
    setZone(LOCAL_ZONE);
    setAmount("1");
    setUnit("days");
    setState({ status: "idle" });
  }

  const hasError = state.status === "error";
  const errorId = `${uid}-error`;

  return (
    <form onSubmit={handleSubmit} noValidate aria-label={`${verb} time calculator`}>
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

      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_10rem]">
        <div>
          <label htmlFor={`${uid}-amount`} className="field-label">
            Amount to {verb.toLowerCase()}
          </label>
          <input
            id={`${uid}-amount`}
            className="input input-mono"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : undefined}
          />
        </div>
        <div>
          <label htmlFor={`${uid}-unit`} className="field-label">
            Unit
          </label>
          <select id={`${uid}-unit`} className="input" value={unit} onChange={(e) => setUnit(e.target.value as AddUnit)}>
            {ADD_UNITS.map((u) => (
              <option key={u} value={u}>
                {UNIT_LABELS[u]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasError ? (
        <p id={errorId} role="alert" className="error-text">
          {state.message}
        </p>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
        <button type="submit" className="btn btn-primary col-span-2 sm:col-auto">
          {verb} time
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
            {state.note ? <p className="field-hint mb-3 mt-0">{state.note}</p> : null}
            <ResultList rows={state.rows} />
          </>
        ) : null}
      </div>
    </form>
  );
}
