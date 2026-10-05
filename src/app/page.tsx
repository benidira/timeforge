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

      {/* ── 1. Hero Section ── */}
      <section className="relative w-full border-b border-line overflow-hidden bg-bg pt-24 pb-20 sm:pt-32 sm:pb-28">
        {/* Ambient radial glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50" />
        
        <div className="layout-content relative z-10 flex flex-col items-center text-center">
          <div className="mb-6 animate-fade-in-up flex items-center justify-center gap-2" style={{ animationDelay: '0ms' }}>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/20 backdrop-blur-md">
              Developer utilities for everyday work
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-fg to-muted animate-fade-in-up max-w-4xl leading-tight" style={{ animationDelay: '100ms' }}>
            Enterprise-grade developer tools that just work.
          </h1>
          
          <p className="mt-6 max-w-2xl text-lg sm:text-xl text-muted animate-fade-in-up leading-relaxed" style={{ animationDelay: '200ms' }}>
            Convert timestamps, compare time zones, format dates, and generate developer-ready values instantly. Build faster with our sleek suite of tools.
          </p>

          <span className="sr-only" dir="rtl">بسرعة ومجانًا</span>

          <div className="mt-10 flex flex-wrap justify-center items-center gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <Link href="/tools" className="btn btn-primary h-12 px-8 text-base shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all">
              Get Started Free
            </Link>
            <Link href="/tools" className="btn btn-secondary h-12 px-8 text-base bg-card hover:bg-hover backdrop-blur-md">
              Explore Tools
            </Link>
          </div>
          
          <div className="mt-6 text-sm text-muted animate-fade-in-up flex items-center gap-2" style={{ animationDelay: '400ms' }}>
            Press <kbd className="px-2 py-1 bg-card border border-line rounded-md text-xs font-mono font-medium shadow-sm">Ctrl</kbd> + <kbd className="px-2 py-1 bg-card border border-line rounded-md text-xs font-mono font-medium shadow-sm">K</kbd> to open command menu
          </div>

          <div className="mt-16 animate-fade-in-up w-full max-w-sm mx-auto" style={{ animationDelay: '400ms' }}>
            <div className="card p-4 flex flex-col items-center gap-2">
              <span className="text-xs font-semibold text-muted uppercase">Live Unix Timestamp</span>
              <div className="text-2xl font-mono font-medium text-fg tracking-tight">
                <LiveEpoch />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Global Search Trigger ── */}
      <section className="py-12 border-b border-line bg-bg">
        <div className="layout-content max-w-4xl">
          <button 
            id="home-search-trigger"
            className="w-full flex items-center justify-between px-6 py-4 bg-field hover:bg-hover border border-line rounded-lg shadow-sm transition-colors text-left"
          >
            <div className="flex items-center gap-4 text-muted">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <span className="text-base font-medium">Search tools, timestamps, time zones, and guides...</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <kbd className="h-7 px-2 flex items-center justify-center text-xs font-medium bg-card text-muted rounded border border-line font-mono shadow-sm">
                ⌘ K
              </kbd>
            </div>
          </button>
          <script dangerouslySetInnerHTML={{__html: `
            document.getElementById('home-search-trigger')?.addEventListener('click', () => {
              document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
            });
          `}} />
        </div>
      </section>

      <div className="layout-content space-y-24 py-16 pb-32">

        {/* ── 3. Popular Tools ── */}
        <section aria-labelledby="popular-tools">
          <div className="mb-8">
            <h2 id="popular-tools" className="text-2xl font-semibold text-fg tracking-tight">Popular Tools</h2>
            <p className="text-muted mt-1 text-base">The most frequently used utilities.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popularTools.map((t) => (
              <ToolCard key={t.slug} tool={t} headingLevel={3} />
            ))}
          </div>
        </section>

        {/* ── 4. Tool Categories ── */}
        <section aria-labelledby="categories">
          <div className="mb-8">
            <h2 id="categories" className="text-2xl font-semibold text-fg tracking-tight">Browse by Category</h2>
            <p className="text-muted mt-1 text-base">Find specific tools for your current task.</p>
          </div>
          <CategorySection headingLevel={3} />
        </section>

        {/* ── 5. Built for Developers ── */}
        <section aria-labelledby="why-castov">
          <div className="mb-8">
            <h2 id="why-castov" className="text-2xl font-semibold text-fg tracking-tight">Built for developers</h2>
            <p className="text-muted mt-1 text-base">Privacy-first tools designed for productivity.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_ITEMS.map((item) => (
              <div key={item.title} className="card p-6">
                <div className="mb-4 text-primary">
                  <svg aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg text-fg">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. Developer Snippets ── */}
        <section aria-labelledby="developer-tools">
          <div className="mb-8 max-w-3xl">
            <h2 id="developer-tools" className="text-2xl font-semibold text-fg tracking-tight">Developer Snippets</h2>
            <p className="text-muted mt-1 text-base">Quick copy-ready snippets for common time operations.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {DEV_SNIPPETS.map((item) => (
              <div key={item.label} className="card p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-fg">{item.label}</h3>
                  <CopyButton value={item.code} label={item.label} />
                </div>
                <div className="code-block mt-0 p-3 bg-field text-sm">
                  <code>{item.code}</code>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 7. Time Zones Section ── */}
        <section aria-labelledby="time-zones">
          <div className="card p-10 bg-field border-line flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <h2 id="time-zones" className="text-2xl font-semibold text-fg tracking-tight mb-3">Time Zones & World Clock</h2>
              <p className="text-base text-muted mb-6">Compare cities, understand offsets, and calculate business hours instantly across global borders.</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/timezones" className="btn btn-primary">Time Zones Hub</Link>
                <Link href="/tools/timezone-converter" className="btn btn-secondary">Timezone Converter</Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── 8. Guides ── */}
        <section aria-labelledby="guides">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 id="guides" className="text-2xl font-semibold text-fg tracking-tight">Guides & Articles</h2>
              <p className="text-muted mt-1 text-base">Learn about timestamps, dates, and developer standards.</p>
            </div>
            <Link href="/guides" className="text-sm font-medium text-link hover:underline hidden sm:block">View all guides</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {GUIDES.slice(0, 4).map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="guide-card block flex-1"
              >
                <span className="block text-base font-semibold text-fg mb-2">{g.name}</span>
                <span className="block text-sm text-muted mb-4 line-clamp-2">{g.summary}</span>
                <span className="flex items-center text-xs font-medium text-muted">
                  {g.readingMinutes} min read
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── 9. FAQ ── */}
        <FaqSection items={HOME_FAQ} headingId="faq" />

        {/* ── 10. Final CTA ── */}
        <section className="py-16 text-center border-t border-line mt-16" aria-labelledby="cta-heading">
          <h2 id="cta-heading" className="text-3xl font-bold tracking-tight text-fg mb-4">
            Find the right tool for your workflow.
          </h2>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/tools" className="btn btn-primary">
              Explore all tools
            </Link>
          </div>
        </section>

      </div>
    </>
  );
}
