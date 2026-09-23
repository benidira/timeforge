import type { ResultRowData } from "@/lib/time";
import { CopyButton } from "./copy-button";

function Rows({ rows }: { rows: ResultRowData[] }) {
  return (
    <dl>
      {rows.map((row) => (
        <div className="result-row" key={row.id}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
          <CopyButton value={row.value} label={row.label} />
        </div>
      ))}
    </dl>
  );
}

/** Label / value rows with a Copy button each. Rows that share a `group` get a sub-heading. */
export function ResultList({ rows }: { rows: ResultRowData[] }) {
  const sections: { group?: string; rows: ResultRowData[] }[] = [];
  for (const row of rows) {
    const last = sections[sections.length - 1];
    if (last && last.group === row.group) last.rows.push(row);
    else sections.push({ group: row.group, rows: [row] });
  }

  return (
    <div className="result-list">
      {sections.map((s, i) => (
        <div key={`${s.group ?? "main"}-${i}`}>
          {s.group ? <h3 className="result-group">{s.group}</h3> : null}
          <Rows rows={s.rows} />
        </div>
      ))}
    </div>
  );
}
