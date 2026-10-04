"use client";

import Link from "next/link";
import { toIsoUtc, getLocalTimeZone } from "@/lib/time";
import { useNow } from "@/lib/use-now";
import { CopyButton } from "./ui/copy-button";

/**
 * Premium Live Timestamp Hero Widget
 * Updates every second, displays seconds, milliseconds, UTC, and local time.
 */
export function LiveEpoch() {
  const { now } = useNow(true);
  const seconds = now === null ? "" : String(Math.floor(now / 1000));
  const milliseconds = now === null ? "" : String(now);
  const isoUtc = now === null ? "" : toIsoUtc(now).replace("T", " ").replace(".000Z", " UTC");

  let localTime = "";
  let localZone = "";
  if (now !== null) {
    try {
      localZone = getLocalTimeZone();
      localTime = new Intl.DateTimeFormat("en-US", {
        timeZone: localZone,
        dateStyle: "medium",
        timeStyle: "medium",
      }).format(now);
    } catch {
      localTime = new Date(now).toLocaleString();
    }
  }

  return (
    <div className="hero-glow card w-full max-w-2xl border-line/80 p-5 sm:p-7 shadow-2xl backdrop-blur-xl bg-card/90">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 border-b border-line/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Live Unix Timestamp
          </span>
        </div>
        <div className="flex items-center gap-2">
          {seconds ? <CopyButton value={seconds} label="Unix seconds" /> : null}
          <Link
            href="/unix-timestamp-converter"
            className="btn btn-secondary btn-sm text-xs py-1 px-2.5 h-auto min-h-0"
          >
            Open Converter →
          </Link>
        </div>
      </div>

      {/* Main Epoch Display */}
      <div className="my-5 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
          <p
            role="timer"
            aria-live="off"
            className="break-all font-mono text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight tabular-nums text-fg select-all"
          >
            {seconds || "—"}
          </p>
          <span className="text-xs font-medium text-muted bg-hover px-2.5 py-1 rounded-md self-center sm:self-auto">
            seconds since epoch
          </span>
        </div>
      </div>

      {/* Grid of metadata: Milliseconds, UTC, Local */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-line/60 pt-4 text-left">
        <div className="rounded-lg bg-hover/40 p-2.5">
          <span className="block text-xs font-medium text-muted">Milliseconds</span>
          <span className="mt-1 block font-mono text-sm font-semibold tabular-nums text-fg truncate">
            {milliseconds || "—"}
          </span>
        </div>
        <div className="rounded-lg bg-hover/40 p-2.5">
          <span className="block text-xs font-medium text-muted">UTC Time</span>
          <span className="mt-1 block font-mono text-xs font-semibold tabular-nums text-fg truncate">
            {isoUtc || "—"}
          </span>
        </div>
        <div className="rounded-lg bg-hover/40 p-2.5">
          <span className="block text-xs font-medium text-muted truncate">
            Local ({localZone || "Browser"})
          </span>
          <span className="mt-1 block font-mono text-xs font-semibold tabular-nums text-fg truncate">
            {localTime || "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
