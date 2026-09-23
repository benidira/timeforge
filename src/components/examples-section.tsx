import type { ToolExamples } from "@/content/examples";
import { CopyButton } from "./ui/copy-button";

export function ExamplesSection({ examples }: { examples: ToolExamples }) {
  return (
    <section aria-labelledby="examples" className="prose-tf">
      <h2 id="examples">Examples</h2>
      <p>{examples.intro}</p>
      {examples.kind === "io" ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {examples.items.map((item) => (
            <div key={item.title} className="card p-4">
              <h3 className="!mt-0">{item.title}</h3>
              <p className="mt-1 break-words font-mono text-sm">{item.input}</p>
              <dl className="mt-3 space-y-2">
                {item.results.map((r) => (
                  <div key={r.label}>
                    <dt className="text-sm text-muted">{r.label}</dt>
                    <dd className="m-0 break-all font-mono text-sm">{r.value}</dd>
                  </div>
                ))}
              </dl>
              {item.note ? <p className="mt-3 text-sm text-muted">{item.note}</p> : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {examples.items.map((item) => (
            <div key={item.label} className="card p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="!my-0 text-base">{item.label}</h3>
                <CopyButton value={item.code} label={item.label} />
              </div>
              <pre className="code-block">
                <code>{item.code}</code>
              </pre>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
