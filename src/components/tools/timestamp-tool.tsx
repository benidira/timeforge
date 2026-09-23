"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import {
  buildTimestampRows,
  getLocalTimeZone,
  parseTimestamp,
  type ResultRowData,
  type TimestampVariant,
  type UnitChoice,
} from "@/lib/time";
import { ResultList } from "../ui/result-list";
import { UnitSelect } from "../ui/unit-select";

interface VariantConfig {
  label: string;
  placeholder: string;
  choices: UnitChoice[];
  defaultUnit: UnitChoice;
  submit: string;
  current: string;
}

const ALL_UNITS: UnitChoice[] = ["auto", "seconds", "milliseconds"];

const CONFIG: Record<TimestampVariant, VariantConfig> = {
  unix: {
    label: "Unix timestamp",
    placeholder: "1790000000",
    choices: ALL_UNITS,
    defaultUnit: "auto",
    submit: "Convert",
    current: "Current Timestamp",
  },
  epoch: {
    label: "Epoch time",
    placeholder: "1790000000",
    choices: ALL_UNITS,
    defaultUnit: "auto",
    submit: "Convert",
    current: "Current Time",
  },
  toDate: {
    label: "Unix timestamp",
    placeholder: "1790000000",
    choices: ALL_UNITS,
    defaultUnit: "auto",
    submit: "Convert to date",
    current: "Current Timestamp",
  },
  ms: {
    label: "Unix timestamp in milliseconds",
    placeholder: "1790000000123",
    choices: ["milliseconds"],
    defaultUnit: "milliseconds",
    submit: "Convert",
    current: "Current Time",
  },
  toIso: {
    label: "Unix timestamp",
    placeholder: "1790000000",
    choices: ALL_UNITS,
    defaultUnit: "auto",
    submit: "Convert to ISO 8601",
    current: "Current Timestamp",
  },
};

type State =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "ok"; rows: ResultRowData[]; unitNote: string };

/** One interface for the five "timestamp in, date out" tools. The variant decides the result rows. */
export function TimestampTool({ variant }: { variant: TimestampVariant }) {
  const cfg = CONFIG[variant];
  const uid = useId();
  const inputId = `${uid}-value`;
  const unitId = `${uid}-unit`;
  const errorId = `${uid}-error`;
  const inputRef = useRef<HTMLInputElement>(null);

  const [value, setValue] = useState("");
  const [unit, setUnit] = useState<UnitChoice>(cfg.defaultUnit);
  const [state, setState] = useState<State>({ status: "idle" });

  function run(raw: string, choice: UnitChoice) {
    const parsed = parseTimestamp(raw, choice);
    if (!parsed.ok) {
      setState({ status: "error", message: parsed.error });
      return;
    }
    const { ms, unit: used, detected } = parsed.value;
    const rows = buildTimestampRows(variant, ms, { localTimeZone: getLocalTimeZone(), nowMs: Date.now() });
    const unitNote = cfg.choices.length > 1 ? (detected ? `Detected unit: ${used}` : `Unit: ${used}`) : "";
    setState({ status: "ok", rows, unitNote });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    run(value, unit);
  }

  function handleCurrent() {
    const now = Date.now();
    const text = unit === "milliseconds" ? String(now) : String(Math.floor(now / 1000));
    setValue(text);
    run(text, unit);
  }

  function handleClear() {
    setValue("");
    setUnit(cfg.defaultUnit);
    setState({ status: "idle" });
    inputRef.current?.focus();
  }

  const hasError = state.status === "error";

  return (
    <form onSubmit={handleSubmit} noValidate aria-label={`${cfg.label} converter`}>
      <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
        <div>
          <label htmlFor={inputId} className="field-label">
            {cfg.label}
          </label>
          <input
            ref={inputRef}
            id={inputId}
            className="input input-mono"
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder={`e.g. ${cfg.placeholder}`}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : undefined}
          />
        </div>
        {cfg.choices.length > 1 ? (
          <UnitSelect id={unitId} value={unit} onChange={setUnit} choices={cfg.choices} />
        ) : null}
      </div>

      {hasError ? (
        <p id={errorId} role="alert" className="error-text">
          {state.message}
        </p>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
        <button type="submit" className="btn btn-primary col-span-2 sm:col-auto">
          {cfg.submit}
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleCurrent}>
          {cfg.current}
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleClear}>
          Clear
        </button>
      </div>

      <div aria-live="polite" className="mt-6">
        {state.status === "ok" ? (
          <>
            <h2 className="mb-1 text-lg font-semibold">Result</h2>
            {state.unitNote ? <p className="field-hint mb-3 mt-0">{state.unitNote}</p> : null}
            <ResultList rows={state.rows} />
          </>
        ) : null}
      </div>
    </form>
  );
}
