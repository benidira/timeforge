"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Copy, Check, Search, Bot, Briefcase, Tag, Loader2 } from "lucide-react";
import Link from "next/link";
import { getPrompts, Prompt } from "@/app/actions/prompts";

const AIs = [
  "All", "ChatGPT", "Claude AI", "Google Gemini", "Midjourney", "Leonardo AI",
  "ElevenLabs", "Perplexity AI", "Runway", "Kling AI", "Hailuo AI (MiniMax)",
  "Luma Dream Machine", "Suno AI", "Udio", "Cursor", "GitHub Copilot",
  "HeyGen", "CapCut AI", "Flux AI", "Ideogram", "Poe"
];
const ROLES = ["All", "Developer", "Creator", "Marketer", "Designer", "Writer", "Student"];

export default function PromptsLibraryPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedAI, setSelectedAI] = useState("All");
  const [selectedRole, setSelectedRole] = useState("All");
  
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset and fetch first page on filter change
  useEffect(() => {
    let isMounted = true;
    
    async function fetchFirstPage() {
      setLoading(true);
      const res = await getPrompts(1, 20, debouncedSearch, selectedAI, selectedRole);
      if (isMounted) {
        setPrompts(res.data || []);
        setTotalCount(res.count || 0);
        setPage(1);
        setHasMore((res.data?.length || 0) === 20);
        setLoading(false);
      }
    }

    fetchFirstPage();

    return () => { isMounted = false; };
  }, [debouncedSearch, selectedAI, selectedRole]);

  // Load more (Infinite Scroll)
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = page + 1;
    const res = await getPrompts(nextPage, 20, debouncedSearch, selectedAI, selectedRole);
    
    if (res.data) {
      setPrompts(prev => [...prev, ...res.data]);
      setPage(nextPage);
      setHasMore(res.data.length === 20);
    }
    setLoading(false);
  }, [page, loading, hasMore, debouncedSearch, selectedAI, selectedRole]);

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore, loading]);


  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full pb-20">
      <section className="w-full border-b border-line bg-card pt-16 pb-12">
        <div className="layout-content flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="mb-4">
            <span className="text-sm font-medium tracking-wide text-primary uppercase bg-primary/10 px-3 py-1 rounded-full">
              Global AI Prompts Library
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-fg mb-6">
            The Ultimate Prompt <span className="bg-gradient-to-r from-accent to-success bg-clip-text text-transparent">Vault</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted mb-10 leading-relaxed max-w-2xl">
            A massive collection of professional prompts for 20+ top AI engines including ChatGPT, Claude, Midjourney, and Luma.
          </p>

          <div className="w-full relative max-w-2xl mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
            <input 
              type="text"
              placeholder="Search prompts by keyword, role, or title..."
              className="w-full bg-field border-2 border-line hover:border-muted focus:border-primary transition-colors rounded-xl py-4 pl-12 pr-4 text-fg shadow-sm outline-none text-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="w-full max-w-4xl space-y-4">
            <div className="flex items-center gap-2 bg-field border border-line rounded-lg p-2 shadow-sm overflow-x-auto whitespace-nowrap scrollbar-hide">
              <Bot className="w-4 h-4 text-muted ml-2 shrink-0" />
              {AIs.map(ai => (
                <button
                  key={ai}
                  onClick={() => setSelectedAI(ai)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors shrink-0 ${selectedAI === ai ? "bg-accent text-white" : "text-muted hover:text-fg hover:bg-hover"}`}
                >
                  {ai}
                </button>
              ))}
            </div>
            
            <div className="flex items-center justify-center gap-2 bg-field border border-line rounded-lg p-2 shadow-sm overflow-x-auto whitespace-nowrap scrollbar-hide">
              <Briefcase className="w-4 h-4 text-muted ml-2 shrink-0" />
              {ROLES.map(role => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors shrink-0 ${selectedRole === role ? "bg-primary text-white" : "text-muted hover:text-fg hover:bg-hover"}`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="layout-content py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-fg">
            {totalCount} Prompts Found
          </h2>
          <Link href="/ai" className="text-sm font-medium text-muted hover:text-fg transition-colors">
            &larr; Back to AI Hub
          </Link>
        </div>

        {prompts.length === 0 && !loading ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-line">
            <h3 className="text-xl font-bold text-fg mb-2">No prompts found</h3>
            <p className="text-muted">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {prompts.map(prompt => (
              <div key={prompt.id} className="card bg-card border-line p-6 flex flex-col hover:shadow-xl transition-shadow group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Bot className="w-24 h-24" />
                </div>
                
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1 flex items-center gap-1">
                      {prompt.ai_model} • {prompt.role}
                    </span>
                    <h3 className="text-lg font-bold text-fg leading-tight">
                      {prompt.title}
                    </h3>
                  </div>
                </div>

                <div className="bg-[#050505] border border-line rounded-lg p-4 mb-4 flex-grow relative group-hover:border-primary/50 transition-colors z-10">
                  <p className="text-sm text-muted font-mono leading-relaxed line-clamp-5 group-hover:line-clamp-none transition-all">
                    {prompt.prompt_text}
                  </p>
                  
                  <button 
                    onClick={() => handleCopy(prompt.id, prompt.prompt_text)}
                    className="absolute top-2 right-2 p-2 bg-card border border-line rounded-md text-muted hover:text-fg shadow-sm hover:border-primary transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Copy Prompt"
                  >
                    {copiedId === prompt.id ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 relative z-10">
                  {prompt.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center px-2 py-1 bg-field border border-line rounded text-[10px] font-semibold text-muted tracking-wide">
                      <Tag className="w-3 h-3 mr-1" /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading Spinner & Observer Target */}
        <div ref={observerTarget} className="w-full py-8 flex justify-center">
          {loading && (
            <div className="flex items-center gap-2 text-muted">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span>Loading more prompts...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
