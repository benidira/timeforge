"use client";

import { useState } from "react";
import { CopyIcon, CheckIcon, DownloadIcon } from "lucide-react";

type Provider = "OpenAI" | "Anthropic" | "Google Gemini" | "Ollama";
type Mode = "Stream UI (useChat)" | "Text Generation" | "Object Generation";

export function VercelAiSdkGenerator() {
  const [provider, setProvider] = useState<Provider>("OpenAI");
  const [mode, setMode] = useState<Mode>("Stream UI (useChat)");
  const [modelName, setModelName] = useState("gpt-4o");
  const [activeTab, setActiveTab] = useState<"api" | "client">("api");
  const [copied, setCopied] = useState(false);

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

      <div className="card bg-hover/30 border-line/30 flex flex-col h-[600px] sticky top-24">
        <div className="flex items-center justify-between px-2 pt-2 border-b border-line/40 bg-card/40">
          <div className="flex gap-1">
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
          </div>
          <div className="flex items-center gap-2 pr-2">
            <button onClick={handleCopy} className="btn btn-secondary py-1 px-2.5 text-xs h-auto min-h-0 flex items-center gap-1.5" title="Copy to clipboard">
              {copied ? <CheckIcon className="w-3.5 h-3.5 text-success" /> : <CopyIcon className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button onClick={handleDownload} className="btn btn-primary py-1 px-2.5 text-xs h-auto min-h-0 flex items-center gap-1.5" title="Download File">
              <DownloadIcon className="w-3.5 h-3.5" />
              Download
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 bg-black/40 text-sm font-mono text-fg/90 whitespace-pre-wrap">
          {outputCode}
        </div>
      </div>
    </div>
  );
}
