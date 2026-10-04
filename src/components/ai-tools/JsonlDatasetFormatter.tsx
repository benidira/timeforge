"use client";

import { useState, useMemo } from "react";
import { DownloadIcon, CopyIcon, CheckIcon, RefreshCwIcon } from "lucide-react";

type FormatMode = "chat" | "completion";

interface ParsedLine {
  originalIndex: number;
  content: string;
  isValid: boolean;
  error?: string;
}

export function JsonlDatasetFormatter() {
  const [formatMode, setFormatMode] = useState<FormatMode>("chat");
  const [inputRaw, setInputRaw] = useState("[\n  {\n    \"messages\": [\n      {\"role\": \"system\", \"content\": \"You are a helper\"},\n      {\"role\": \"user\", \"content\": \"Hi\"},\n      {\"role\": \"assistant\", \"content\": \"Hello!\"}\n    ]\n  }\n]");
  const [copied, setCopied] = useState(false);

  const { parsedLines, validCount, errorCount, estimatedTokens } = useMemo(() => {
    let textToParse = inputRaw.trim();
    if (!textToParse) return { parsedLines: [], validCount: 0, errorCount: 0, estimatedTokens: 0 };

    let items: any[] = [];
    let linesMode = false;

    // First try to see if it's a JSON array
    try {
      const parsedArray = JSON.parse(textToParse);
      if (Array.isArray(parsedArray)) {
        items = parsedArray;
      } else {
        throw new Error("Not an array");
      }
    } catch {
      // Not a JSON array, treat as loose JSON lines
      items = textToParse.split("\n").filter(l => l.trim().length > 0);
      linesMode = true;
    }

    const lines: ParsedLine[] = [];
    let validCount = 0;
    let errorCount = 0;
    let charCount = 0;

    items.forEach((item, index) => {
      let obj: any;
      let error = "";
      let valid = false;

      try {
        obj = linesMode ? JSON.parse(item) : item;
        
        if (formatMode === "chat") {
          if (!obj.messages || !Array.isArray(obj.messages)) {
            error = "Missing 'messages' array.";
          } else {
            const hasRoles = obj.messages.every((m: any) => m.role && m.content);
            if (!hasRoles) error = "Messages must have 'role' and 'content' keys.";
            else valid = true;
          }
        } else {
          if (typeof obj.prompt !== "string" || typeof obj.completion !== "string") {
            error = "Missing 'prompt' or 'completion' string keys.";
          } else {
            valid = true;
          }
        }
      } catch (e: any) {
        error = `Invalid JSON syntax: ${e.message}`;
      }

      if (valid) validCount++;
      else errorCount++;

      const content = obj ? JSON.stringify(obj) : item;
      charCount += content.length;

      lines.push({
        originalIndex: index + 1,
        content: valid ? content : (typeof item === 'string' ? item : JSON.stringify(item)),
        isValid: valid,
        error
      });
    });

    return { 
      parsedLines: lines, 
      validCount, 
      errorCount, 
      estimatedTokens: Math.floor(charCount / 4) 
    };
  }, [inputRaw, formatMode]);

  const outputContent = parsedLines.map(l => l.content).join("\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(outputContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([outputContent], { type: "application/jsonl" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dataset.jsonl";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const insertExample = () => {
    if (formatMode === "chat") {
      setInputRaw(`{"messages": [{"role": "system", "content": "Marv is a chatbot that reluctantly answers questions with sarcastic responses."}, {"role": "user", "content": "How many pounds are in a kilogram?"}, {"role": "assistant", "content": "This again? There are 2.2 pounds in a kilogram. Please make a note of this."}]}`);
    } else {
      setInputRaw(`{"prompt": "Translate English to French: Hello", "completion": "Bonjour"}`);
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-start w-full">
      {/* Controls */}
      <div className="lg:col-span-6 card p-6 bg-card/60 shadow-sm border-line/40 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <label className="field-label block text-sm font-bold text-fg">Input Data</label>
          <div className="flex gap-1 bg-field p-1 rounded-lg border border-line">
            <button
              onClick={() => setFormatMode("chat")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                formatMode === "chat" ? "bg-accent text-white" : "text-muted hover:text-fg"
              }`}
            >
              Chat Format
            </button>
            <button
              onClick={() => setFormatMode("completion")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                formatMode === "completion" ? "bg-accent text-white" : "text-muted hover:text-fg"
              }`}
            >
              Prompt / Completion
            </button>
          </div>
        </div>

        <p className="text-xs text-muted mb-3">Paste a JSON array, or newline-separated JSON objects.</p>
        <textarea
          className="input w-full flex-1 min-h-[300px] bg-field border-line focus:border-accent font-mono text-sm leading-relaxed p-4 whitespace-pre"
          value={inputRaw}
          onChange={(e) => setInputRaw(e.target.value)}
          placeholder={formatMode === "chat" ? `[{"messages": [{"role": "user", "content": "..."}]}]` : `[{"prompt": "...", "completion": "..."}]`}
        />
        <button onClick={insertExample} className="text-xs text-accent mt-3 hover:underline text-left self-start">
          Insert Example Format
        </button>
      </div>

      {/* Output & Validator */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-4 bg-card/60 border-line/40 text-center">
            <div className="text-2xl font-black text-fg">{validCount}</div>
            <div className="text-xs text-muted font-medium mt-1 uppercase">Valid Lines</div>
          </div>
          <div className="card p-4 bg-card/60 border-line/40 text-center">
            <div className="text-2xl font-black text-danger">{errorCount}</div>
            <div className="text-xs text-muted font-medium mt-1 uppercase">Errors</div>
          </div>
          <div className="card p-4 bg-card/60 border-line/40 text-center">
            <div className="text-2xl font-black text-accent">{estimatedTokens.toLocaleString()}</div>
            <div className="text-xs text-muted font-medium mt-1 uppercase">Est. Tokens</div>
          </div>
        </div>

        <div className="card bg-hover/30 border-line/30 flex flex-col h-[500px]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-line/40 bg-card/40">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-success/80"></span>
              <span className="ml-2 text-xs font-mono text-muted">dataset.jsonl</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleCopy} disabled={validCount === 0 || errorCount > 0} className="btn btn-secondary py-1 px-2.5 text-xs h-auto min-h-0 flex items-center gap-1.5 disabled:opacity-50">
                {copied ? <CheckIcon className="w-3.5 h-3.5 text-success" /> : <CopyIcon className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button onClick={handleDownload} disabled={validCount === 0 || errorCount > 0} className="btn btn-primary py-1 px-2.5 text-xs h-auto min-h-0 flex items-center gap-1.5 disabled:opacity-50">
                <DownloadIcon className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 bg-black/40 text-sm font-mono whitespace-pre-wrap flex flex-col gap-1.5">
            {parsedLines.length === 0 && <span className="text-muted italic">Waiting for input...</span>}
            {parsedLines.map((line, idx) => (
              <div key={idx} className={`p-2 rounded border break-all ${line.isValid ? "bg-success/5 border-success/20 text-success/90" : "bg-danger/10 border-danger/30 text-danger/90"}`}>
                <div className="text-fg/90">{line.content}</div>
                {!line.isValid && <div className="text-xs text-danger font-bold mt-1">Error Line {line.originalIndex}: {line.error}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
