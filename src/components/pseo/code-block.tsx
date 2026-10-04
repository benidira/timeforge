import { CopyButton } from "@/components/ui/copy-button";

interface CodeBlockProps {
  code: string;
  lang: string;
  expected?: string;
  runtime?: string;
  verifiedOn?: string;
  notes?: string[];
}

export function CodeBlock({
  code,
  lang,
  expected,
  runtime,
  verifiedOn,
  notes,
}: CodeBlockProps) {
  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className="uppercase tracking-wider text-xs font-bold text-muted">
            {lang}
          </span>
          {runtime ? (
            <span className="text-xs text-muted">
              Runtime: <span className="font-mono">{runtime}</span>
            </span>
          ) : null}
          {verifiedOn ? (
            <span className="text-xs text-muted">
              Verified on <span className="font-mono">{verifiedOn}</span>
            </span>
          ) : null}
        </div>
        <CopyButton value={code} label={`${lang} code snippet`} />
      </div>
      <pre className="code-block mt-2 text-xs sm:text-sm overflow-x-auto">
        <code className="font-mono whitespace-pre">{code}</code>
      </pre>
      {expected ? (
        <div className="mt-3 border-t border-line pt-3">
          <p className="text-xs uppercase tracking-wider text-muted font-bold mb-1">
            Expected output
          </p>
          <pre className="code-block text-xs sm:text-sm overflow-x-auto">
            <code className="font-mono whitespace-pre">{expected}</code>
          </pre>
        </div>
      ) : null}
      {notes && notes.length > 0 ? (
        <ul className="mt-3 text-sm text-muted space-y-1 list-disc pl-5">
          {notes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
