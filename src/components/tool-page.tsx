import Link from "next/link";
import { getExamples } from "@/content/examples";
import { getGuide } from "@/content/guides";
import { toolPath, type Tool } from "@/content/tools";
import { faqJsonLd, webApplicationJsonLd } from "@/lib/seo";
import { AdSlot } from "./ad-slot";
import { Breadcrumb } from "./breadcrumb";
import { ExamplesSection } from "./examples-section";
import { FaqSection } from "./faq-section";
import { JsonLd } from "./json-ld";
import { RelatedTools } from "./related-tools";
import { ToolInterface } from "./tool-interface";

/** Shared layout for every tool page: breadcrumb, H1, tool, then explanation, examples, FAQ, links. */
export function ToolPage({ tool }: { tool: Tool }) {
  const path = toolPath(tool.slug);
  const guide = tool.guide ? getGuide(tool.guide) : undefined;
  const examples = getExamples(tool.slug);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-10">
      <JsonLd data={webApplicationJsonLd({ name: tool.name, description: tool.metaDescription, path })} />
      <Breadcrumb
        path={path}
        crumbs={[{ name: "Home", href: "/" }, { name: "Tools", href: "/tools" }, { name: tool.name }]}
      />

      <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{tool.name}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">{tool.intro}</p>

      <AdSlot placement="tool-top" />

      <section aria-label={`${tool.name} tool`} className="card mt-8 p-4 sm:p-6">
        <ToolInterface slug={tool.slug} />
      </section>

      <article className="prose-tf mt-4">
        {tool.sections.map((s) => (
          <section key={s.heading}>
            <h2>{s.heading}</h2>
            {s.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </section>
        ))}
        {guide ? (
          <p className="mt-4">
            Want the background? Read <Link href={`/guides/${guide.slug}`}>{guide.name}</Link>.
          </p>
        ) : null}

        <section aria-labelledby="how-to-use">
          <h2 id="how-to-use">How to use this tool</h2>
          <ol>
            {tool.howTo.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      </article>

      <AdSlot placement="content-middle" />

      <div className="mt-10">
        <ExamplesSection examples={examples} />
      </div>

      <div className="mt-10">
        <FaqSection items={tool.faq} />
      </div>

      <AdSlot placement="content-bottom" />

      <RelatedTools slugs={tool.related} />

      <JsonLd data={faqJsonLd(tool.faq)} />
    </div>
  );
}
