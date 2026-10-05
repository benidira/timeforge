"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { SearchIcon, BoxIcon, CodeIcon, SettingsIcon } from "lucide-react";
import { AI_TOOLS, AI_CATEGORIES } from "@/lib/ai-tools";
import { TOOLS } from "@/content/tools";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={() => setOpen(false)}
      />

      <Command
        className="relative w-full max-w-2xl bg-card border border-line/50 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        label="Global Command Menu"
      >
        <div className="flex items-center border-b border-line/50 px-4">
          <SearchIcon className="w-5 h-5 text-muted shrink-0" />
          <Command.Input 
            autoFocus
            className="flex-1 bg-transparent border-none outline-none h-14 px-4 text-fg placeholder:text-muted/60 text-lg"
            placeholder="Search tools, models, documentation..."
          />
          <kbd className="hidden sm:inline-flex items-center h-6 px-2 text-[10px] font-medium bg-field text-muted rounded border border-line/40 font-mono">
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-[350px] overflow-y-auto p-2 scrollbar-thin">
          <Command.Empty className="p-6 text-center text-sm text-muted">
            No results found.
          </Command.Empty>

          <Command.Group heading="General" className="text-xs font-medium text-muted/60 px-2 py-1">
            <Command.Item
              onSelect={() => runCommand(() => router.push("/"))}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-fg cursor-pointer aria-selected:bg-hover aria-selected:text-accent transition-colors mt-1"
            >
              <BoxIcon className="w-4 h-4" /> Home
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => router.push("/ai"))}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-fg cursor-pointer aria-selected:bg-hover aria-selected:text-accent transition-colors"
            >
              <CodeIcon className="w-4 h-4" /> AI Developer Directory
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => router.push("/tools"))}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-fg cursor-pointer aria-selected:bg-hover aria-selected:text-accent transition-colors"
            >
              <SettingsIcon className="w-4 h-4" /> Time & Date Tools
            </Command.Item>
          </Command.Group>

          
          <Command.Group heading="Developer Tools" className="text-xs font-medium text-muted/60 px-2 py-1 mt-2">
            {TOOLS.map((tool) => (
              <Command.Item
                key={tool.slug}
                value={tool.name + ' ' + tool.category}
                onSelect={() => runCommand(() => router.push(`/${tool.slug}`))}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-fg cursor-pointer aria-selected:bg-hover aria-selected:text-accent transition-colors mt-1"
              >
                <div className="flex flex-col pointer-events-none">
                  <span className="font-semibold">{tool.name}</span>
                  <span className="text-xs text-muted font-normal capitalize">{tool.category.replace('-', ' ')}</span>
                </div>
              </Command.Item>
            ))}
          </Command.Group>


          <Command.Group heading="AI Tools" className="text-xs font-medium text-muted/60 px-2 py-1 mt-2">
            {AI_TOOLS.map((tool) => (
              <Command.Item
                key={tool.slug}
                value={tool.name}
                onSelect={() => runCommand(() => router.push(`/ai/${tool.slug}`))}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-fg cursor-pointer aria-selected:bg-hover aria-selected:text-accent transition-colors mt-1"
              >
                <div className="flex flex-col">
                  <span className="font-semibold">{tool.name}</span>
                  <span className="text-xs text-muted font-normal">{tool.category}</span>
                </div>
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Categories" className="text-xs font-medium text-muted/60 px-2 py-1 mt-2">
            {AI_CATEGORIES.map((cat) => (
              <Command.Item
                key={cat}
                value={`${cat} category`}
                onSelect={() => runCommand(() => router.push(`/ai/${cat}`))}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-fg cursor-pointer aria-selected:bg-hover aria-selected:text-accent transition-colors mt-1"
              >
                <div className="flex flex-col">
                  <span className="font-semibold capitalize">{cat.replace("-", " ")}</span>
                  <span className="text-xs text-muted font-normal">Browse {cat} tools</span>
                </div>
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
