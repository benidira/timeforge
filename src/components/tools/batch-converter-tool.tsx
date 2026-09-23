"use client";

import { useId, useState, type FormEvent } from "react";
import { batchToCsv, convertBatch, getLocalTimeZone, type BatchResult, type UnitChoice } from "@/lib/time";
import { CopyButton, copyToClipboard } from "../ui/copy-button";
import { UnitSelect } from "../ui/unit-select";

const UNITS: UnitChoice[] = ["auto", "seconds", "milliseconds"];
const PLACEHOLDER = "1750000000\n1750001000\n1750002000";

export function BatchConverterTool() {
  const uid = useId();
  const [text, setText] = useState("");
  const [unit, setUnit] = useState<UnitChoice>("auto");
  const [result, setResult] = useState<BatchResult | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  function run(raw: string, choice: UnitChoice) {
    setResult(raw.trim() ? convertBatch(raw, choice, getLocalTimeZone()) : null);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    run(text, unit);
  }

  function handleClear() {
    setText("");
    setUnit("auto");
    setResult(null);
  }

  async function handleCopyAll() {
    if (!result) return;
    const ok = await copyToClipboard(batchToCsv(result.rows).replace(/\r\n/g, "\n"));
    setCopyState(ok ? "copied" : "failed");
    setTimeout(() => setCopyState("idle"), 1800);
  }

  function handleDownloadCsv() {
    if (!result) return;
    const blob = new Blob([batchToCsv(result.rows)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "timeforge-batch-timestamps.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Unix timestamp batch converter">
      <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
        <div>
          <label htmlFor={`${uid}-text`} className="field-label">
            Timestamps, one per line
          </label>
          <textarea
            id={`${uid}-text`}
            className="input input-mono min-h-[10rem]"
            placeholder={`e.g.\n${PLACEHOLDER}`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
          />
        </div>
        <UnitSelect id={`${uid}-unit`} value={unit} onChange={setUnit} choices={UNITS} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
        <button type="submit" className="btn btn-primary col-span-2 sm:col-auto">
          Convert all
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleClear}>
          Clear
        </button>
      </div>

      <div aria-live="polite" className="mt-6">
        {result ? (
          <>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                Results ({result.validCount} valid{result.invalidCount ? `, ${result.invalidCount} invalid` : ""})
              </h2>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleCopyAll}>
                  {copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy failed" : "Copy all as CSV"}
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleDownloadCsv}>
                  Download CSV
                </button>
              </div>
            </div>
            {result.truncated ? (
              <p className="error-text">Only the first rows were processed; the list was too long and was cut off.</p>
            ) : null}
            <div className="overflow-x-auto rounded-xl border border-line">
              <table className="data-table">
                <caption className="sr-only">Converted timestamps</caption>
                <thead>
                  <tr>
                    <th scope="col">Timestamp</th>
                    <th scope="col">UTC</th>
                    <th scope="col">Local</th>
                    <th scope="col">ISO 8601</th>
                    <th scope="col">
                      <span className="sr-only">Copy</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row) => (
                    <tr key={row.line}>
                      <td className="num">{row.input}</td>
                      {row.ok ? (
                        <>
                          <td className="num">{row.utc}</td>
                          <td className="num">{row.local}</td>
                          <td className="num">{row.iso}</td>
                          <td>
                            <CopyButton value={row.iso ?? ""} label={`row ${row.line}`} />
                          </td>
                        </>
                      ) : (
                        <td colSpan={4} className="error-text">
                          {row.error}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </div>
    </form>
  );
}
