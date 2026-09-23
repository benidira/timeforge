import { IsoToUnixTool } from "./iso-to-unix-tool";
import { TimestampTool } from "./timestamp-tool";

/** Combines the two existing, individually-tested ISO 8601 directions into one comprehensive tool. */
export function Iso8601ConverterTool() {
  return (
    <div className="grid gap-8">
      <section aria-labelledby="iso-to-unix-h">
        <h2 id="iso-to-unix-h" className="mb-3 text-lg font-semibold">
          ISO 8601 to Unix time
        </h2>
        <IsoToUnixTool />
      </section>
      <section aria-labelledby="unix-to-iso-h">
        <h2 id="unix-to-iso-h" className="mb-3 text-lg font-semibold">
          Unix time to ISO 8601
        </h2>
        <TimestampTool variant="toIso" />
      </section>
    </div>
  );
}
