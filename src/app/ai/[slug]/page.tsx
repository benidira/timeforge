import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AI_TOOLS, AI_CATEGORIES, getAiToolBySlug, getAiToolsByCategory, type AiTool } from "@/lib/ai-tools";
import { buildMetadata, softwareAppJsonLd, howToJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";

import { ToolForm } from "@/components/ai-tools/ToolForm";
import { CursorRulesGenerator } from "@/components/ai-tools/CursorRulesGenerator";
import { OllamaModelfileBuilder } from "@/components/ai-tools/OllamaModelfileBuilder";
import { VercelAiSdkGenerator } from "@/components/ai-tools/VercelAiSdkGenerator";
import { JsonSchemaToolBuilder } from "@/components/ai-tools/JsonSchemaToolBuilder";
import { LlmCostCalculator } from "@/components/ai-tools/LlmCostCalculator";
import { McpConfigBuilder } from "@/components/ai-tools/McpConfigBuilder";
import { GgufVramEstimator } from "@/components/ai-tools/GgufVramEstimator";
import { JsonlDatasetFormatter } from "@/components/ai-tools/JsonlDatasetFormatter";
import { ClaudeSystemPromptBuilder } from "@/components/ai-tools/ClaudeSystemPromptBuilder";
import { RagChunkSizeCalculator } from "@/components/ai-tools/RagChunkSizeCalculator";

export function generateStaticParams() {
  const params = [];
  for (const t of AI_TOOLS) params.push({ slug: t.slug });
  for (const c of AI_CATEGORIES) params.push({ slug: c });
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  const tool = getAiToolBySlug(slug);
  if (tool) {
    return buildMetadata({
      title: `${tool.name} | Castov AI Tools`,
      description: tool.description,
      path: `/ai/${tool.slug}`,
    });
  }

  if (AI_CATEGORIES.includes(slug)) {
    const name = slug.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase());
    return buildMetadata({
      title: `${name} AI Tools | TimeForge`,
      description: `A collection of enterprise-grade AI developer tools for ${name}.`,
      path: `/ai/${slug}`,
    });
  }

  return {};
}

function CategoryPageView({ category }: { category: string }) {
  const tools = getAiToolsByCategory(category);
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

function ToolPageView({ tool }: { tool: AiTool }) {
  const appLd = softwareAppJsonLd({
    name: tool.name,
    description: tool.description,
    url: `/ai/${tool.slug}`,
    category: "DeveloperApplication",
  });

  const howToLd = howToJsonLd({
    name: tool.pseoContent.h2,
    description: `Instructions on using the ${tool.name}.`,
    steps: [
      { name: "Enter requirements", text: "Fill out the context fields with your specific developer needs." },
      { name: "Generate", text: "Click the generate button to instantly output optimized AI configuration." },
      { name: "Copy and Use", text: "Copy the resulting code block into your project or IDE." }
    ]
  });

  return (
    <>
      <JsonLd data={[appLd, howToLd]} />
      <div className="layout-content py-10 md:py-16">
        <div className="mb-6">
          <nav className="flex items-center text-sm font-medium text-muted space-x-2">
            <Link href="/ai" className="hover:text-fg transition-colors">AI Directory</Link>
            <span>&rsaquo;</span>
            <Link href={`/ai/${tool.category}`} className="hover:text-fg transition-colors uppercase tracking-wider text-xs">
              {tool.category}
            </Link>
          </nav>
        </div>

        <header className="mb-12 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-fg mb-4">
            {tool.name}
          </h1>
          <p className="text-lg text-muted">
            {tool.description}
          </p>
        </header>

        <section aria-label="Tool Interface" className="mb-20">
          {tool.slug === "cursorrules-generator" ? (
            <CursorRulesGenerator />
          ) : tool.slug === "ollama-modelfile-builder" ? (
            <OllamaModelfileBuilder />
          ) : tool.slug === "vercel-ai-sdk-code-generator" ? (
            <VercelAiSdkGenerator />
          ) : tool.slug === "json-schema-tool-calling-generator" ? (
            <JsonSchemaToolBuilder />
          ) : tool.slug === "llm-api-cost-calculator" ? (
            <LlmCostCalculator />
          ) : tool.slug === "mcp-config-builder" ? (
            <McpConfigBuilder />
          ) : tool.slug === "gguf-vram-estimator" ? (
            <GgufVramEstimator />
          ) : tool.slug === "jsonl-dataset-formatter" ? (
            <JsonlDatasetFormatter />
          ) : tool.slug === "claude-system-prompt-builder" ? (
            <ClaudeSystemPromptBuilder />
          ) : tool.slug === "rag-chunk-size-calculator" ? (
            <RagChunkSizeCalculator />
          ) : (
            <ToolForm tool={tool} />
          )}
        </section>

        <section aria-labelledby="pseo-heading" className="max-w-3xl prose prose-invert prose-tf">
          <h2 id="pseo-heading">{tool.pseoContent.h2}</h2>
          <p>{tool.pseoContent.content}</p>
          <h3>Why use a dedicated {tool.name.toLowerCase()}?</h3>
          <p>
            As AI developer tools become more complex, writing boilerplate code, complex system prompts, 
            or schema definitions manually is error-prone. This tool guarantees structured, predictable 
            output tailored to your exact stack without the hassle of manual formatting.
          </p>
        </section>
      </div>
    </>
  );
}

export default async function AiUnifiedPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const tool = getAiToolBySlug(slug);
  if (tool) {
    return <ToolPageView tool={tool} />;
  }

  if (AI_CATEGORIES.includes(slug)) {
    return <CategoryPageView category={slug} />;
  }

  notFound();
}
