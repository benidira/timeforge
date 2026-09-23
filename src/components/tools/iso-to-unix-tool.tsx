"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { formatLong, formatOffset, parseIso8601, type ResultRowData } from "@/lib/time";
import { ResultList } from "../ui/result-list";
import { TimezoneSelect } from "../ui/timezone-select";

type State =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "ok"; rows: ResultRowData[]; notes: string[] };

const EXAMPLE = "2026-09-20T12:30:00Z";

export function IsoToUnixTool() {
  const uid = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [zone, setZone] = useState("UTC");
  const [state, setState] = useState<State>({ status: "idle" });

  function run(raw: string, assumed: string) {
    const parsed = parseIso8601(raw, assumed);
    if (!parsed.ok) return setState({ status: "error", message: parsed.error });

    const p = parsed.value;
    const notes: string[] = [];
    if (p.hasOffset) {
      notes.push(
        p.offsetMinutes === 0
          ? "The string is in UTC (Z or +00:00)."
          : `The string carries its own UTC offset (${formatOffset((p.offsetMinutes ?? 0) * 60_000)}).`,
      );
    } else {
      notes.push(`The string has no UTC offset, so it was read as ${p.assumedZone}.`);
      if (p.dateOnly) notes.push("A date without a time is read as 00:00:00.");
      if (p.ambiguous) notes.push("That clock time happens twice because clocks go back. The earlier occurrence was used.");
    }

    setState({
      status: "ok",
      notes,
      rows: [
        { id: "seconds", label: "Unix Seconds", value: String(Math.floor(p.ms / 1000)) },
        { id: "milliseconds", label: "Unix Milliseconds", value: String(p.ms) },
        { id: "utc", label: "UTC", value: formatLong(p.ms, "UTC", { withMs: p.ms % 1000 !== 0 }) },
      ],
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    run(value, zone);
  }

  function handleExample() {
    setValue(EXAMPLE);
    run(EXAMPLE, zone);
  }

  function handleClear() {
    setValue("");
    setZone("UTC");
    setState({ status: "idle" });
    inputRef.current?.focus();
  }

  const hasError = state.status === "error";
  const errorId = `${uid}-error`;

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="ISO 8601 to Unix timestamp converter">
      <label htmlFor={`${uid}-iso`} className="field-label">
        ISO 8601 date and time
      </label>
      <input
        ref={inputRef}
        id={`${uid}-iso`}
        className="input input-mono"
        type="text"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder={`e.g. ${EXAMPLE}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
      />
      {hasError ? (
        <p id={errorId} role="alert" className="error-text">
          {state.message}
        </p>
      ) : null}

      <div className="mt-4">
        <TimezoneSelect
          id={`${uid}-zone`}
          label="Time zone to assume when the string has no offset"
          value={zone}
          onChange={setZone}
          includeLocal
          hint="Only used for strings without Z or a UTC offset."
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
        <button type="submit" className="btn btn-primary col-span-2 sm:col-auto">
          Convert to Unix
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleExample}>
          Use example
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
