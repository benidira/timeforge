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
    <div className="layout-content py-16 md:py-24">
      <header className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-fg mb-6">
          AI Developer Tools
        </h1>
        <p className="text-xl text-muted">
          A world-class registry of optimized utilities for AI engineers. 
          Configure, generate, and calculate everything from context windows to system prompts.
        </p>
      </header>

      <div className="space-y-16">
        {AI_CATEGORIES.map((category) => {
          const tools = getAiToolsByCategory(category);
          const name = category.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase());
          return (
            <section key={category} aria-labelledby={`cat-${category}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 id={`cat-${category}`} className="section-heading !mb-0 text-2xl">
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
                    className="card p-5 group flex flex-col transition-all duration-200 hover:-translate-y-1 hover:border-accent hover:shadow-lg focus-within:border-accent bg-card/60"
                  >
                    <h3 className="text-base font-semibold text-fg group-hover:text-accent transition-colors">
                      {tool.name}
                    </h3>
                    <p className="mt-2 text-sm text-muted line-clamp-2">
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
