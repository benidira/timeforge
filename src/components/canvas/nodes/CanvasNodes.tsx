"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";

export const InputNode = memo(({ data, isConnectable }: NodeProps) => {
  return (
    <div className="bg-[#050505] border border-line rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.05)] w-64 overflow-hidden relative group transition-colors hover:border-line">
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="px-4 py-3 border-b border-line flex items-center justify-between">
        <h3 className="text-xs font-bold text-fg uppercase tracking-wider">Raw Input</h3>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" />
      </div>
      <div className="p-3 bg-[#0a0a0a]">
        <textarea
          className="w-full bg-[#050505] border border-line rounded-lg p-2 text-xs font-mono text-muted h-24 resize-none focus:outline-none focus:border-line focus:text-fg transition-colors"
          placeholder="Paste raw data here..."
          value={data.value as string || ""}
          onChange={(e) => {
            if (typeof data.onChange === 'function') {
              data.onChange(e.target.value);
            }
          }}
        />
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="w-3 h-3 bg-zinc-400 border-2 border-[#050505]" />
    </div>
  );
});

InputNode.displayName = "InputNode";

export const JsonNode = memo(({ data, isConnectable }: NodeProps) => {
  return (
    <div className="bg-[#050505] border border-indigo-500/30 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.05)] w-64 overflow-hidden relative group transition-colors hover:border-indigo-500/50">
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="w-3 h-3 bg-zinc-400 border-2 border-[#050505]" />
      <div className="px-4 py-3 border-b border-line flex justify-between items-center bg-[#0a0a0a]">
        <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Format JSON</h3>
        {data.error ? <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444]" /> : <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_5px_#6366f1]" />}
      </div>
      <div className="p-4 bg-[#0a0a0a]">
        <p className="text-[10px] text-muted mb-2 uppercase tracking-wider font-semibold">Status Code</p>
        <div className="text-xs font-mono text-fg truncate bg-[#050505] border border-line p-2 rounded-md">
          {data.value ? "200_OK_VALID_JSON" : "WAITING_FOR_STREAM..."}
        </div>
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="w-3 h-3 bg-indigo-500 border-2 border-[#050505] shadow-[0_0_5px_#6366f1]" />
    </div>
  );
});

JsonNode.displayName = "JsonNode";

export const OutputNode = memo(({ data, isConnectable }: NodeProps) => {
  return (
    <div className="bg-[#050505] border border-emerald-500/30 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.05)] w-72 overflow-hidden relative group transition-colors hover:border-emerald-500/50">
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="w-3 h-3 bg-zinc-400 border-2 border-[#050505]" />
      <div className="px-4 py-3 border-b border-line flex items-center justify-between bg-[#0a0a0a]">
        <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Final Output</h3>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981] animate-pulse" />
      </div>
      <div className="p-3 bg-[#0a0a0a]">
        <textarea
          className="w-full bg-field border border-line rounded-lg p-2 text-xs font-mono text-fg h-32 resize-none"
          readOnly
          value={data.value as string || ""}
          placeholder="Result will appear here..."
        />
      </div>
    </div>
  );
});

OutputNode.displayName = "OutputNode";

export const Base64EncodeNode = memo(({ data, isConnectable }: NodeProps) => {
  return (
    <div className="bg-[#050505] border border-orange-500/30 rounded-2xl shadow-[0_0_20px_rgba(249,115,22,0.05)] w-64 overflow-hidden relative group transition-colors hover:border-orange-500/50">
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="w-3 h-3 bg-zinc-400 border-2 border-[#050505]" />
      <div className="px-4 py-3 border-b border-line flex items-center justify-between bg-[#0a0a0a]">
        <h3 className="text-xs font-bold text-orange-500 uppercase tracking-wider">Base64 Encode</h3>
      </div>
      <div className="p-4 bg-[#0a0a0a]">
        <p className="text-[10px] text-muted mb-2 uppercase tracking-wider font-semibold">Status Code</p>
        <div className="text-xs font-mono text-fg truncate bg-[#050505] border border-line p-2 rounded-md">
          {data.value ? "200_OK_ENCODED" : "WAITING_FOR_STREAM..."}
        </div>
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="w-3 h-3 bg-orange-500 border-2 border-[#050505] shadow-[0_0_5px_#f97316]" />
    </div>
  );
});
Base64EncodeNode.displayName = "Base64EncodeNode";

export const Base64DecodeNode = memo(({ data, isConnectable }: NodeProps) => {
  return (
    <div className="bg-[#050505] border border-amber-500/30 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.05)] w-64 overflow-hidden relative group transition-colors hover:border-amber-500/50">
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="w-3 h-3 bg-zinc-400 border-2 border-[#050505]" />
      <div className="px-4 py-3 border-b border-line flex justify-between items-center bg-[#0a0a0a]">
        <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider">Base64 Decode</h3>
        {data.error ? <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444]" /> : <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_#f59e0b]" />}
      </div>
      <div className="p-4 bg-[#0a0a0a]">
        <p className="text-[10px] text-muted mb-2 uppercase tracking-wider font-semibold">Status Code</p>
        <div className="text-xs font-mono text-fg truncate bg-[#050505] border border-line p-2 rounded-md">
          {data.value ? "200_OK_DECODED" : "WAITING_FOR_STREAM..."}
        </div>
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="w-3 h-3 bg-amber-500 border-2 border-[#050505] shadow-[0_0_5px_#f59e0b]" />
    </div>
  );
});
Base64DecodeNode.displayName = "Base64DecodeNode";

export const RegexNode = memo(({ data, isConnectable }: NodeProps) => {
  return (
    <div className="bg-[#050505] border border-pink-500/30 rounded-2xl shadow-[0_0_20px_rgba(236,72,153,0.05)] w-64 overflow-hidden relative group transition-colors hover:border-pink-500/50">
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="w-3 h-3 bg-zinc-400 border-2 border-[#050505]" />
      <div className="px-4 py-3 border-b border-line flex justify-between items-center bg-[#0a0a0a]">
        <h3 className="text-xs font-bold text-pink-500 uppercase tracking-wider">Regex Extractor</h3>
        {data.error ? <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444]" /> : <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_5px_#ec4899]" />}
      </div>
      <div className="p-4 bg-[#0a0a0a]">
        <input 
          type="text" 
          placeholder="e.g. \d+" 
          className="w-full bg-[#050505] border border-line rounded-md p-2 text-xs font-mono mb-3 focus:outline-none focus:border-pink-500 transition-colors text-fg placeholder:text-muted"
          value={(data.pattern as string) || ""}
          onChange={(e) => {
            if (typeof data.onPatternChange === 'function') {
              data.onPatternChange(e.target.value);
            }
          }}
        />
        <div className="text-[10px] text-muted mb-1 uppercase tracking-wider font-semibold">Status Code</div>
        <div className="text-xs font-mono text-fg truncate bg-[#050505] border border-line p-2 rounded-md">
          {data.value ? "200_OK_MATCHED" : "WAITING_FOR_STREAM..."}
        </div>
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="w-3 h-3 bg-pink-500 border-2 border-[#050505] shadow-[0_0_5px_#ec4899]" />
    </div>
  );
});
RegexNode.displayName = "RegexNode";
