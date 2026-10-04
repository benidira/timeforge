"use client";

import { useState, useMemo } from "react";
import { CopyIcon, CheckIcon, CpuIcon, AlertCircleIcon } from "lucide-react";

const PARAM_PRESETS = [1.5, 3, 8, 14, 32, 70];
const CONTEXT_PRESETS = [4096, 8192, 16384, 32768, 64536, 131072];

const BPW_MAP: Record<string, number> = {
  "Q2_K": 2.6,
  "Q3_K_M": 3.3,
  "Q4_K_S": 4.4,
  "Q4_K_M": 4.8,
  "Q5_K_M": 5.5,
  "Q8_0": 8.0,
  "FP16": 16.0
};

export function GgufVramEstimator() {
  const [params, setParams] = useState<number>(8);
  const [quant, setQuant] = useState<string>("Q4_K_M");
  const [context, setContext] = useState<number>(8192);
  const [flashAttention, setFlashAttention] = useState<boolean>(true);
  const [copied, setCopied] = useState(false);

  const { baseGb, kvGb, totalGb, badge } = useMemo(() => {
    // 1 Billion parameters = ~1GB at 8-bit.
    // Base size = (Params * BPW) / 8 bits
    const base = (params * BPW_MAP[quant]) / 8;
    
    // KV Cache estimation heuristic: ~0.125 GB per 1k context for an 8B model.
    let kv = (context / 1024) * (params / 8) * 0.125;
    
    // Flash attention optimizes activation memory. We simulate this optimization overhead reduction.
    if (flashAttention) {
      kv *= 0.7;
    }

    const overhead = 1.2; // CUDA/Context overhead in GB
    const total = base + kv + overhead;

    let rec = "";
    if (total <= 6) rec = "Fits in 6GB GPU (RTX 3060, Mac 8GB)";
    else if (total <= 8) rec = "Fits in 8GB GPU (RTX 4060, Mac 16GB)";
    else if (total <= 12) rec = "Fits in 12GB GPU (RTX 4070)";
    else if (total <= 16) rec = "Fits in 16GB GPU (RTX 4080, Mac 24GB)";
    else if (total <= 24) rec = "Fits in 24GB GPU (RTX 3090/4090, Mac 32GB)";
    else if (total <= 48) rec = "Fits in Dual 24GB GPUs or Mac 64GB+";
    else rec = "Requires Enterprise Cluster or Mac Studio 128GB+";

    return { baseGb: base, kvGb: kv, totalGb: total, badge: rec };
  }, [params, quant, context, flashAttention]);

  const handleCopy = () => {
    const text = `GGUF Memory Estimate for ${params}B Model (${quant})\n` +
      `- Context: ${context} tokens\n` +
      `- Base Model VRAM: ${baseGb.toFixed(2)} GB\n` +
      `- KV Cache VRAM: ${kvGb.toFixed(2)} GB\n` +
      `- Total VRAM Required: ${totalGb.toFixed(2)} GB\n\n` +
      `Recommendation: ${badge}`;
      
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-start w-full">
      {/* Controls */}
      <div className="lg:col-span-6 card p-6 bg-card/60 shadow-sm border-line/40 space-y-8">
        <div>
          <label className="field-label block text-sm font-bold text-fg mb-3">Model Parameters (Billions)</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {PARAM_PRESETS.map(p => (
              <button 
                key={p} 
                onClick={() => setParams(p)}
                className={`text-sm px-3 py-1.5 rounded-md border transition-colors ${
                  params === p ? "bg-accent/10 border-accent/40 text-accent font-semibold" : "bg-field border-line text-muted hover:border-line/80 hover:text-fg"
                }`}
              >
                {p}B
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="number" min="0.1" step="0.1"
              className="input w-24 bg-field border-line focus:border-accent text-sm"
              value={params}
              onChange={(e) => setParams(parseFloat(e.target.value) || 8)}
            />
            <span className="text-sm text-muted">Billion Parameters</span>
          </div>
        </div>

        <div>
          <label className="field-label block text-sm font-bold text-fg mb-2">Quantization Type</label>
          <select 
            className="input w-full bg-field border-line focus:border-accent text-sm"
            value={quant}
            onChange={(e) => setQuant(e.target.value)}
          >
            {Object.keys(BPW_MAP).map(q => (
              <option key={q} value={q}>{q} (~{BPW_MAP[q]} bits/weight)</option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label block text-sm font-bold text-fg mb-3">Context Window Size</label>
          <div className="flex flex-wrap gap-2">
            {CONTEXT_PRESETS.map(c => (
              <button 
                key={c} 
                onClick={() => setContext(c)}
                className={`text-sm px-3 py-1.5 rounded-md border transition-colors ${
                  context === c ? "bg-accent/10 border-accent/40 text-accent font-semibold" : "bg-field border-line text-muted hover:border-line/80 hover:text-fg"
                }`}
              >
                {c / 1024}k
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-line/40 pt-6">
          <button 
            role="switch"
            aria-checked={flashAttention}
            onClick={() => setFlashAttention(!flashAttention)}
            className={`w-11 h-6 rounded-full p-1 transition-colors ${flashAttention ? "bg-accent" : "bg-line/50"}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${flashAttention ? "translate-x-5" : "translate-x-0"}`}></div>
          </button>
          <label className="text-sm font-bold text-fg cursor-pointer" onClick={() => setFlashAttention(!flashAttention)}>
            Enable Flash Attention <span className="text-xs font-normal text-muted block">Reduces peak activation/KV memory overhead.</span>
          </label>
        </div>
      </div>

      {/* Results Dashboard */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        <div className="card p-6 bg-card/60 border-line/40 shadow-sm flex flex-col items-center justify-center text-center">
          <CpuIcon className="w-10 h-10 text-accent mb-4 opacity-80" />
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">Total Estimated VRAM</h3>
          <div className="text-5xl font-black text-fg tracking-tight mb-2">
            {totalGb.toFixed(2)} <span className="text-2xl text-muted">GB</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold mt-2">
            <CheckIcon className="w-4 h-4" />
            {badge}
          </div>
        </div>

        <div className="card p-6 bg-hover/30 border-line/30 space-y-4">
          <h3 className="text-sm font-bold text-fg mb-4">Memory Breakdown</h3>
          
          <div className="flex justify-between items-center text-sm border-b border-line/40 pb-2">
            <span className="text-muted">Base Model Size ({quant})</span>
            <span className="font-mono font-medium text-fg">{baseGb.toFixed(2)} GB</span>
          </div>
          
          <div className="flex justify-between items-center text-sm border-b border-line/40 pb-2">
            <span className="text-muted">KV Cache ({context} tokens)</span>
            <span className="font-mono font-medium text-fg">{kvGb.toFixed(2)} GB</span>
          </div>
          
          <div className="flex justify-between items-center text-sm border-b border-line/40 pb-2">
            <span className="text-muted">CUDA / System Overhead</span>
            <span className="font-mono font-medium text-fg">1.20 GB</span>
          </div>

          <div className="pt-4 flex items-start gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20 text-warning text-sm">
            <AlertCircleIcon className="w-5 h-5 shrink-0 mt-0.5" />
            <p>Estimates are approximate. Real-world usage depends on the specific inference engine (llama.cpp, ExLlamaV2) and operating system overhead.</p>
          </div>
        </div>

        <button onClick={handleCopy} className="btn btn-secondary w-full h-12 flex justify-center items-center gap-2 mt-2">
          {copied ? <CheckIcon className="w-4 h-4 text-success" /> : <CopyIcon className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy Breakdown Report"}
        </button>
      </div>
    </div>
  );
}
