"use client";

import dynamic from "next/dynamic";
import type { ToolConfig } from "@/lib/pseo/types";
import type { ComponentType } from "react";

const TimestampTool = dynamic<{ variant?: string; initial?: Record<string, unknown> }>(
  () =>
    import("@/components/tools/timestamp-tool").then(
      (m) => m.TimestampTool as ComponentType<{ variant?: string; initial?: Record<string, unknown> }>,
    ),
  { ssr: false, loading: () => null },
);
const IsoTool = dynamic<{ initial?: Record<string, unknown> }>(
  () =>
    import("@/components/tools/iso8601-converter-tool").then(
      (m) => m.Iso8601ConverterTool as ComponentType<{ initial?: Record<string, unknown> }>,
    ),
  { ssr: false, loading: () => null },
);
const TimezoneConverterTool = dynamic<{ initial?: Record<string, unknown> }>(
  () =>
    import("@/components/tools/timezone-converter-tool").then(
      (m) => m.TimezoneConverterTool as ComponentType<{ initial?: Record<string, unknown> }>,
    ),
  { ssr: false, loading: () => null },
);
const CronTool = dynamic<{ initial?: Record<string, unknown> }>(
  () =>
    import("@/components/tools/cron-generator-tool").then(
      (m) => m.CronGeneratorTool as ComponentType<{ initial?: Record<string, unknown> }>,
    ),
  { ssr: false, loading: () => null },
);
const WorldClockTool = dynamic<{ initial?: Record<string, unknown> }>(
  () =>
    import("@/components/tools/world-clock-tool").then(
      (m) => m.WorldClockTool as ComponentType<{ initial?: Record<string, unknown> }>,
    ),
  { ssr: false, loading: () => null },
);
const DateDiffTool = dynamic<{ initial?: Record<string, unknown> }>(
  () =>
    import("@/components/tools/date-difference-tool").then(
      (m) => m.DateDifferenceTool as ComponentType<{ initial?: Record<string, unknown> }>,
    ),
  { ssr: false, loading: () => null },
);
const DurationTool = dynamic<{ initial?: Record<string, unknown> }>(
  () =>
    import("@/components/tools/time-duration-tool").then(
      (m) => m.TimeDurationTool as ComponentType<{ initial?: Record<string, unknown> }>,
    ),
  { ssr: false, loading: () => null },
);
const ShiftTool = dynamic<{ sign?: number; initial?: Record<string, unknown> }>(
  () =>
    import("@/components/tools/shift-time-tool").then(
      (m) => m.ShiftTimeTool as ComponentType<{ sign?: number; initial?: Record<string, unknown> }>,
    ),
  { ssr: false, loading: () => null },
);

function resolve(
  component: ToolConfig["component"],
  initial?: Record<string, string | number | boolean | undefined>,
) {
  switch (component) {
    case "timestamp":
      return <TimestampTool initial={initial} />;
    case "iso":
      return <IsoTool initial={initial} />;
    case "timezone-converter":
      return <TimezoneConverterTool initial={initial} />;
    case "cron":
      return <CronTool initial={initial} />;
    case "world-clock":
      return <WorldClockTool initial={initial} />;
    case "date-diff":
      return <DateDiffTool initial={initial} />;
    case "duration":
      return <DurationTool initial={initial} />;
    case "shift":
      return <ShiftTool initial={initial} />;
    default:
      return null;
  }
}

export function ToolHost({ config }: { config?: ToolConfig }) {
  if (!config) return null;
  return resolve(config.component, config.initial);
}
