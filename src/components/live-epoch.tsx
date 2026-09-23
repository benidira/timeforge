"use client";

import { toIsoUtc } from "@/lib/time";
import { useNow } from "@/lib/use-now";

/** The hero's live visual: today's Unix time, ticking once per second, with its UTC date below it. */
export function LiveEpoch() {
  const { now } = useNow(true);
  const seconds = now === null ? "" : String(Math.floor(now / 1000));
  const iso = now === null ? "" : toIsoUtc(now).replace("T", " ").replace(".000Z", " UTC");

  return (
    <div className="hero-glow card p-5 sm:p-6">
      <p className="text-sm text-muted">Unix time right now, in seconds</p>
      <p role="timer" aria-live="off" className="my-3 break-all font-mono text-4xl font-semibold tabular-nums text-accent sm:text-5xl">
        {seconds || "\u2014"}
      </p>
      <div className="flex items-center gap-2 border-t border-line pt-3 text-sm text-muted">
        <span aria-hidden="true">{"\u2193"}</span>
        <span className="font-mono">{iso || "\u2014"}</span>
      </div>
    </div>
  );
}
