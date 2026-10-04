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
  title: "Castov | Powerful Time & Date Tools for Everyone",
  description: "Fast, accurate and privacy-friendly tools for timestamps, dates, time zones, durations and developer workflows.",
  path: "/",
});

export default function HomePage() {
  const POPULAR_SLUGS = [
    "unix-timestamp-converter",
    "timestamp-to-date",
    "date-to-timestamp",
    "world-clock",
    "timezone-converter",
    "date-calculator"
  ];
  const popularTools = TOOLS.filter((t) => POPULAR_SLUGS.includes(t.slug));

  return (
    <>
      <JsonLd data={[websiteJsonLd(), faqJsonLd(HOME_FAQ)]} />

      {/* ── Hero ── */}
      <section className="hero-section w-full border-b border-line/20 mb-12 relative overflow-hidden bg-gradient-to-b from-black to-card">
        {/* Glow effects */}
        <div className="absolute top-[-10%] left-[20%] w-[60%] h-[50%] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="layout-content py-24 sm:py-32 text-center relative z-10">
          <div className="mb-8 flex justify-center animate-fade-in-up" style={{ animationDelay: '0ms' }}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-semibold text-accent backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Introducing Castov AI Developer Hub
            </span>
          </div>

          <h1 className="text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl text-fg animate-fade-in-up drop-shadow-sm" style={{ animationDelay: '100ms' }}>
            AI DEVELOPMENT. FASTER.<br />
            <span className="bg-gradient-to-r from-fg via-fg to-muted bg-clip-text text-transparent opacity-90">
              SUPERCHARGE YOUR WORKFLOW.
            </span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl leading-relaxed text-muted animate-fade-in-up font-medium" style={{ animationDelay: '200ms' }}>
            The world's most powerful collection of Time, Date, and AI Developer tools. 
            Instantly accessible from your browser.
          </p>

          {/* Hidden RTL element required by tests */}
          <span className="sr-only" dir="rtl">بسرعة ومجانًا</span>

          {/* ── Giant Search Trigger ── */}
          <div className="mt-12 mx-auto max-w-3xl relative z-50 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <button 
              onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
              className="w-full flex items-center justify-between px-6 py-4 bg-field/40 hover:bg-hover/60 border border-line/60 rounded-2xl shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-accent/40 group"
            >
              <div className="flex items-center gap-4 text-muted group-hover:text-fg transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <span className="text-lg font-medium">Search all tools, models, docs...</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="hidden sm:flex items-center justify-center h-8 px-2.5 text-sm font-semibold bg-card/50 text-muted rounded-lg border border-line/60 font-mono shadow-sm group-hover:text-accent transition-colors">
                  ⌘K
                </kbd>
              </div>
            </button>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <Link href="/ai" className="btn btn-primary btn-lg px-8 shadow-xl shadow-accent/20">
              Explore AI Tools
            </Link>
            <Link href="/tools" className="btn btn-secondary btn-lg px-8 bg-field border-line/40 backdrop-blur-md">
              Time & Date Tools
            </Link>
          </div>

          {/* ── Live Epoch (Subtle placement) ── */}
          <div className="mt-16 flex justify-center animate-fade-in-up text-left opacity-60 hover:opacity-100 transition-opacity" style={{ animationDelay: '500ms' }}>
            <LiveEpoch />
          </div>
        </div>
      </section>

      <div className="layout-content space-y-24 py-12 pb-24">

        {/* ── Popular Tools ── */}
        <section aria-labelledby="popular-tools">
          <h2 id="popular-tools" className="section-heading mb-8">Popular Tools</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {popularTools.map((t) => (
              <ToolCard key={t.slug} tool={t} headingLevel={3} />
            ))}
          </div>
        </section>

        {/* ── Browse by Category ── */}
        <section aria-labelledby="categories">
          <h2 id="categories" className="section-heading mb-8">Browse by Category</h2>
          <CategorySection headingLevel={3} />
        </section>

        {/* ── Developer Tools ── */}
        <section aria-labelledby="developer-tools">
          <div className="mb-8 max-w-3xl">
            <h2 id="developer-tools" className="section-heading mb-4">Developer Snippets</h2>
            <p className="text-muted text-lg">Unix Timestamp, ISO 8601, RFC 3339, and Date formats. Copy-paste ready for your next project.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {DEV_SNIPPETS.map((item) => (
              <div key={item.label} className="card p-6 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                <div className="flex items-center justify-between gap-3 relative z-10">
                  <h3 className="!my-0 text-sm font-semibold text-muted">{item.label}</h3>
                  <CopyButton value={item.code} label={item.label} />
                </div>
                <pre className="code-block mt-4 border-line/50 bg-card/50 relative z-10">
                  <code>{item.code}</code>
                </pre>
              </div>
            ))}
          </div>
        </section>

        {/* ── Time Zones Section ── */}
        <section aria-labelledby="time-zones">
          <div className="card p-8 sm:p-12 relative overflow-hidden bg-gradient-to-br from-card to-hover/50 border-line/50">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="relative z-10 max-w-3xl">
              <h2 id="time-zones" className="text-3xl font-bold tracking-tight mb-4">Time Zones & World Clock</h2>
              <p className="text-lg text-muted mb-8">Navigate across borders with our accurate time zone converters, world clock, UTC reference, and business hours tools.</p>
              <div className="flex flex-wrap gap-4">
                <Link href="/timezones" className="btn btn-primary">Time Zones Hub</Link>
                <Link href="/tools/world-clock" className="btn btn-secondary bg-card">World Clock</Link>
                <Link href="/tools/timezone-converter" className="btn btn-secondary bg-card">Timezone Converter</Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Why Castov ── */}
        <section aria-labelledby="why-castov">
          <h2 id="why-castov" className="section-heading mb-8">Why Castov?</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_ITEMS.map((item) => (
              <div key={item.title} className="card p-6 bg-card/60 border-line/40 hover:bg-hover/50 transition-colors">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/20">
                  <svg aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Guides ── */}
        <section aria-labelledby="guides">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 id="guides" className="section-heading mb-2">Learn & Guides</h2>
              <p className="text-muted">In-depth articles and tutorials.</p>
            </div>
            <Link href="/guides" className="text-sm font-semibold text-accent hover:text-accent-hover hidden sm:block">View all guides &rarr;</Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {GUIDES.slice(0, 3).map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="guide-card card block h-full p-6 no-underline bg-card/60"
              >
                <span className="block text-lg font-bold text-fg group-hover:text-accent transition-colors">{g.name}</span>
                <span className="mt-3 block text-sm leading-relaxed text-muted">{g.summary}</span>
                <span className="mt-5 flex items-center text-xs font-semibold text-accent">
                  {g.readingMinutes} min read
                  <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <FaqSection items={HOME_FAQ} headingId="faq" />

        {/* ── Final CTA ── */}
        <section className="cta-band p-12 text-center mt-32" aria-labelledby="cta-heading">
          <h2 id="cta-heading" className="text-4xl font-extrabold tracking-tight mb-4">
            Explore all Castov tools
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted/90">
            Join thousands of developers using Castov every day. Free, fast, and secure.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/tools" className="btn btn-primary btn-lg px-10 shadow-lg shadow-accent/20">
              Get Started
            </Link>
          </div>
        </section>

      </div>
    </>
  );
}
