"use client";

import { useId, useState, type FormEvent } from "react";
import { calendarDifference, getZonedParts, pad, parseDateInput, parseTimeInput, type CalendarDifference } from "@/lib/time";
import { ResultList } from "../ui/result-list";

type State = { status: "idle" } | { status: "error"; a: string | null; b: string | null } | { status: "ok"; d: CalendarDifference };

const DEFAULT_TIME = "00:00:00";

function DateTimeField({
  id,
  label,
  date,
  time,
  invalid,
  describedBy,
  onDate,
  onTime,
  onNow,
}: {
  id: string;
  label: string;
  date: string;
  time: string;
  invalid: boolean;
  describedBy?: string;
  onDate: (v: string) => void;
  onTime: (v: string) => void;
  onNow: () => void;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="field-label">{label}</legend>
      <div className="grid grid-cols-2 gap-3">
        <input
          id={`${id}-date`}
          className="input input-mono"
          type="date"
          aria-label={`${label} date`}
          value={date}
          onChange={(e) => onDate(e.target.value)}
          aria-invalid={invalid}
          aria-describedby={describedBy}
        />
        <input
          id={`${id}-time`}
          className="input input-mono"
          type="time"
          step={1}
          aria-label={`${label} time`}
          value={time}
          onChange={(e) => onTime(e.target.value)}
          aria-invalid={invalid}
          aria-describedby={describedBy}
        />
      </div>
      <button type="button" className="btn btn-secondary btn-sm mt-2" onClick={onNow}>
        Use today
      </button>
    </fieldset>
  );
}

export function DateDifferenceTool() {
  const uid = useId();
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState(DEFAULT_TIME);
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState(DEFAULT_TIME);
  const [state, setState] = useState<State>({ status: "idle" });

  function run(sd: string, st: string, ed: string, et: string) {
    const psd = parseDateInput(sd);
    const pst = parseTimeInput(st);
    const ped = parseDateInput(ed);
    const pet = parseTimeInput(et);
    const aError = !psd.ok ? psd.error : !pst.ok ? pst.error : null;
    const bError = !ped.ok ? ped.error : !pet.ok ? pet.error : null;
    if (aError || bError) return setState({ status: "error", a: aError, b: bError });
    if (!psd.ok || !pst.ok || !ped.ok || !pet.ok) return;
    setState({ status: "ok", d: calendarDifference({ ...psd.value, ...pst.value }, { ...ped.value, ...pet.value }) });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    run(startDate, startTime, endDate, endTime);
  }

  function today(): [string, string] {
    const p = getZonedParts(Date.now(), Intl.DateTimeFormat().resolvedOptions().timeZone);
    return [`${pad(p.year, 4)}-${pad(p.month)}-${pad(p.day)}`, DEFAULT_TIME];
  }

  function handleClear() {
    setStartDate("");
    setStartTime(DEFAULT_TIME);
    setEndDate("");
    setEndTime(DEFAULT_TIME);
    setState({ status: "idle" });
  }

  const errorA = state.status === "error" ? state.a : null;
  const errorB = state.status === "error" ? state.b : null;

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Date difference calculator">
      <div className="grid gap-6 sm:grid-cols-2">
        <DateTimeField
          id={`${uid}-start`}
          label="Start date and time"
          date={startDate}
          time={startTime}
          invalid={errorA !== null}
          describedBy={errorA ? `${uid}-error-a` : undefined}
          onDate={setStartDate}
          onTime={setStartTime}
          onNow={() => {
            const [d, t] = today();
            setStartDate(d);
            setStartTime(t);
          }}
        />
        <DateTimeField
          id={`${uid}-end`}
          label="End date and time"
          date={endDate}
          time={endTime}
          invalid={errorB !== null}
          describedBy={errorB ? `${uid}-error-b` : undefined}
          onDate={setEndDate}
          onTime={setEndTime}
          onNow={() => {
            const [d, t] = today();
            setEndDate(d);
            setEndTime(t);
          }}
        />
      </div>

      {errorA ? (
        <p id={`${uid}-error-a`} role="alert" className="error-text">
          Start: {errorA}
        </p>
      ) : null}
      {errorB ? (
        <p id={`${uid}-error-b`} role="alert" className="error-text">
          End: {errorB}
        </p>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
        <button type="submit" className="btn btn-primary col-span-2 sm:col-auto">
          Calculate difference
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleClear}>
          Clear
        </button>
      </div>

      <div aria-live="polite" className="mt-6">
        {state.status === "ok" ? (
          <>
            <h2 className="mb-1 text-lg font-semibold">Difference</h2>
            <p className="field-hint mb-3 mt-0">
              {state.d.reversed ? "The end date is before the start date, so they were swapped. " : ""}
              {state.d.human}
            </p>
            <ResultList
              rows={[
                { id: "breakdown", label: "Breakdown", value: state.d.human },
                { id: "weeks", label: "Total weeks", value: state.d.totals.weeks },
                { id: "days", label: "Total days", value: state.d.totals.days },
                { id: "hours", label: "Total hours", value: state.d.totals.hours },
                { id: "minutes", label: "Total minutes", value: state.d.totals.minutes },
                { id: "seconds", label: "Total seconds", value: state.d.totals.seconds },
              ]}
            />
          </>
        ) : null}
      </div>
    </form>
  );
}
