"use client";

import { useId, useState, type FormEvent } from "react";
import { diffTimestamps, parseTimestamp, type ResultRowData, type UnitChoice } from "@/lib/time";
import { ResultList } from "../ui/result-list";
import { UnitSelect } from "../ui/unit-select";

const UNITS: UnitChoice[] = ["auto", "seconds", "milliseconds"];

type State =
  | { status: "idle" }
  | { status: "error"; a: string | null; b: string | null }
  | { status: "ok"; sentence: string; rows: ResultRowData[] };

interface FieldProps {
  id: string;
  label: string;
  value: string;
  unit: UnitChoice;
  invalid: boolean;
  describedBy?: string;
  onValue: (v: string) => void;
  onUnit: (u: UnitChoice) => void;
  onNow: () => void;
  nowLabel: string;
}

function TimestampField({ id, label, value, unit, invalid, describedBy, onValue, onUnit, onNow, nowLabel }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input
        id={id}
        className="input input-mono"
        type="text"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder="e.g. 1790000000"
        value={value}
        onChange={(e) => onValue(e.target.value)}
        aria-invalid={invalid}
        aria-describedby={describedBy}
      />
      <div className="mt-3 grid grid-cols-[1fr_auto] items-end gap-3">
        <UnitSelect id={`${id}-unit`} value={unit} onChange={onUnit} choices={UNITS} label={`${label} unit`} />
        <button type="button" className="btn btn-secondary" onClick={onNow} aria-label={nowLabel}>
          Use current time
        </button>
      </div>
    </div>
  );
}

export function TimestampDifferenceTool() {
  const uid = useId();
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [unitA, setUnitA] = useState<UnitChoice>("auto");
  const [unitB, setUnitB] = useState<UnitChoice>("auto");
  const [state, setState] = useState<State>({ status: "idle" });

  function run(va: string, vb: string, ua: UnitChoice, ub: UnitChoice) {
    const pa = parseTimestamp(va, ua);
    const pb = parseTimestamp(vb, ub);
    if (!pa.ok || !pb.ok) {
      return setState({
        status: "error",
        a: pa.ok ? null : `Timestamp A: ${pa.error}`,
        b: pb.ok ? null : `Timestamp B: ${pb.error}`,
      });
    }

    const d = diffTimestamps(pa.value.ms, pb.value.ms);
    const sentence =
      d.direction === "same"
        ? "Both timestamps are the same moment."
        : `Timestamp B is ${d.human} ${d.direction} Timestamp A.`;
    setState({
      status: "ok",
      sentence,
      rows: [
        { id: "human", label: "Human-readable duration", value: d.human },
        { id: "ms", label: "Milliseconds", value: d.totals.milliseconds },
        { id: "s", label: "Seconds", value: d.totals.seconds },
        { id: "min", label: "Minutes", value: d.totals.minutes },
        { id: "h", label: "Hours", value: d.totals.hours },
        { id: "d", label: "Days", value: d.totals.days },
        { id: "signed", label: "Signed difference, B minus A (milliseconds)", value: String(d.signedMs) },
      ],
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    run(a, b, unitA, unitB);
  }

  function handleSwap() {
    setA(b);
    setB(a);
    setUnitA(unitB);
    setUnitB(unitA);
    if (state.status === "ok") run(b, a, unitB, unitA);
  }

  function handleClear() {
    setA("");
    setB("");
    setUnitA("auto");
    setUnitB("auto");
    setState({ status: "idle" });
  }

  const errorA = state.status === "error" ? state.a : null;
  const errorB = state.status === "error" ? state.b : null;

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Timestamp difference calculator">
      <div className="grid gap-6 md:grid-cols-2">
        <TimestampField
          id={`${uid}-a`}
          label="Timestamp A"
          value={a}
          unit={unitA}
          invalid={errorA !== null}
          describedBy={errorA ? `${uid}-error-a` : undefined}
          nowLabel="Use current time for Timestamp A"
          onValue={setA}
          onUnit={setUnitA}
          onNow={() => setA(String(Math.floor(Date.now() / 1000)))}
        />
        <TimestampField
          id={`${uid}-b`}
          label="Timestamp B"
          value={b}
          unit={unitB}
          invalid={errorB !== null}
          describedBy={errorB ? `${uid}-error-b` : undefined}
          nowLabel="Use current time for Timestamp B"
          onValue={setB}
          onUnit={setUnitB}
          onNow={() => setB(String(Math.floor(Date.now() / 1000)))}
        />
      </div>

      {errorA ? (
        <p id={`${uid}-error-a`} role="alert" className="error-text">
          {errorA}
        </p>
      ) : null}
      {errorB ? (
        <p id={`${uid}-error-b`} role="alert" className="error-text">
          {errorB}
        </p>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
        <button type="submit" className="btn btn-primary col-span-2 sm:col-auto">
          Calculate difference
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleSwap}>
          Swap A and B
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleClear}>
          Clear
        </button>
      </div>

      <div aria-live="polite" className="mt-6">
        {state.status === "ok" ? (
          <>
            <h2 className="mb-1 text-lg font-semibold">Difference</h2>
            <p className="field-hint mb-3 mt-0">{state.sentence}</p>
            <ResultList rows={state.rows} />
          </>
        ) : null}
      </div>
    </form>
  );
}
