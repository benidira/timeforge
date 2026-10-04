"use client";

import { useState, useRef, useEffect } from "react";
import { CopyIcon, CheckIcon, DownloadIcon, PlusIcon, TrashIcon } from "lucide-react";
import { CodeEditor } from "@/components/ui/code-editor";
import { EditorToolbar } from "@/components/ui/editor-toolbar";
import { useKeyManager } from "@/context/KeyManagerContext";

interface FewShotExample {
  id: string;
  user: string;
  assistant: string;
}

export function ClaudeSystemPromptBuilder() {
  const [role, setRole] = useState("Expert Senior Software Engineer");
  const [task, setTask] = useState("Review the provided code for security vulnerabilities and performance bottlenecks.");
  const [context, setContext] = useState("The codebase is a Next.js 14 application using App Router, TypeScript, and Tailwind CSS. It is a financial dashboard.");
  const [constraints, setConstraints] = useState("1. Do not output full files, only diffs.\n2. Explain the 'why' before the code.\n3. Format output in Markdown.");
  const [examples, setExamples] = useState<FewShotExample[]>([]);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "playground">("code");
  const [provider, setProvider] = useState<"openai" | "anthropic">("openai");
  
  const { keys, setKeyModalOpen } = useKeyManager();

  const generatePrompt = () => {
    let prompt = "";
    if (role.trim()) prompt += `<role>\n${role.trim()}\n</role>\n\n`;
    if (task.trim()) prompt += `<task>\n${task.trim()}\n</task>\n\n`;
    if (context.trim()) prompt += `<context>\n${context.trim()}\n</context>\n\n`;
    if (constraints.trim()) prompt += `<constraints>\n${constraints.trim()}\n</constraints>\n\n`;
    if (examples.length > 0) {
      prompt += `<examples>\n`;
      examples.forEach((ex) => {
        if (ex.user.trim() || ex.assistant.trim()) {
          prompt += `  <example>\n`;
          if (ex.user.trim()) prompt += `    <user>\n${ex.user.trim().replace(/^/gm, '      ')}\n    </user>\n`;
          if (ex.assistant.trim()) prompt += `    <assistant>\n${ex.assistant.trim().replace(/^/gm, '      ')}\n    </assistant>\n`;
          prompt += `  </example>\n`;
        }
      });
      prompt += `</examples>\n\n`;
    }
    prompt += `Please begin by thinking step-by-step in <scratchpad> tags before providing your final answer in <response> tags.`;
    return prompt;
  };

  const outputContent = generatePrompt();

  const [messages, setMessages] = useState<{id: string, role: string, content: string}[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value);

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
          system: outputContent,
          provider,
          messages: newMessages
        })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      // Read stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMsg = "";
      
      setMessages([...newMessages, { id: (Date.now() + 1).toString(), role: "assistant", content: "" }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Very basic stream parsing (ai sdk text stream format starts with 0:...)
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

  const addExample = () => {
    setExamples([...examples, { id: Math.random().toString(), user: "", assistant: "" }]);
  };

  const updateExample = (id: string, field: "user" | "assistant", value: string) => {
    setExamples(examples.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const removeExample = (id: string) => {
    setExamples(examples.filter(e => e.id !== id));
  };

  const applyTemplate = (type: "reviewer" | "writer") => {
    if (type === "reviewer") {
      setRole("Expert Security Auditor and Code Reviewer");
      setTask("Analyze the user's code snippet for security flaws (XSS, SQLi, CSRF, etc.) and suggest remediation.");
      setContext("We are reviewing an enterprise banking application strictly adhering to OWASP Top 10 guidelines.");
      setConstraints("- Output must be strictly valid JSON containing 'severity', 'issue', and 'fix_snippet'.\n- Do not include conversational filler.");
      setExamples([{ id: "1", user: "const query = `SELECT * FROM users WHERE id = ${req.body.id}`;", assistant: '{\n  "severity": "High",\n  "issue": "SQL Injection vulnerability due to unescaped input.",\n  "fix_snippet": "const query = `SELECT * FROM users WHERE id = $1`;"\n}' }]);
    } else {
      setRole("Professional Technical Writer");
      setTask("Convert the developer's rough notes into a polished API documentation page.");
      setContext("The API uses REST principles and returns JSON. The audience is frontend developers.");
      setConstraints("- Use clear headings (H2, H3).\n- Include a 'Request' and 'Response' section.\n- Keep the tone professional and concise.");
      setExamples([]);
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-start w-full">
      {/* Controls */}
      <div className="lg:col-span-5 card p-6 bg-card/60 shadow-sm border-line/40 space-y-6">
        <div>
          <label className="field-label block text-sm font-bold text-fg mb-3">Quick Templates</label>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => applyTemplate("reviewer")} className="text-xs px-3 py-1.5 rounded-md border bg-field border-line text-muted hover:border-line/80 hover:text-fg transition-colors">
              Code Reviewer
            </button>
            <button onClick={() => applyTemplate("writer")} className="text-xs px-3 py-1.5 rounded-md border bg-field border-line text-muted hover:border-line/80 hover:text-fg transition-colors">
              Technical Writer
            </button>
          </div>
        </div>

        <div className="border-t border-line/40 pt-6">
          <label className="field-label block text-sm font-bold text-fg mb-2">Role & Persona</label>
          <input 
            type="text" className="input w-full bg-field border-line focus:border-accent text-sm"
            value={role} onChange={e => setRole(e.target.value)}
            placeholder="e.g. You are an expert Python developer..."
          />
        </div>

        <div>
          <label className="field-label block text-sm font-bold text-fg mb-2">Core Task / Objective</label>
          <textarea 
            className="input w-full min-h-[80px] bg-field border-line focus:border-accent text-sm resize-y"
            value={task} onChange={e => setTask(e.target.value)}
            placeholder="What exactly should the AI do?"
          />
        </div>

        <div>
          <label className="field-label block text-sm font-bold text-fg mb-2">Context</label>
          <textarea 
            className="input w-full min-h-[80px] bg-field border-line focus:border-accent text-sm resize-y"
            value={context} onChange={e => setContext(e.target.value)}
            placeholder="Background information, target audience, format..."
          />
        </div>

        <div>
          <label className="field-label block text-sm font-bold text-fg mb-2">Rules & Constraints</label>
          <textarea 
            className="input w-full min-h-[100px] bg-field border-line focus:border-accent text-sm resize-y"
            value={constraints} onChange={e => setConstraints(e.target.value)}
            placeholder="1. Do not do X&#10;2. Always ensure Y"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="field-label block text-sm font-bold text-fg">Few-Shot Examples (XML)</label>
            <button onClick={addExample} className="text-xs text-accent font-semibold flex items-center gap-1 hover:underline">
              <PlusIcon className="w-3 h-3" /> Add Example
            </button>
          </div>
          <div className="space-y-4">
            {examples.length === 0 && <p className="text-xs text-muted italic">No examples added. Highly recommended for complex tasks.</p>}
            {examples.map((e, idx) => (
              <div key={e.id} className="p-3 rounded-lg bg-hover/50 border border-line relative space-y-3">
                <button onClick={() => removeExample(e.id)} className="absolute top-2 right-2 text-muted hover:text-danger p-1 bg-card rounded">
                  <TrashIcon className="w-3 h-3" />
                </button>
                <div className="pr-6">
                  <label className="text-xs font-semibold text-muted block mb-1">User Input (Example {idx + 1})</label>
                  <textarea className="input w-full min-h-[60px] text-xs font-mono" value={e.user} onChange={ev => updateExample(e.id, "user", ev.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted block mb-1">Ideal Assistant Output</label>
                  <textarea className="input w-full min-h-[80px] text-xs font-mono" value={e.assistant} onChange={ev => updateExample(e.id, "assistant", ev.target.value)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview / Playground */}
      <div className="lg:col-span-7 card bg-hover/30 border-line/30 flex flex-col h-[800px] sticky top-24 overflow-hidden">
        <div className="flex items-center gap-1 px-2 pt-2 border-b border-line/40 bg-card/40">
          <button
            onClick={() => setActiveTab("code")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === "code" ? "bg-black/40 text-accent border-b-2 border-accent" : "text-muted hover:text-fg"
            }`}
          >
            System Prompt
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

        {activeTab === "code" ? (
          <>
            <EditorToolbar 
              title="Claude System Prompt"
              content={outputContent}
              toolSlug="claude-system-prompt-builder"
              language="markdown"
              filename="system_prompt.txt"
            />
            <div className="flex-1 bg-black/40 relative">
              <CodeEditor 
                value={outputContent}
                language="markdown"
                readOnly={true}
                height="100%"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col bg-black/40 relative">
            <div className="flex items-center justify-between p-3 border-b border-line/40 bg-card/20">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted">Provider:</span>
                <select className="bg-field border border-line rounded px-2 py-1 text-fg focus:border-accent" value={provider} onChange={e => setProvider(e.target.value as any)}>
                  <option value="openai">OpenAI (GPT-4o)</option>
                  <option value="anthropic">Anthropic (Claude 3.5)</option>
                </select>
              </div>
              {(!keys.openai && provider === 'openai') || (!keys.anthropic && provider === 'anthropic') ? (
                <button onClick={() => setKeyModalOpen(true)} className="text-xs px-2 py-1 bg-warning/20 text-warning border border-warning/30 rounded">Missing API Key</button>
              ) : (
                <span className="text-xs px-2 py-1 bg-success/20 text-success border border-success/30 rounded">Ready</span>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted text-center space-y-2">
                  <span className="text-4xl">🤖</span>
                  <p className="text-sm">The AI is ready. It will act according to your system prompt.</p>
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
                  placeholder="Test your prompt..."
                  onChange={handleInputChange}
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
