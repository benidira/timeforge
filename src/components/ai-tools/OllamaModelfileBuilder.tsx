"use client";

import { useState } from "react";
import { DownloadIcon, CopyIcon, CheckIcon, PlusIcon, XIcon } from "lucide-react";
import { CodeEditor } from "@/components/ui/code-editor";
import { EditorToolbar } from "@/components/ui/editor-toolbar";

const MODELS = ["llama3.1", "mistral", "qwen2.5", "phi3", "gemma2", "deepseek-coder", "llava"];
const CONTEXT_WINDOWS = [2048, 4096, 8192, 16384, 32768, 131072];

export function OllamaModelfileBuilder() {
  const [baseModel, setBaseModel] = useState("llama3.1");
  const [systemPrompt, setSystemPrompt] = useState("You are a helpful and precise AI assistant.");
  const [temperature, setTemperature] = useState<number>(0.7);
  const [topP, setTopP] = useState<number>(0.9);
  const [numCtx, setNumCtx] = useState<number>(4096);
  const [stopSequences, setStopSequences] = useState<string[]>([]);
  const [newStop, setNewStop] = useState("");
  const [copied, setCopied] = useState(false);

  const addStopSequence = () => {
    if (newStop.trim() && !stopSequences.includes(newStop.trim())) {
      setStopSequences([...stopSequences, newStop.trim()]);
      setNewStop("");
    }
  };

  const removeStopSequence = (seq: string) => {
    setStopSequences(stopSequences.filter(s => s !== seq));
  };

  const generateModelfile = () => {
    let output = `FROM ${baseModel}\n\n`;
    output += `# Generation parameters\n`;
    output += `PARAMETER temperature ${temperature}\n`;
    output += `PARAMETER top_p ${topP}\n`;
    output += `PARAMETER num_ctx ${numCtx}\n`;
    
    if (stopSequences.length > 0) {
      stopSequences.forEach(seq => {
        output += `PARAMETER stop "${seq}"\n`;
      });
    }

    if (systemPrompt.trim()) {
      output += `\n# System prompt\n`;
      output += `SYSTEM """\n${systemPrompt.trim()}\n"""\n`;
    }

    return output;
  };

  const outputContent = generateModelfile();

  const handleCopy = () => {
    navigator.clipboard.writeText(outputContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([outputContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Modelfile";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start w-full">
      {/* Controls */}
      <div className="card p-6 bg-card/60 shadow-sm border-line/40 space-y-6">
        <div>
          <label className="field-label block text-sm font-bold text-fg mb-2">Base Model</label>
          <select 
            className="input w-full bg-field border-line focus:border-accent"
            value={baseModel}
            onChange={e => setBaseModel(e.target.value)}
          >
            {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div>
          <label className="field-label block text-sm font-bold text-fg mb-2">System Prompt</label>
          <textarea
            className="input w-full min-h-[100px] bg-field border-line focus:border-accent resize-y text-sm font-mono"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="flex justify-between text-sm font-bold text-fg mb-2">
              Temperature <span className="text-muted font-normal">{temperature}</span>
            </label>
            <input 
              type="range" min="0" max="1" step="0.1" 
              className="w-full accent-accent"
              value={temperature} onChange={e => setTemperature(parseFloat(e.target.value))}
            />
            <p className="text-xs text-muted mt-1">Higher = more creative</p>
          </div>
          <div>
            <label className="flex justify-between text-sm font-bold text-fg mb-2">
              Top P <span className="text-muted font-normal">{topP}</span>
            </label>
            <input 
              type="range" min="0" max="1" step="0.05" 
              className="w-full accent-accent"
              value={topP} onChange={e => setTopP(parseFloat(e.target.value))}
            />
            <p className="text-xs text-muted mt-1">Controls diversity</p>
          </div>
        </div>

        <div>
          <label className="field-label block text-sm font-bold text-fg mb-2">Context Window (num_ctx)</label>
          <select 
            className="input w-full bg-field border-line focus:border-accent"
            value={numCtx}
            onChange={e => setNumCtx(parseInt(e.target.value, 10))}
          >
            {CONTEXT_WINDOWS.map(ctx => <option key={ctx} value={ctx}>{ctx} tokens</option>)}
          </select>
        </div>

        <div>
          <label className="field-label block text-sm font-bold text-fg mb-2">Stop Sequences</label>
          <div className="flex gap-2 mb-3">
            <input 
              type="text" 
              placeholder="e.g. <|im_end|>"
              className="input flex-1 bg-field border-line focus:border-accent text-sm font-mono"
              value={newStop}
              onChange={e => setNewStop(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addStopSequence()}
            />
            <button onClick={addStopSequence} className="btn btn-secondary px-3">
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
          {stopSequences.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {stopSequences.map(seq => (
                <div key={seq} className="flex items-center gap-1.5 px-2 py-1 rounded bg-hover text-xs font-mono border border-line">
                  {seq}
                  <button onClick={() => removeStopSequence(seq)} className="text-muted hover:text-danger">
                    <XIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="card bg-hover/30 border-line/30 flex flex-col h-[600px] sticky top-24 overflow-hidden">
        <EditorToolbar 
          title="Ollama Modelfile"
          content={outputContent}
          toolSlug="ollama-modelfile-builder"
          language="dockerfile"
          filename="Modelfile"
        />
        <div className="flex-1 bg-black/40 relative">
          <CodeEditor 
            value={outputContent}
            language="dockerfile"
            readOnly={true}
            height="100%"
          />
        </div>
      </div>
    </div>
  );
}
