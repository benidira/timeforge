"use client";

import { useState } from "react";
import { CopyIcon, FileJsonIcon } from "lucide-react";

export function JsonViewerTool() {
  const [jsonText, setJsonText] = useState("");
  const [parsed, setParsed] = useState<any>(null);
  const [error, setError] = useState("");

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJsonText(text);
      tryParse(text);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonText(e.target.value);
    tryParse(e.target.value);
  };

  const tryParse = (text: string) => {
    if (!text.trim()) {
      setParsed(null);
      setError("");
      return;
    }
    try {
      const obj = JSON.parse(text);
      setParsed(obj);
      setError("");
    } catch (e: any) {
      setError(e.message);
      setParsed(null);
    }
  };

  const formatJson = () => {
    if (parsed) {
      setJsonText(JSON.stringify(parsed, null, 2));
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-fg">Input JSON</label>
            <div className="flex gap-2">
              <button onClick={handlePaste} className="btn btn-secondary btn-sm">Paste</button>
              <button onClick={formatJson} className="btn btn-secondary btn-sm">Format</button>
            </div>
          </div>
          <textarea
            value={jsonText}
            onChange={handleTextChange}
            className="input w-full h-[500px] font-mono text-xs resize-none"
            placeholder="Paste your gigantic JSON here..."
          />
        </div>
        
        <div className="space-y-3">
          <label className="text-sm font-semibold text-fg">Output / Viewer</label>
          <div className="h-[500px] overflow-auto border border-line rounded-lg bg-card p-4">
            {error ? (
              <div className="text-danger text-sm font-mono p-4 bg-danger/10 rounded-md">
                Invalid JSON: {error}
              </div>
            ) : parsed ? (
              <pre className="text-xs font-mono text-fg break-all whitespace-pre-wrap">
                {JSON.stringify(parsed, null, 2)}
              </pre>
            ) : (
              <div className="h-full flex items-center justify-center text-muted flex-col gap-3">
                <FileJsonIcon className="w-8 h-8 opacity-50" />
                <p>Waiting for JSON input...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
