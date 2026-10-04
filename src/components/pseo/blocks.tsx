import type { ContentBlock } from "@/lib/pseo/types";
import { CodeBlock } from "./code-block";

export function Blocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "prose":
            return (
              <section key={i} className="mt-10">
                <h2 className="section-heading">{block.heading}</h2>
                <div className="mt-4 space-y-4">
                  {block.paragraphs.map((p, j) => (
                    <p key={j} className="text-muted leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            );
          case "code":
            return (
              <section key={i} className="mt-10">
                <h2 className="section-heading">{block.heading}</h2>
                <div className="mt-4">
                  <CodeBlock
                    code={block.code}
                    lang={block.lang}
                    expected={block.expected}
                    runtime={block.runtime}
                    verifiedOn={block.verifiedOn}
                    notes={block.notes}
                  />
                </div>
              </section>
            );
          case "table":
            return (
              <section key={i} className="mt-10">
                <h2 className="section-heading">{block.heading}</h2>
                <div className="mt-4 not-prose overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-hover">
                      <tr>
                        {block.head.map((h, j) => (
                          <th
                            key={j}
                            className="px-4 py-3 text-left font-semibold text-muted border-b border-line"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {block.rows.map((row, r) => (
                        <tr key={r} className="border-b border-line">
                          {row.map((cell, c) => (
                            <td key={c} className="px-4 py-3 align-top text-fg">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          case "callouts":
            return (
              <section key={i} className="mt-10">
                <h2 className="section-heading">{block.heading}</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {block.items.map((item, j) => (
                    <div
                      key={j}
                      className="card p-4 border h-full flex flex-col gap-2"
                    >
                      <div className="font-bold text-fg">{item.title}</div>
                      <div className="text-sm text-muted leading-relaxed">
                        {item.body}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          case "steps":
            return (
              <section key={i} className="mt-10">
                <h2 className="section-heading">{block.heading}</h2>
                <ol className="mt-4 space-y-3">
                  {block.steps.map((s, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <span
                        className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-hover text-accent font-semibold flex-shrink-0 mt-0.5"
                        aria-hidden="true"
                      >
                        {j + 1}
                      </span>
                      <div>
                        <strong className="text-fg">{s.name}</strong>
                        <p className="mt-1 text-muted leading-relaxed">
                          {s.text}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            );
          default:
            return null;
        }
      })}
    </>
  );
}
