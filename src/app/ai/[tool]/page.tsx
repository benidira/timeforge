import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AI_TOOLS, getAiToolBySlug } from "@/lib/ai-tools";
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

export function generateStaticParams() {
  return AI_TOOLS.map((t) => ({ tool: t.slug }));
}

export function generateMetadata({ params }: { params: { tool: string } }): Metadata {
  const tool = getAiToolBySlug(params.tool);
  if (!tool) return {};

  return buildMetadata({
    title: `${tool.name} | Castov AI Tools`,
    description: tool.description,
    path: `/ai/${tool.slug}`,
  });
}

export default function AiToolPage({ params }: { params: { tool: string } }) {
  const tool = getAiToolBySlug(params.tool);
  if (!tool) notFound();

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
