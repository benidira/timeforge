import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAiToolsByCategory, AI_CATEGORIES } from "@/lib/ai-tools";
import { buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return AI_CATEGORIES.map((category) => ({ category }));
}

export function generateMetadata({ params }: { params: { category: string } }): Metadata {
  const category = params.category;
  if (!AI_CATEGORIES.includes(category)) return {};

  const name = category.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase());
  return buildMetadata({
    title: `${name} AI Tools | TimeForge`,
    description: `A collection of enterprise-grade AI developer tools for ${name}.`,
    path: `/ai/${category}`,
  });
}

export default function AiCategoryPage({ params }: { params: { category: string } }) {
  const category = params.category;
  const tools = getAiToolsByCategory(category);

  if (!tools.length) notFound();

  const name = category.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="layout-content py-12 md:py-20">
      <div className="max-w-3xl mb-12">
        <div className="mb-4">
          <Link href="/ai" className="text-sm font-medium text-muted hover:text-fg transition-colors">
            &larr; Back to AI Directory
          </Link>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-fg mb-4">
          {name} AI Tools
        </h1>
        <p className="text-lg text-muted">
          Browse our collection of specialized {name.toLowerCase()} utilities for developers.
        </p>
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
    </div>
  );
}
