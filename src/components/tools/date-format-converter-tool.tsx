"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { formatLong, parseAnyDate, toIsoUtc, toRfc2822, toRfc3339, type DetectedFormat, type ResultRowData } from "@/lib/time";
import { ResultList } from "../ui/result-list";

type State = { status: "idle" } | { status: "error"; message: string } | { status: "ok"; format: DetectedFormat; note?: string; rows: ResultRowData[] };

const EXAMPLE = "Mon, 21 Sep 2026 14:13:20 +0000";

export function DateFormatConverterTool() {
  const uid = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  function run(raw: string) {
    const r = parseAnyDate(raw);
    if (!r.ok) return setState({ status: "error", message: r.error });
    const { ms, format, note } = r.value;
    setState({
      status: "ok",
      format,
      note,
      rows: [
        { id: "iso", label: "ISO 8601", value: toIsoUtc(ms) },
        { id: "rfc3339", label: "RFC 3339", value: toRfc3339(ms, "UTC") },
        { id: "rfc2822", label: "RFC 2822", value: toRfc2822(ms, "UTC") },
        { id: "utc", label: "UTC", value: formatLong(ms, "UTC") },
        { id: "local", label: `Local Time (${Intl.DateTimeFormat().resolvedOptions().timeZone})`, value: formatLong(ms, Intl.DateTimeFormat().resolvedOptions().timeZone) },
        { id: "seconds", label: "Unix seconds", value: String(Math.floor(ms / 1000)) },
        { id: "milliseconds", label: "Unix milliseconds", value: String(ms) },
      ],
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    run(value);
  }

  function handleExample() {
    setValue(EXAMPLE);
    run(EXAMPLE);
  }

  function handleClear() {
    setValue("");
    setState({ status: "idle" });
    inputRef.current?.focus();
  }

  const hasError = state.status === "error";
  const errorId = `${uid}-error`;

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Date format converter">
      <label htmlFor={`${uid}-value`} className="field-label">
        Date, in any supported format
      </label>
      <input
        ref={inputRef}
        id={`${uid}-value`}
        className="input input-mono"
        type="text"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder={`e.g. ${EXAMPLE}, 2026-09-20T12:30:00Z, or 1790000000`}
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

      <div className="mt-5 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
        <button type="submit" className="btn btn-primary col-span-2 sm:col-auto">
          Detect and convert
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
            <p className="field-hint mb-3 mt-0">
              Detected as {state.format}. {state.note ?? ""}
            </p>
            <ResultList rows={state.rows} />
          </>
        ) : null}
      </div>
    </form>
  );
}
