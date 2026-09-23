"use client";

import { useId, useMemo, useState } from "react";
import {
  DEFAULT_CRON_CONFIG,
  WEEKDAY_LABELS,
  buildCron,
  describeCron,
  nextRuns,
  parseCron,
  toIsoUtc,
  type CronConfig,
  type CronPreset,
} from "@/lib/time";
import { CopyButton } from "../ui/copy-button";

const PRESETS: { value: CronPreset; label: string }[] = [
  { value: "every-minute", label: "Every minute" },
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "custom", label: "Custom" },
];

export function CronGeneratorTool() {
  const uid = useId();
  const [config, setConfig] = useState<CronConfig>(DEFAULT_CRON_CONFIG);
  const [nowMs] = useState(() => Date.now());

  const built = useMemo(() => buildCron(config), [config]);
  const parsed = built.ok ? parseCron(built.value) : null;
  const runs = parsed?.ok ? nextRuns(parsed.value, nowMs, 5) : [];

  function set<K extends keyof CronConfig>(key: K, value: CronConfig[K]) {
    setConfig((c) => ({ ...c, [key]: value }));
  }

  function toggleWeekday(day: number) {
    setConfig((c) => ({
      ...c,
      weekdays: c.weekdays.includes(day) ? c.weekdays.filter((d) => d !== day) : [...c.weekdays, day].sort((a, b) => a - b),
    }));
  }

  return (
    <div>
      <fieldset>
        <legend className="field-label">Pattern</legend>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              className={p.value === config.preset ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
              aria-pressed={p.value === config.preset}
              onClick={() => set("preset", p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-5 grid gap-4">
        {config.preset === "custom" ? (
          <div>
            <label htmlFor={`${uid}-custom`} className="field-label">
              Cron expression
            </label>
            <input
              id={`${uid}-custom`}
              className="input input-mono"
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={config.custom}
              onChange={(e) => set("custom", e.target.value)}
            />
          </div>
        ) : (
          <>
            {config.preset !== "every-minute" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor={`${uid}-minute`} className="field-label">
                    Minute (0–59)
                  </label>
                  <input
                    id={`${uid}-minute`}
                    className="input input-mono"
                    type="text"
                    inputMode="numeric"
                    value={config.minute}
                    onChange={(e) => set("minute", e.target.value)}
                  />
                </div>
                {config.preset !== "hourly" ? (
                  <div>
                    <label htmlFor={`${uid}-hour`} className="field-label">
                      Hour (0–23)
                    </label>
                    <input
                      id={`${uid}-hour`}
                      className="input input-mono"
                      type="text"
                      inputMode="numeric"
                      value={config.hour}
                      onChange={(e) => set("hour", e.target.value)}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}

            {config.preset === "weekly" ? (
              <fieldset>
                <legend className="field-label">Weekdays</legend>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAY_LABELS.map((name, i) => (
                    <button
                      key={name}
                      type="button"
                      className={config.weekdays.includes(i) ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
                      aria-pressed={config.weekdays.includes(i)}
                      onClick={() => toggleWeekday(i)}
                    >
                      {name.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : null}

            {config.preset === "monthly" ? (
              <div>
                <label htmlFor={`${uid}-dom`} className="field-label">
                  Day of month (1–31)
                </label>
                <input
                  id={`${uid}-dom`}
                  className="input input-mono max-w-[8rem]"
                  type="text"
                  inputMode="numeric"
                  value={config.dayOfMonth}
                  onChange={(e) => set("dayOfMonth", e.target.value)}
                />
              </div>
            ) : null}
          </>
        )}
      </div>

      <div aria-live="polite" className="mt-6">
        {built.ok ? (
          <div className="card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <code className="text-xl font-bold tabular-nums">{built.value}</code>
              <CopyButton value={built.value} label="cron expression" />
            </div>
            {parsed?.ok ? (
              <>
                <p className="mt-3 text-lg">{describeCron(parsed.value)}</p>
                {runs.length > 0 ? (
                  <div className="mt-4">
                    <p className="field-label mb-2">Next run times (UTC)</p>
                    <ul className="space-y-1 font-mono text-sm">
                      {runs.map((r) => (
                        <li key={r}>{toIsoUtc(r)}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        ) : (
          <p role="alert" className="error-text">
            {built.error}
          </p>
        )}
      </div>
    </div>
  );
}
