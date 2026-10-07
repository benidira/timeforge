import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/content/guides";
import { TOOL_CATEGORIES, TOOLS } from "@/content/tools";
import { StaticPage } from "@/components/static-page";
import { ToolCard } from "@/components/tool-card";
import { buildMetadata } from "@/lib/seo";

const TITLE = "All Developer Tools | Castov";
const DESCRIPTION =
  "Browse all free Castov tools: timestamp converters, date calculators, time zone tools, and developer utilities like cron and RFC 3339.";

export const metadata: Metadata = buildMetadata({ title: TITLE, description: DESCRIPTION, path: "/tools" });

export default function ToolsPage() {
  return (
    <StaticPage
      title="Tools"
      intro={`${TOOLS.length} free tools for working with Unix time, dates, configurations, and developer workflows. Every tool runs instantly in your browser.`}
      crumbs={[{ name: "Home", href: "/" }, { name: "Tools" }]}
      path="/tools"
    >
      {TOOL_CATEGORIES.map((category) => {
        const tools = TOOLS.filter((t) => t.category === category);
        return (
          <section key={category} aria-labelledby={`cat-${category}`} className="mb-10">
            <h2 id={`cat-${category}`} className="mb-4 text-xl font-bold tracking-tight">
              {category}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map((t) => (
                <ToolCard key={t.slug} tool={t} headingLevel={3} />
              ))}
            </div>
          </section>
        );
      })}
      <h2>Learn the background</h2>
      <p>
        Not sure which tool you need? Start with{" "}
        <Link href={`/guides/${GUIDES[0].slug}`}>{GUIDES[0].name}</Link>, or browse all <Link href="/guides">guides</Link>.
      </p>
    </StaticPage>
  );
}
