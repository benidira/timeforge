"use client";

import { useState } from "react";
import { DownloadIcon, CopyIcon, CheckIcon, PlusIcon, TrashIcon } from "lucide-react";
import { CodeEditor } from "@/components/ui/code-editor";
import { EditorToolbar } from "@/components/ui/editor-toolbar";

interface EnvVar {
  id: string;
  key: string;
  value: string;
}

interface Preset {
  name: string;
  command: string;
  args: string[];
  env: EnvVar[];
}

const PRESETS: Record<string, Preset> = {
  "Filesystem": {
    name: "Filesystem",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem", "/Users/username/Desktop"],
    env: []
  },
  "GitHub": {
    name: "GitHub",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-github"],
    env: [{ id: "1", key: "GITHUB_PERSONAL_ACCESS_TOKEN", value: "<YOUR_TOKEN>" }]
  },
  "Postgres": {
    name: "Postgres",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-postgres", "postgresql://localhost/mydb"],
    env: []
  },
  "Fetch / Web Search": {
    name: "Fetch / Web Search",
    command: "uvx",
    args: ["mcp-server-fetch"],
    env: []
  }
};

export function McpConfigBuilder() {
  const [serverId, setServerId] = useState("my-mcp-server");
  const [command, setCommand] = useState("npx");
  const [args, setArgs] = useState<string[]>(["-y", "@modelcontextprotocol/server-filesystem", "/"]);
  const [env, setEnv] = useState<EnvVar[]>([]);
  const [newArg, setNewArg] = useState("");
  const [copied, setCopied] = useState(false);

  const applyPreset = (presetKey: string) => {
    const preset = PRESETS[presetKey];
    if (preset) {
      setServerId(preset.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
      setCommand(preset.command);
      setArgs(preset.args);
      setEnv(preset.env);
    }
  };

  const addArg = () => {
    if (newArg.trim()) {
      setArgs([...args, newArg.trim()]);
      setNewArg("");
    }
  };

  const removeArg = (index: number) => {
    setArgs(args.filter((_, i) => i !== index));
  };

  const addEnv = () => {
    setEnv([...env, { id: Math.random().toString(), key: "", value: "" }]);
  };

  const updateEnv = (id: string, field: "key" | "value", val: string) => {
    setEnv(env.map(e => e.id === id ? { ...e, [field]: val } : e));
  };

  const removeEnv = (id: string) => {
    setEnv(env.filter(e => e.id !== id));
  };

  const generateJson = () => {
    const envObj: Record<string, string> = {};
    env.forEach(e => {
      if (e.key.trim()) envObj[e.key.trim()] = e.value;
    });

    const config = {
      mcpServers: {
        [serverId.trim() || "mcp-server"]: {
          command: command.trim(),
          args: args,
          ...(Object.keys(envObj).length > 0 && { env: envObj })
        }
      }
    };
    return JSON.stringify(config, null, 2);
  };

  const outputContent = generateJson();

  const handleCopy = () => {
    navigator.clipboard.writeText(outputContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([outputContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "claude_desktop_config.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-start w-full">
      {/* Controls */}
      <div className="lg:col-span-5 card p-6 bg-card/60 shadow-sm border-line/40 space-y-6">
        <div>
          <label className="field-label block text-sm font-bold text-fg mb-3">Quick Presets</label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(PRESETS).map(key => (
              <button 
                key={key} 
                onClick={() => applyPreset(key)}
                className="text-xs px-3 py-1.5 rounded-md border bg-field border-line text-muted hover:border-line/80 hover:text-fg transition-colors"
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-line/40 pt-6">
          <label className="field-label block text-sm font-bold text-fg mb-2">Server ID / Name</label>
          <input 
            type="text" className="input w-full bg-field border-line focus:border-accent font-mono text-sm"
            value={serverId} onChange={e => setServerId(e.target.value)}
            placeholder="e.g., github-tools"
          />
        </div>

        <div>
          <label className="field-label block text-sm font-bold text-fg mb-2">Command Executable</label>
          <input 
            type="text" className="input w-full bg-field border-line focus:border-accent font-mono text-sm"
            value={command} onChange={e => setCommand(e.target.value)}
            placeholder="e.g., npx, node, python, uvx"
          />
        </div>

        <div>
          <label className="field-label block text-sm font-bold text-fg mb-2">Command Arguments (args)</label>
          <div className="flex gap-2 mb-3">
            <input 
              type="text" 
              placeholder="e.g. -y @modelcontextprotocol/server-postgres"
              className="input flex-1 bg-field border-line focus:border-accent text-sm font-mono"
              value={newArg}
              onChange={e => setNewArg(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addArg()}
            />
            <button onClick={addArg} className="btn btn-secondary px-3">
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
          {args.length > 0 && (
            <div className="flex flex-col gap-2">
              {args.map((arg, idx) => (
                <div key={idx} className="flex items-center justify-between px-3 py-2 rounded-md bg-hover text-xs font-mono border border-line">
                  <span className="truncate mr-2">{arg}</span>
                  <button onClick={() => removeArg(idx)} className="text-muted hover:text-danger shrink-0">
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="field-label block text-sm font-bold text-fg">Environment Variables</label>
            <button onClick={addEnv} className="text-xs text-accent font-semibold flex items-center gap-1 hover:underline">
              <PlusIcon className="w-3 h-3" /> Add Var
            </button>
          </div>
          <div className="space-y-3">
            {env.length === 0 && <p className="text-xs text-muted italic">No environment variables added.</p>}
            {env.map(e => (
              <div key={e.id} className="flex gap-2 items-start">
                <input 
                  type="text" placeholder="KEY" 
                  className="input flex-1 bg-field border-line focus:border-accent text-xs font-mono h-9 px-2"
                  value={e.key} onChange={ev => updateEnv(e.id, "key", ev.target.value)}
                />
                <input 
                  type="text" placeholder="VALUE" 
                  className="input flex-1 bg-field border-line focus:border-accent text-xs font-mono h-9 px-2"
                  value={e.value} onChange={ev => updateEnv(e.id, "value", ev.target.value)}
                />
                <button onClick={() => removeEnv(e.id)} className="h-9 px-2 text-muted hover:text-danger flex items-center justify-center bg-hover rounded-md border border-line shrink-0">
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="lg:col-span-7 card bg-hover/30 border-line/30 flex flex-col h-[600px] sticky top-24 overflow-hidden">
        <EditorToolbar 
          title="MCP Config"
          content={outputContent}
          toolSlug="mcp-config-builder"
          language="json"
          filename="claude_desktop_config.json"
        />
        <div className="flex-1 bg-black/40 relative">
          <CodeEditor 
            value={outputContent}
            language="json"
            readOnly={true}
            height="100%"
          />
        </div>
      </div>
    </div>
  );
}
