"use client";

import { useId, useState, type FormEvent } from "react";
import { formatLong, parseRfc3339, parseTimestamp, toRfc3339, type UnitChoice } from "@/lib/time";
import { CopyButton } from "../ui/copy-button";
import { UnitSelect } from "../ui/unit-select";

const EXAMPLE = "2026-09-20T14:30:00+02:00";
const UNITS: UnitChoice[] = ["auto", "seconds", "milliseconds"];

/** Two small forms on one page: RFC 3339 \u2192 Unix, and Unix \u2192 RFC 3339. */
export function Rfc3339Tool() {
  const uid = useId();

  const [text, setText] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<{ ms: number; offsetMinutes: number } | null>(null);

  const [ts, setTs] = useState("");
  const [unit, setUnit] = useState<UnitChoice>("auto");
  const [buildError, setBuildError] = useState<string | null>(null);
  const [built, setBuilt] = useState<{ ms: number } | null>(null);

  function handleParse(e: FormEvent) {
    e.preventDefault();
    const r = parseRfc3339(text);
    if (!r.ok) {
      setParseError(r.error);
      setParsed(null);
      return;
    }
    setParseError(null);
    setParsed(r.value);
  }

  function handleBuild(e: FormEvent) {
    e.preventDefault();
    const r = parseTimestamp(ts, unit);
    if (!r.ok) {
      setBuildError(r.error);
      setBuilt(null);
      return;
    }
    setBuildError(null);
    setBuilt({ ms: r.value.ms });
  }

  return (
    <div className="grid gap-8">
      <section aria-labelledby={`${uid}-h1`}>
        <h2 id={`${uid}-h1`} className="mb-3 text-lg font-semibold">
          RFC 3339 to Unix time
        </h2>
        <form onSubmit={handleParse} noValidate aria-label="RFC 3339 to Unix">
          <label htmlFor={`${uid}-rfc`} className="field-label">
            RFC 3339 timestamp
          </label>
          <input
            id={`${uid}-rfc`}
            className="input input-mono"
            type="text"
            autoComplete="off"
            spellCheck={false}
            placeholder={`e.g. ${EXAMPLE}`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-invalid={parseError !== null}
            aria-describedby={parseError ? `${uid}-rfc-error` : undefined}
          />
          {parseError ? (
            <p id={`${uid}-rfc-error`} role="alert" className="error-text">
              {parseError}
            </p>
          ) : null}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            <button type="submit" className="btn btn-primary col-span-2 sm:col-auto">
              Convert to Unix
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setText(EXAMPLE);
                const r = parseRfc3339(EXAMPLE);
                if (r.ok) {
                  setParsed(r.value);
                  setParseError(null);
                }
              }}
            >
              Use example
            </button>
          </div>
        </form>
        {parsed ? (
          <div className="result-list mt-4">
            <dl>
              <div className="result-row">
                <dt>Unix seconds</dt>
                <dd>{Math.floor(parsed.ms / 1000)}</dd>
                <CopyButton value={String(Math.floor(parsed.ms / 1000))} label="Unix seconds" />
              </div>
              <div className="result-row">
                <dt>Unix milliseconds</dt>
                <dd>{parsed.ms}</dd>
                <CopyButton value={String(parsed.ms)} label="Unix milliseconds" />
              </div>
              <div className="result-row">
                <dt>UTC</dt>
                <dd>{formatLong(parsed.ms, "UTC")}</dd>
                <CopyButton value={formatLong(parsed.ms, "UTC")} label="UTC" />
              </div>
            </dl>
          </div>
        ) : null}
      </section>

      <section aria-labelledby={`${uid}-h2`}>
        <h2 id={`${uid}-h2`} className="mb-3 text-lg font-semibold">
          Unix time to RFC 3339
        </h2>
        <form onSubmit={handleBuild} noValidate aria-label="Unix to RFC 3339">
          <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
            <div>
              <label htmlFor={`${uid}-unix`} className="field-label">
                Unix timestamp
              </label>
              <input
                id={`${uid}-unix`}
                className="input input-mono"
                type="text"
                autoComplete="off"
                spellCheck={false}
                placeholder="e.g. 1790000000"
                value={ts}
                onChange={(e) => setTs(e.target.value)}
                aria-invalid={buildError !== null}
                aria-describedby={buildError ? `${uid}-unix-error` : undefined}
              />
            </div>
            <UnitSelect id={`${uid}-unit`} value={unit} onChange={setUnit} choices={UNITS} />
          </div>
          {buildError ? (
            <p id={`${uid}-unix-error`} role="alert" className="error-text">
              {buildError}
            </p>
          ) : null}
          <button type="submit" className="btn btn-primary mt-4">
            Convert to RFC 3339
          </button>
        </form>
        {built ? (
          <div className="result-list mt-4">
            <dl>
              <div className="result-row">
                <dt>RFC 3339 (UTC)</dt>
                <dd>{toRfc3339(built.ms, "UTC")}</dd>
                <CopyButton value={toRfc3339(built.ms, "UTC")} label="RFC 3339 UTC" />
              </div>
              <div className="result-row">
                <dt>RFC 3339 (local offset, {Intl.DateTimeFormat().resolvedOptions().timeZone})</dt>
                <dd>{toRfc3339(built.ms, Intl.DateTimeFormat().resolvedOptions().timeZone)}</dd>
                <CopyButton
                  value={toRfc3339(built.ms, Intl.DateTimeFormat().resolvedOptions().timeZone)}
                  label="RFC 3339 local"
                />
              </div>
            </dl>
          </div>
        ) : null}
      </section>
    </div>
  );
}
