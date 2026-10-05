"use client";

import { memo, useCallback } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";

export const InputNode = memo(({ data, isConnectable }: NodeProps) => {
  return (
    <div className="bg-card border border-line rounded-xl shadow-lg w-64 overflow-hidden">
      <div className="bg-primary/10 px-4 py-2 border-b border-line">
        <h3 className="text-sm font-semibold text-primary">Raw Input</h3>
      </div>
      <div className="p-4">
        <textarea
          className="w-full bg-field border border-line rounded-lg p-2 text-xs font-mono text-fg h-24 resize-none focus:outline-none focus:border-primary"
          placeholder="Paste raw data here..."
          value={data.value as string || ""}
          onChange={(e) => {
            if (typeof data.onChange === 'function') {
              data.onChange(e.target.value);
            }
          }}
        />
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="w-3 h-3 bg-primary border-2 border-bg" />
    </div>
  );
});

InputNode.displayName = "InputNode";

export const JsonNode = memo(({ data, isConnectable }: NodeProps) => {
  return (
    <div className="bg-card border border-line rounded-xl shadow-lg w-64 overflow-hidden">
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="w-3 h-3 bg-accent border-2 border-bg" />
      <div className="bg-accent/10 px-4 py-2 border-b border-line flex justify-between items-center">
        <h3 className="text-sm font-semibold text-accent">Format JSON</h3>
        {data.error ? <span className="text-[10px] text-red-500 font-bold">ERROR</span> : <span className="text-[10px] text-emerald-500 font-bold">OK</span>}
      </div>
      <div className="p-4">
        <p className="text-xs text-muted mb-2">Parses and formats JSON data.</p>
        <div className="text-[10px] font-mono text-muted truncate">
          Out: {data.value ? "Valid JSON object" : "Waiting for input..."}
        </div>
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="w-3 h-3 bg-primary border-2 border-bg" />
    </div>
  );
});

JsonNode.displayName = "JsonNode";

export const OutputNode = memo(({ data, isConnectable }: NodeProps) => {
  return (
    <div className="bg-card border border-line rounded-xl shadow-lg w-72 overflow-hidden">
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="w-3 h-3 bg-accent border-2 border-bg" />
      <div className="bg-emerald-500/10 px-4 py-2 border-b border-line">
        <h3 className="text-sm font-semibold text-emerald-500">Output Result</h3>
      </div>
      <div className="p-4">
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
    <div className="bg-card border border-line rounded-xl shadow-lg w-64 overflow-hidden">
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="w-3 h-3 bg-accent border-2 border-bg" />
      <div className="bg-orange-500/10 px-4 py-2 border-b border-line">
        <h3 className="text-sm font-semibold text-orange-500">Base64 Encode</h3>
      </div>
      <div className="p-4">
        <p className="text-xs text-muted mb-2">Encodes string to Base64.</p>
        <div className="text-[10px] font-mono text-muted truncate">
          Out: {data.value ? "Encoded string" : "Waiting..."}
        </div>
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="w-3 h-3 bg-primary border-2 border-bg" />
    </div>
  );
});
Base64EncodeNode.displayName = "Base64EncodeNode";

export const Base64DecodeNode = memo(({ data, isConnectable }: NodeProps) => {
  return (
    <div className="bg-card border border-line rounded-xl shadow-lg w-64 overflow-hidden">
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="w-3 h-3 bg-accent border-2 border-bg" />
      <div className="bg-amber-500/10 px-4 py-2 border-b border-line flex justify-between items-center">
        <h3 className="text-sm font-semibold text-amber-500">Base64 Decode</h3>
        {data.error ? <span className="text-[10px] text-red-500 font-bold">ERR</span> : null}
      </div>
      <div className="p-4">
        <p className="text-xs text-muted mb-2">Decodes Base64 to string.</p>
        <div className="text-[10px] font-mono text-muted truncate">
          Out: {data.value ? "Decoded string" : "Waiting..."}
        </div>
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="w-3 h-3 bg-primary border-2 border-bg" />
    </div>
  );
});
Base64DecodeNode.displayName = "Base64DecodeNode";

export const RegexNode = memo(({ data, isConnectable }: NodeProps) => {
  return (
    <div className="bg-card border border-line rounded-xl shadow-lg w-64 overflow-hidden">
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="w-3 h-3 bg-accent border-2 border-bg" />
      <div className="bg-pink-500/10 px-4 py-2 border-b border-line flex justify-between items-center">
        <h3 className="text-sm font-semibold text-pink-500">Regex Extractor</h3>
        {data.error ? <span className="text-[10px] text-red-500 font-bold">ERR</span> : null}
      </div>
      <div className="p-4">
        <input 
          type="text" 
          placeholder="e.g. \d+" 
          className="w-full bg-field border border-line rounded p-1.5 text-xs font-mono mb-2 focus:outline-none focus:border-pink-500"
          value={(data.pattern as string) || ""}
          onChange={(e) => {
            if (typeof data.onPatternChange === 'function') {
              data.onPatternChange(e.target.value);
            }
          }}
        />
        <div className="text-[10px] font-mono text-muted truncate">
          Out: {data.value ? "Matches array" : "Waiting..."}
        </div>
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="w-3 h-3 bg-primary border-2 border-bg" />
    </div>
  );
});
RegexNode.displayName = "RegexNode";
