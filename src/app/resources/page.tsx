import type { Metadata } from "next";
import Link from "next/link";
import { TOOLS } from "@/content/tools";
import { GUIDES } from "@/content/guides";
import { StaticPage } from "@/components/static-page";
import { ToolCard } from "@/components/tool-card";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Resources – Time, Timestamp & Developer Resources | TimeForge",
  description:
    "Curated resources for developers working with time: all TimeForge tools, developer guides, timezone references and timestamp documentation.",
  path: "/resources",
});

export default function ResourcesPage() {
  return (
    <StaticPage
      title="Resources"
      intro="All TimeForge resources are gathered here – tools, guides, and reference material for working with time, timestamps and time zones."
      crumbs={[{ name: "Home", href: "/" }, { name: "Resources" }]}
      path="/resources"
    >
      {/* Tools */}
      <h2>All Tools</h2>
      <div className="not-prose grid gap-4 mt-4 mb-8 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((t) => (
          <ToolCard key={t.slug} tool={t} headingLevel={3} />
        ))}
      </div>

      {/* Guides */}
      <h2>All Guides</h2>
      <ul className="not-prose grid gap-4 mt-4 mb-8 sm:grid-cols-2 lg:grid-cols-3 list-none p-0">
        {GUIDES.map((g) => (
          <li key={g.slug} className="!mt-0">
            <Link href={`/guides/${g.slug}`} className="card block p-4 no-underline hover:border-accent transition-colors">
              <span className="block font-semibold text-fg">{g.name}</span>
              <span className="block text-sm text-muted mt-1">{g.summary}</span>
              <span className="block text-xs text-muted mt-2">{g.readingMinutes} min read →</span>
            </Link>
          </li>
        ))}
      </ul>
    </StaticPage>
  );
}
