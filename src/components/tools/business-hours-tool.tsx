"use client";

import { useId, useState, type FormEvent } from "react";
import { computeBusinessHours, getZonedParts, pad, parseDateInput, zoneLabel, type HoursEntry } from "@/lib/time";
import { TimezoneSelect } from "../ui/timezone-select";

type Row = HoursEntry & { key: string };

let rowSeq = 0;
function newRow(zone: string, start = "09:00", end = "17:00"): Row {
  rowSeq += 1;
  return { key: `row-${rowSeq}`, zone, start, end };
}

type State = { status: "idle" } | { status: "error"; message: string } | { status: "ok"; result: ReturnType<typeof computeBusinessHours> extends infer R ? R extends { ok: true; value: infer V } ? V : never : never };

export function BusinessHoursTool() {
  const uid = useId();
  const [date, setDate] = useState("");
  const [rows, setRows] = useState<Row[]>([newRow("America/New_York"), newRow("Europe/London")]);
  const [state, setState] = useState<State>({ status: "idle" });

  function run(d: string, entries: Row[]) {
    const pd = parseDateInput(d);
    if (!pd.ok) return setState({ status: "error", message: pd.error });
    const r = computeBusinessHours(pd.value, entries);
    if (!r.ok) return setState({ status: "error", message: r.error });
    setState({ status: "ok", result: r.value });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    run(date, rows);
  }

  function handleToday() {
    const p = getZonedParts(Date.now(), "UTC");
    const d = `${pad(p.year, 4)}-${pad(p.month)}-${pad(p.day)}`;
    setDate(d);
  }

  function updateRow(key: string, patch: Partial<HoursEntry>) {
    setRows((list) => list.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  const hasError = state.status === "error";
  const errorId = `${uid}-error`;

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Business hours converter">
      <div>
        <label htmlFor={`${uid}-date`} className="field-label">
          Date to compare on
        </label>
        <div className="flex flex-wrap gap-3">
          <input
            id={`${uid}-date`}
            className="input input-mono max-w-xs"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : undefined}
          />
          <button type="button" className="btn btn-secondary" onClick={handleToday}>
            Use today
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        {rows.map((row, i) => (
          <fieldset key={row.key} className="card p-4">
            <legend className="field-label px-1">Team {i + 1}</legend>
            <div className="grid gap-3 sm:grid-cols-[1fr_8rem_8rem_auto] sm:items-end">
              <TimezoneSelect id={`${row.key}-zone`} label="Time zone" value={row.zone} onChange={(z) => updateRow(row.key, { zone: z })} />
              <div>
                <label htmlFor={`${row.key}-start`} className="field-label">
                  Start
                </label>
                <input
                  id={`${row.key}-start`}
                  className="input input-mono"
                  type="time"
                  value={row.start}
                  onChange={(e) => updateRow(row.key, { start: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor={`${row.key}-end`} className="field-label">
                  End
                </label>
                <input
                  id={`${row.key}-end`}
                  className="input input-mono"
                  type="time"
                  value={row.end}
                  onChange={(e) => updateRow(row.key, { end: e.target.value })}
                />
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setRows((list) => list.filter((r) => r.key !== row.key))}
                disabled={rows.length <= 2}
                aria-label={`Remove team ${i + 1}`}
              >
                Remove
              </button>
            </div>
          </fieldset>
        ))}
      </div>

      <button type="button" className="btn btn-secondary mt-3" onClick={() => setRows((list) => [...list, newRow("UTC")])}>
        Add a time zone
      </button>

      {hasError ? (
        <p id={errorId} role="alert" className="error-text">
          {state.message}
        </p>
      ) : null}

      <div className="mt-5">
        <button type="submit" className="btn btn-primary">
          Compare hours
        </button>
      </div>

      <div aria-live="polite" className="mt-6">
        {state.status === "ok" ? (
          <>
            <h2 className="mb-3 text-lg font-semibold">Result</h2>
            <div className="overflow-x-auto rounded-xl border border-line">
              <table className="data-table">
                <caption className="sr-only">Working hours per zone, shown in the reference zone</caption>
                <thead>
                  <tr>
                    <th scope="col">Time zone</th>
                    <th scope="col">Local hours</th>
                    <th scope="col">In {zoneLabel(state.result.reference)}</th>
                  </tr>
                </thead>
                <tbody>
                  {state.result.rows.map((r) => (
                    <tr key={r.zone}>
                      <th scope="row" className="font-medium">
                        {zoneLabel(r.zone)}
                      </th>
                      <td className="num">{r.local}</td>
                      <td className="num">{r.inReference}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="field-hint mt-3">
              {state.result.overlap
                ? `Overlap: ${state.result.overlap.perZone.map((z) => `${zoneLabel(z.zone)} ${z.text}`).join(" / ")} (${state.result.overlap.minutes} minutes)`
                : "No overlap between these working hours on this date."}
            </p>
          </>
        ) : null}
      </div>
    </form>
  );
}
