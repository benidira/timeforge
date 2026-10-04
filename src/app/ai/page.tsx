import type { Metadata } from "next";
import Link from "next/link";
import { AI_CATEGORIES, getAiToolsByCategory } from "@/lib/ai-tools";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "AI Developer Tools Directory | Castov",
  description: "A comprehensive registry of professional AI developer tools for prompts, local LLMs, calculators, schemas, and evals.",
  path: "/ai",
});

export default function AiDirectoryPage() {
  return (
    <div className="w-full pb-20">
      
      {/* ── Giant Search Hero ── */}
      <header className="mb-16 relative overflow-hidden rounded-3xl border border-line/20 bg-gradient-to-br from-card/80 to-black/60 p-10 md:p-16 text-center shadow-2xl">
        <div className="absolute top-[-20%] left-[10%] w-[80%] h-[80%] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-accent/10 border border-accent/20 text-xs font-semibold text-accent backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Enterprise AI Dev Console
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-fg mb-6 drop-shadow-sm leading-tight">
            Everything you need to <br className="hidden md:block"/>
            <span className="bg-gradient-to-r from-fg to-muted bg-clip-text text-transparent">build with AI.</span>
          </h1>
          
          <p className="text-lg text-muted mb-10 font-medium">
            Generate prompts, configure MCP servers, calculate tokens, and manage models instantly.
          </p>

          <button 
            className="w-full max-w-lg mx-auto flex items-center justify-between px-6 py-4 bg-field/60 hover:bg-hover/80 border border-line/60 rounded-2xl shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-accent/50 group"
            id="hero-search-trigger"
          >
            <div className="flex items-center gap-4 text-muted group-hover:text-fg transition-colors">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
              <span className="text-base font-medium">Search the directory...</span>
            </div>
            <kbd className="hidden sm:flex items-center justify-center h-8 px-2.5 text-sm font-semibold bg-card/50 text-muted rounded-lg border border-line/60 font-mono shadow-sm group-hover:text-accent transition-colors">
              ⌘K
            </kbd>
          </button>
          
          <script dangerouslySetInnerHTML={{__html: `
            document.getElementById('hero-search-trigger')?.addEventListener('click', () => {
              document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
            });
          `}} />
        </div>
      </header>

      {/* ── Flagship Bento Grid ── */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-fg">Flagship Tools</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[220px]">
          
          {/* Main Large Card */}
          <Link href="/ai/vercel-ai-sdk-generator" className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-2xl border border-line/40 bg-card/40 p-8 hover:border-accent/40 transition-colors flex flex-col justify-between">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-black/50 border border-line/50 flex items-center justify-center mb-6 shadow-inner">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-fg"><polygon points="12 2 2 22 22 22"></polygon></svg>
              </div>
              <h3 className="text-2xl font-bold text-fg group-hover:text-accent transition-colors mb-2">Vercel AI SDK Generator</h3>
              <p className="text-muted leading-relaxed max-w-md">Instantly generate production-ready Route Handlers and React Client components for streaming UI, text, and objects using the newest Vercel AI SDK APIs.</p>
            </div>
            <div className="relative z-10 text-sm font-semibold text-accent flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 transform duration-300">
              Launch tool <span aria-hidden="true">&rarr;</span>
            </div>
          </Link>

          {/* Secondary Card 1 */}
          <Link href="/ai/mcp-config-builder" className="relative group overflow-hidden rounded-2xl border border-line/40 bg-card/40 p-6 hover:border-accent/40 transition-colors flex flex-col justify-between">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-black/50 border border-line/50 flex items-center justify-center shadow-inner">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-fg"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>
                </div>
                <h3 className="text-lg font-bold text-fg group-hover:text-accent transition-colors">MCP Builder</h3>
              </div>
              <p className="text-sm text-muted">Generate config files for Model Context Protocol servers to integrate with Claude Desktop & Cursor.</p>
            </div>
          </Link>

          {/* Secondary Card 2 */}
          <Link href="/ai/cursorrules-generator" className="relative group overflow-hidden rounded-2xl border border-line/40 bg-card/40 p-6 hover:border-accent/40 transition-colors flex flex-col justify-between">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-black/50 border border-line/50 flex items-center justify-center shadow-inner">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-fg"><path d="m18 16 4-4-4-4"></path><path d="m6 8-4 4 4 4"></path><path d="m14.5 4-5 16"></path></svg>
                </div>
                <h3 className="text-lg font-bold text-fg group-hover:text-accent transition-colors">.cursorrules</h3>
              </div>
              <p className="text-sm text-muted">Build comprehensive project-specific AI coding guidelines for Cursor and Windsurf editors.</p>
            </div>
          </Link>
        </div>
      </div>

      {/* ── Category Grids ── */}
      <div className="space-y-16">
        {AI_CATEGORIES.map((category) => {
          const tools = getAiToolsByCategory(category);
          const name = category.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase());
          return (
            <section key={category} aria-labelledby={`cat-${category}`}>
              <div className="flex items-center justify-between mb-6 border-b border-line/30 pb-4">
                <h2 id={`cat-${category}`} className="text-xl font-bold text-fg/90">
                  {name}
                </h2>
                <Link href={`/ai/${category}`} className="text-sm font-semibold text-accent hover:text-accent-hover transition-colors">
                  View All &rarr;
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/ai/${tool.slug}`}
                    className="group flex flex-col bg-card/40 border border-line/40 rounded-xl p-5 hover:bg-hover/50 hover:border-accent/40 transition-all duration-200"
                  >
                    <h3 className="text-sm font-semibold text-fg group-hover:text-accent transition-colors">
                      {tool.name}
                    </h3>
                    <p className="mt-1.5 text-xs text-muted line-clamp-2 leading-relaxed">
                      {tool.description}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
