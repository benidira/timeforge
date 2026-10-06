"use client";

import { useState } from "react";
import { CheckIcon } from "lucide-react";
import { CodeEditor } from "@/components/ui/code-editor";
import { EditorToolbar } from "@/components/ui/editor-toolbar";

const STACKS = {
  Frontend: ["Next.js (App Router)", "React", "Vue 3", "SvelteKit"],
  Styling: ["Tailwind CSS", "Shadcn UI", "CSS Modules", "Styled Components"],
  Backend: ["Node.js", "FastAPI", "PostgreSQL", "Supabase", "Prisma", "Drizzle"],
  State: ["TanStack Query", "Zustand", "Redux Toolkit"],
};

const STANDARDS = [
  "Enforce Strict TypeScript (no `any`, mandatory explicit return types)",
  "Functional & Immutable Component Paradigms",
  "Accessibility & Semantic HTML (a11y)",
  "SEO & OpenGraph Optimization rules",
  "Comprehensive Error Handling & Clean Architecture",
];

export function CursorRulesGenerator() {
  const [selectedStack, setSelectedStack] = useState<Record<string, string[]>>({
    Frontend: [], Styling: [], Backend: [], State: [],
  });
  const [selectedStandards, setSelectedStandards] = useState<string[]>([]);
  const [customRules, setCustomRules] = useState("");

  const toggleStack = (category: string, item: string) => {
    setSelectedStack(prev => {
      const catList = prev[category];
      return {
        ...prev,
        [category]: catList.includes(item) ? catList.filter(i => i !== item) : [...catList, item]
      };
    });
  };

  const toggleStandard = (item: string) => {
    setSelectedStandards(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const generateOutput = () => {
    let output = "You are an expert software engineer and AI coding assistant.\n\n";
    
    const hasStack = Object.values(selectedStack).some(list => list.length > 0);
    if (hasStack) {
      output += "### Core Tech Stack\n";
      for (const [cat, list] of Object.entries(selectedStack)) {
        if (list.length > 0) {
          output += `- **${cat}**: ${list.join(", ")}\n`;
        }
      }
      output += "\n";
    }

    if (selectedStandards.length > 0) {
      output += "### Coding Standards & Best Practices\n";
      selectedStandards.forEach(std => {
        output += `- ${std}\n`;
      });
      output += "\n";
    }

    if (customRules.trim()) {
      output += "### Project-Specific Rules\n";
      output += customRules.trim() + "\n";
    }

    return output;
  };

  const outputContent = generateOutput();

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start w-full">
      {/* Controls */}
      <div className="card p-6 bg-card/60 shadow-sm border-line/40 space-y-8">
        <div>
          <h3 className="text-lg font-bold text-fg mb-4">Tech Stack</h3>
          <div className="space-y-4">
            {Object.entries(STACKS).map(([category, items]) => (
              <div key={category}>
                <h4 className="text-sm font-semibold text-muted mb-2">{category}</h4>
                <div className="flex flex-wrap gap-2">
                  {items.map(item => {
                    const isSelected = selectedStack[category].includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleStack(category, item)}
                        className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                          isSelected ? "bg-accent/10 border-accent/40 text-accent" : "bg-field border-line text-muted hover:border-line/80 hover:text-fg"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-fg mb-4">Coding Standards</h3>
          <div className="space-y-2">
            {STANDARDS.map(std => {
              const isSelected = selectedStandards.includes(std);
              return (
                <label key={std} className="flex items-start gap-3 cursor-pointer group" onClick={() => toggleStandard(std)}>
                  <div className={`mt-0.5 flex w-4 h-4 shrink-0 items-center justify-center rounded border transition-colors ${
                    isSelected ? "bg-accent border-accent text-accent-fg" : "bg-field border-line group-hover:border-accent/50"
                  }`}>
                    {isSelected && <CheckIcon strokeWidth={3} className="w-3 h-3" />}
                  </div>
                  <span className={`text-sm ${isSelected ? "text-fg font-medium" : "text-muted"}`}>{std}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-fg mb-4">Custom Rules</h3>
          <textarea
            className="input w-full min-h-[120px] bg-field border-line focus:border-accent resize-y text-sm"
            placeholder="e.g., Use functional components, prefer early returns, separate API logic from UI..."
            value={customRules}
            onChange={(e) => setCustomRules(e.target.value)}
          />
        </div>
      </div>

      {/* Preview */}
      <div className="card bg-hover/30 border-line/30 flex flex-col h-[600px] sticky top-24 overflow-hidden">
        <EditorToolbar 
          title="Cursor Rules"
          content={outputContent}
          toolSlug="cursorrules-generator"
          language="markdown"
          filename=".cursorrules"
        />
        <div className="flex-1 bg-black/40 relative">
          <CodeEditor 
            value={outputContent}
            language="markdown"
            readOnly={true}
            height="100%"
          />
        </div>
      </div>
    </div>
  );
}
