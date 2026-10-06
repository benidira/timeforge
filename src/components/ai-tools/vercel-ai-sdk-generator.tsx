/* eslint-disable */
"use client";

import { useState } from "react";
import { CopyIcon, CheckIcon, DownloadIcon } from "lucide-react";
import { CodeEditor } from "@/components/ui/code-editor";
import { EditorToolbar } from "@/components/ui/editor-toolbar";
import { useKeyManager } from "@/context/key-manager-context";

type Provider = "OpenAI" | "Anthropic" | "Google Gemini" | "Ollama";
type Mode = "Stream UI (useChat)" | "Text Generation" | "Object Generation";

export function VercelAiSdkGenerator() {
  const [provider, setProvider] = useState<Provider>("OpenAI");
  const [mode, setMode] = useState<Mode>("Stream UI (useChat)");
  const [modelName, setModelName] = useState("gpt-4o");
  const [activeTab, setActiveTab] = useState<"api" | "client" | "playground">("api");
  const [copied, setCopied] = useState(false);
  const { keys, setKeyModalOpen } = useKeyManager();

  // Playground state
  const [messages, setMessages] = useState<{id: string, role: string, content: string}[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { id: Date.now().toString(), role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/playground/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-openai-key": keys.openai,
          "x-anthropic-key": keys.anthropic
        },
        body: JSON.stringify({
          system: "You are a helpful AI assistant. Answer accurately and concisely.",
          provider: provider === "Anthropic" ? "anthropic" : "openai",
          messages: newMessages
        })
      });

      if (!response.ok) throw new Error(await response.text());

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMsg = "";
      
      setMessages([...newMessages, { id: (Date.now() + 1).toString(), role: "assistant", content: "" }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              assistantMsg += JSON.parse(line.substring(2));
              setMessages(prev => {
                const latest = [...prev];
                latest[latest.length - 1].content = assistantMsg;
                return latest;
              });
            } catch (e) {}
          }
        }
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: "Error: " + err.message }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getProviderSetup = () => {
    switch (provider) {
      case "OpenAI":
        return { import: `import { openai } from '@ai-sdk/openai';`, init: `openai('${modelName}')` };
      case "Anthropic":
        return { import: `import { anthropic } from '@ai-sdk/anthropic';`, init: `anthropic('${modelName || "claude-3-5-sonnet-20240620"}')` };
      case "Google Gemini":
        return { import: `import { google } from '@ai-sdk/google';`, init: `google('${modelName || "gemini-1.5-pro"}')` };
      case "Ollama":
        return { import: `import { createOllama } from 'ollama-ai-provider';\nconst ollama = createOllama();`, init: `ollama('${modelName || "llama3.1"}')` };
    }
  };

  const generateApiCode = () => {
    const setup = getProviderSetup();
    if (mode === "Stream UI (useChat)") {
      return `import { streamText } from 'ai';\n${setup.import}\n\nexport const maxDuration = 30;\n\nexport async function POST(req: Request) {\n  const { messages } = await req.json();\n\n  const result = await streamText({\n    model: ${setup.init},\n    messages,\n  });\n\n  return result.toDataStreamResponse();\n}`;
    } else if (mode === "Text Generation") {
      return `import { generateText } from 'ai';\n${setup.import}\n\nexport async function POST(req: Request) {\n  const { prompt } = await req.json();\n\n  const { text } = await generateText({\n    model: ${setup.init},\n    prompt,\n  });\n\n  return Response.json({ text });\n}`;
    } else {
      return `import { generateObject } from 'ai';\n${setup.import}\nimport { z } from 'zod';\n\nexport async function POST(req: Request) {\n  const { prompt } = await req.json();\n\n  const { object } = await generateObject({\n    model: ${setup.init},\n    schema: z.object({\n      recipe: z.object({\n        name: z.string(),\n        ingredients: z.array(z.string()),\n      }),\n    }),\n    prompt,\n  });\n\n  return Response.json(object);\n}`;
    }
  };

  const generateClientCode = () => {
    if (mode === "Stream UI (useChat)") {
      return `"use client";\n\nimport { useChat } from 'ai/react';\n\nexport default function Chat() {\n  const { messages, input, handleInputChange, handleSubmit } = useChat();\n\n  return (\n    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">\n      {messages.map(m => (\n        <div key={m.id} className="whitespace-pre-wrap">\n          {m.role === 'user' ? 'User: ' : 'AI: '}\n          {m.content}\n        </div>\n      ))}\n\n      <form onSubmit={handleSubmit}>\n        <input\n          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"\n          value={input}\n          placeholder="Say something..."\n          onChange={handleInputChange}\n        />\n      </form>\n    </div>\n  );\n}`;
    } else if (mode === "Text Generation") {
      return `"use client";\n\nimport { useState } from 'react';\n\nexport default function Page() {\n  const [prompt, setPrompt] = useState('');\n  const [result, setResult] = useState('');\n\n  const generate = async () => {\n    const response = await fetch('/api/chat', {\n      method: 'POST',\n      body: JSON.stringify({ prompt }),\n    });\n    const data = await response.json();\n    setResult(data.text);\n  };\n\n  return (\n    <div className="p-4 flex flex-col gap-4 max-w-md mx-auto">\n      <input\n        value={prompt}\n        onChange={e => setPrompt(e.target.value)}\n        className="border p-2 rounded"\n        placeholder="Enter prompt..."\n      />\n      <button onClick={generate} className="bg-blue-500 text-white p-2 rounded">\n        Generate\n      </button>\n      <div className="mt-4 whitespace-pre-wrap">{result}</div>\n    </div>\n  );\n}`;
    } else {
      return `"use client";\n\nimport { useState } from 'react';\n\nexport default function Page() {\n  const [prompt, setPrompt] = useState('');\n  const [object, setObject] = useState<any>(null);\n\n  const generate = async () => {\n    const response = await fetch('/api/chat', {\n      method: 'POST',\n      body: JSON.stringify({ prompt }),\n    });\n    const data = await response.json();\n    setObject(data);\n  };\n\n  return (\n    <div className="p-4 flex flex-col gap-4 max-w-md mx-auto">\n      <input\n        value={prompt}\n        onChange={e => setPrompt(e.target.value)}\n        className="border p-2 rounded"\n        placeholder="Suggest a recipe for..."\n      />\n      <button onClick={generate} className="bg-green-500 text-white p-2 rounded">\n        Generate Object\n      </button>\n      {object && (\n        <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto">\n          {JSON.stringify(object, null, 2)}\n        </pre>\n      )}\n    </div>\n  );\n}`;
    }
  };

  const outputCode = activeTab === "api" ? generateApiCode() : generateClientCode();

  const handleCopy = () => {
    navigator.clipboard.writeText(outputCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = activeTab === "api" ? "route.ts" : "page.tsx";
    const blob = new Blob([outputCode], { type: "text/plain" });
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
    <div className="grid lg:grid-cols-2 gap-8 items-start w-full">
      <div className="card p-6 bg-card/60 shadow-sm border-line/40 space-y-6">
        <div>
          <label className="field-label block text-sm font-bold text-fg mb-2">Provider</label>
          <select 
            className="input w-full bg-field border-line focus:border-accent"
            value={provider}
            onChange={(e) => setProvider(e.target.value as Provider)}
          >
            <option value="OpenAI">OpenAI</option>
            <option value="Anthropic">Anthropic</option>
            <option value="Google Gemini">Google Gemini</option>
            <option value="Ollama">Ollama</option>
          </select>
        </div>
        <div>
          <label className="field-label block text-sm font-bold text-fg mb-2">Mode</label>
          <select 
            className="input w-full bg-field border-line focus:border-accent"
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
          >
            <option value="Stream UI (useChat)">Stream UI (useChat)</option>
            <option value="Text Generation">Text Generation</option>
            <option value="Object Generation">Object Generation</option>
          </select>
        </div>
        <div>
          <label className="field-label block text-sm font-bold text-fg mb-2">Model Name</label>
          <input 
            type="text"
            className="input w-full bg-field border-line focus:border-accent"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
          />
        </div>
      </div>

      <div className="card bg-hover/30 border-line/30 flex flex-col h-[600px] sticky top-24 overflow-hidden">
        <div className="flex items-center gap-1 px-2 pt-2 border-b border-line/40 bg-card/40">
          <button
            onClick={() => setActiveTab("api")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === "api" ? "bg-black/40 text-accent border-b-2 border-accent" : "text-muted hover:text-fg"
            }`}
          >
            api/chat/route.ts
          </button>
          <button
            onClick={() => setActiveTab("client")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === "client" ? "bg-black/40 text-accent border-b-2 border-accent" : "text-muted hover:text-fg"
            }`}
          >
            page.tsx
          </button>
          <button
            onClick={() => setActiveTab("playground")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === "playground" ? "bg-black/40 text-accent border-b-2 border-accent" : "text-muted hover:text-fg flex items-center gap-1"
            }`}
          >
            Live Playground <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          </button>
        </div>
        
        {activeTab !== "playground" ? (
          <>
            <EditorToolbar 
              title="Vercel AI SDK Code"
              content={outputCode}
              toolSlug="vercel-ai-sdk-code-generator"
              language="typescript"
              filename={activeTab === "api" ? "route.ts" : "page.tsx"}
            />
            <div className="flex-1 bg-black/40 relative">
              <CodeEditor 
                value={outputCode}
                language="typescript"
                readOnly={true}
                height="100%"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col bg-black/40 relative">
            <div className="flex items-center justify-between p-3 border-b border-line/40 bg-card/20">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted">Live Testing:</span>
                <span className="text-fg font-medium">{provider} ({modelName || "Default"})</span>
              </div>
              {(!keys.openai && provider === 'OpenAI') || (!keys.anthropic && provider === 'Anthropic') ? (
                <button onClick={() => setKeyModalOpen(true)} className="text-xs px-2 py-1 bg-warning/20 text-warning border border-warning/30 rounded">Missing API Key (BYOK)</button>
              ) : provider === "Google Gemini" || provider === "Ollama" ? (
                <span className="text-xs px-2 py-1 bg-field text-muted border border-line/30 rounded">Local/Env Key Only</span>
              ) : (
                <span className="text-xs px-2 py-1 bg-success/20 text-success border border-success/30 rounded">Ready</span>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted text-center space-y-2">
                  <span className="text-4xl">⚡</span>
                  <p className="text-sm">Test your generated AI SDK integration right here.</p>
                </div>
              ) : (
                messages.map(m => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-accent/20 border border-accent/30 text-fg' : 'bg-card border border-line/40 text-fg/90 shadow-sm'}`}>
                      {m.content}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 border-t border-line/40 bg-card/40">
              <div className="flex gap-2">
                <input
                  className="input flex-1 bg-field border-line focus:border-accent"
                  value={input}
                  placeholder="Send a message..."
                  onChange={e => setInput(e.target.value)}
                />
                <button type="submit" disabled={isLoading} className="btn btn-primary px-4">
                  {isLoading ? "..." : "Send"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
