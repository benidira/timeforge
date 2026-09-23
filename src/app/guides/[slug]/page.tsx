import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GUIDES, getGuide } from "@/content/guides";
import { RelatedTools } from "@/components/related-tools";
import { StaticPage } from "@/components/static-page";
import type { ToolSlug } from "@/content/tools";
import { buildMetadata } from "@/lib/seo";

type Params = { slug: string };


export function generateStaticParams(): Params[] {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return buildMetadata({ title: guide.seoTitle, description: guide.metaDescription, path: `/guides/${guide.slug}` });
}

export default async function GuidePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  return (
    <StaticPage
      title={guide.name}
      intro={guide.summary}
      crumbs={[{ name: "Home", href: "/" }, { name: "Guides", href: "/guides" }, { name: guide.name }]}
      path={`/guides/${guide.slug}`}
    >
      {guide.sections.map((s) => (
        <section key={s.heading}>
          <h2>{s.heading}</h2>
          {s.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
          {s.code ? (
            <pre className="code-block" tabIndex={0}>
              <code>{s.code}</code>
            </pre>
          ) : null}
        </section>
      ))}
      <RelatedTools slugs={guide.tools as ToolSlug[]} heading="Try it with these tools" />
    </StaticPage>
  );
}
