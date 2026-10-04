"use client";

import { DownloadIcon, CopyIcon, CheckIcon, SaveIcon } from "lucide-react";
import { useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";

interface EditorToolbarProps {
  title: string;
  content: string;
  toolSlug: string;
  language: string;
  filename: string;
  onDownload?: () => void; // Optional custom download logic, defaults to standard text blob
}

export function EditorToolbar({ title, content, toolSlug, language, filename, onDownload }: EditorToolbarProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const { saveToolConfig } = useWorkspace();

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    saveToolConfig({ toolSlug, title, content, language });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-line/40 bg-card/40">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-accent/80"></span>
        <span className="ml-1 text-xs font-mono text-muted">{filename}</span>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={handleSave} 
          className="btn btn-secondary py-1 px-2.5 text-xs h-auto min-h-0 flex items-center gap-1.5" 
          title="Save to Workspace"
        >
          {saved ? <CheckIcon className="w-3.5 h-3.5 text-success" /> : <SaveIcon className="w-3.5 h-3.5" />}
          {saved ? "Saved" : "Save"}
        </button>
        <button 
          onClick={handleCopy} 
          className="btn btn-secondary py-1 px-2.5 text-xs h-auto min-h-0 flex items-center gap-1.5" 
          title="Copy to clipboard"
        >
          {copied ? <CheckIcon className="w-3.5 h-3.5 text-success" /> : <CopyIcon className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
        <button 
          onClick={handleDownload} 
          className="btn btn-primary py-1 px-2.5 text-xs h-auto min-h-0 flex items-center gap-1.5" 
          title="Download File"
        >
          <DownloadIcon className="w-3.5 h-3.5" />
          Download
        </button>
      </div>
    </div>
  );
}
