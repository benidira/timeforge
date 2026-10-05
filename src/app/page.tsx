import type { Metadata } from "next";
import Link from "next/link";
import { WHY_ITEMS, HOME_FAQ, DEV_SNIPPETS } from "@/content/home";
import { TOOLS } from "@/content/tools";
import { GUIDES } from "@/content/guides";
import { buildMetadata, websiteJsonLd, faqJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { LiveEpoch } from "@/components/live-epoch";
import { CategorySection } from "@/components/category-section";
import { FaqSection } from "@/components/faq-section";
import { ToolCard } from "@/components/tool-card";
import { CopyButton } from "@/components/ui/copy-button";

export const metadata: Metadata = buildMetadata({
  title: "Castov | Developer tools that just work",
  description: "Fast, simple, privacy-friendly tools for timestamps, dates, time zones, formats, and developer workflows.",
  path: "/",
});

export default function HomePage() {
  const POPULAR_SLUGS = [
    "unix-timestamp-converter",
    "timestamp-to-date",
    "date-to-timestamp",
    "timezone-converter",
    "world-clock",
    "date-calculator"
  ];
  const popularTools = TOOLS.filter((t) => POPULAR_SLUGS.includes(t.slug));

  return (
    <>
      <JsonLd data={[websiteJsonLd(), faqJsonLd(HOME_FAQ)]} />

      {/* ── 1. High-Impact Hero ── */}
      <section className="relative w-full overflow-hidden bg-[#050505] pt-32 pb-20 sm:pt-40 sm:pb-32 min-h-[90vh] flex flex-col justify-center">
        {/* Ambient radial glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] ambient-glow-indigo pointer-events-none" />
        
        <div className="layout-content relative z-10 flex flex-col items-center text-center">
          <div className="mb-6 flex items-center justify-center gap-2">
            <span className="glass-pill">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
              Castov v2.0 Engine is Live
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter text-fg max-w-5xl leading-[1.1]">
            The Ultimate <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-300 via-zinc-500 to-zinc-700">Developer Sandbox</span>
          </h1>
          
          <p className="mt-8 max-w-2xl text-lg sm:text-xl text-muted leading-relaxed font-medium">
            Ultra-fast, fully local, zero-config tools. From mapping out Kubernetes clusters to scanning leaked secrets, do it all in your browser.
          </p>

          <div className="mt-10 flex flex-wrap justify-center items-center gap-4">
            <Link href="/tools" className="btn btn-primary h-12 px-8 text-base shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] transition-all bg-white text-black hover:bg-zinc-200 font-bold border-none">
              Explore Tools
            </Link>
            <button id="hero-search-trigger" className="btn bg-white/5 border border-white/10 hover:bg-white/10 text-fg h-12 px-8 text-base">
              Press ⌘K to Search
            </button>
          </div>
          <script dangerouslySetInnerHTML={{__html: `
            document.getElementById('hero-search-trigger')?.addEventListener('click', () => {
              document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
            });
          `}} />
        </div>
      </section>

      {/* ── 2. Bento Grid Features ── */}
      <section className="layout-content py-20 relative z-20 -mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[400px]">
          
          {/* Card 1: Canvas (Spans 2 cols) */}
          <div className="bento-card md:col-span-2 group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
            <div className="p-8 h-full flex flex-col relative z-10">
              <div className="flex-1">
                <span className="glass-pill mb-4 text-indigo-400 border-indigo-500/30">Workflows</span>
                <h3 className="text-3xl font-bold text-fg mb-2 tracking-tight">Agentic Canvas</h3>
                <p className="text-muted max-w-md">Chain together Developer Tools visually. Zapier for raw developer data with zero server processing.</p>
              </div>
              <div className="mt-auto">
                <Link href="/canvas" className="text-fg font-medium flex items-center gap-2 group-hover:text-indigo-400 transition-colors">
                  Open Canvas &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: Env Vault */}
          <div className="bento-card group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
            <div className="p-8 h-full flex flex-col relative z-10">
              <div className="flex-1">
                <span className="glass-pill mb-4 text-emerald-400 border-emerald-500/30">Security</span>
                <h3 className="text-2xl font-bold text-fg mb-2 tracking-tight">Zero-Knowledge .env Vault</h3>
                <p className="text-muted">Military-grade AES-GCM encryption in your browser. Share secrets safely.</p>
              </div>
              <div className="mt-auto">
                <Link href="/tools/env-vault" className="text-fg font-medium flex items-center gap-2 group-hover:text-emerald-400 transition-colors">
                  Encrypt .env &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Card 3: SQLite */}
          <div className="bento-card group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
            <div className="p-8 h-full flex flex-col relative z-10">
              <div className="flex-1">
                <span className="glass-pill mb-4 text-amber-400 border-amber-500/30">Database</span>
                <h3 className="text-2xl font-bold text-fg mb-2 tracking-tight">In-Browser SQLite</h3>
                <p className="text-muted">Run full SQL queries entirely offline using WebAssembly.</p>
              </div>
              <div className="mt-auto">
                <Link href="/tools/sqlite-fiddle" className="text-fg font-medium flex items-center gap-2 group-hover:text-amber-400 transition-colors">
                  Open Fiddle &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Card 4: Docker Visualizer (Spans 2 cols) */}
          <div className="bento-card md:col-span-2 group">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent pointer-events-none" />
            <div className="p-8 h-full flex flex-col relative z-10">
              <div className="flex-1">
                <span className="glass-pill mb-4 text-violet-400 border-violet-500/30">Architecture</span>
                <h3 className="text-3xl font-bold text-fg mb-2 tracking-tight">Docker Architecture Map</h3>
                <p className="text-muted max-w-md">Paste docker-compose.yml, get an instant, interactive React Flow diagram of your containers and ports.</p>
              </div>
              <div className="mt-auto">
                <Link href="/tools/docker-visualizer" className="text-fg font-medium flex items-center gap-2 group-hover:text-violet-400 transition-colors">
                  Visualize Architecture &rarr;
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>
      
      {/* ── 3. CLI Banner ── */}
      <section className="border-t border-line bg-[#0a0a0a] py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] ambient-glow-emerald pointer-events-none" />
        <div className="layout-content relative z-10 text-center flex flex-col items-center">
          <h2 className="text-3xl md:text-5xl font-black text-fg tracking-tight mb-6">Also Available in your Terminal</h2>
          <p className="text-muted mb-8 max-w-xl mx-auto">Access the core engine of Castov directly from your command line without ever opening a browser tab.</p>
          <div className="inline-flex items-center gap-4 bg-[#050505] border border-white/10 px-6 py-4 rounded-2xl font-mono text-fg shadow-2xl">
            <span className="text-emerald-500 font-bold">$</span> npx castov
            <CopyButton value="npx castov" label="copy command" />
          </div>
        </div>
      </section>

      {/* ── 4. Standard Tool Categories ── */}
      <section className="layout-content py-20 border-t border-line">
        <div className="text-center mb-16">
          <h2 className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">Explore by Category</h2>
          <p className="mt-4 text-muted text-lg max-w-2xl mx-auto">
            Find exactly what you need to format, convert, or calculate.
          </p>
        </div>
        <div className="mt-8">
          <CategorySection headingLevel={3} />
        </div>
      </section>

      {/* ── 5. FAQ Section ── */}
      <FaqSection items={HOME_FAQ} headingId="faq" />
    </>
  );
}
