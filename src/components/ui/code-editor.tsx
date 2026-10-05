"use client";

import dynamic from "next/dynamic";


// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-card/50 border border-line animate-pulse rounded-lg">
      <span className="text-sm font-mono text-muted">Loading Editor...</span>
    </div>
  )
});

interface CodeEditorProps {
  value: string;
  language: string;
  onChange?: (value: string | undefined) => void;
  readOnly?: boolean;
  height?: string;
}

export function CodeEditor({ value, language, onChange, readOnly = false, height = "400px" }: CodeEditorProps) {
  return (
    <div className="w-full rounded-lg overflow-hidden border border-line/60 shadow-inner" style={{ height }}>
      <MonacoEditor
        height="100%"
        language={language}
        theme="vs-dark"
        value={value}
        onChange={onChange}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: "var(--font-geist-mono), monospace",
          lineHeight: 24,
          padding: { top: 16, bottom: 16 },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          formatOnPaste: true,
          wordWrap: "on",
          theme: "vs-dark",
        }}
      />
    </div>
  );
}
