import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/content/guides";
import { StaticPage } from "@/components/static-page";
import { buildMetadata } from "@/lib/seo";

const TITLE = "Guides to Unix Time, ISO 8601 and Time Zones | TimeForge";
const DESCRIPTION =
  "Short, practical guides to Unix time, seconds versus milliseconds, ISO 8601, time zones and daylight saving time, and the Year 2038 problem.";

export const metadata: Metadata = buildMetadata({ title: TITLE, description: DESCRIPTION, path: "/guides" });

export default function GuidesPage() {
  return (
    <StaticPage
      title="Guides"
      intro="Short explanations of the ideas behind the tools, written for developers and curious people alike."
      crumbs={[{ name: "Home", href: "/" }, { name: "Guides" }]}
      path="/guides"
    >
      <ul className="grid gap-4 sm:grid-cols-2" style={{ listStyle: "none", margin: 0 }}>
        {GUIDES.map((g) => (
          <li key={g.slug} className="!mt-0">
            <Link href={`/guides/${g.slug}`} className="card block h-full p-5 no-underline hover:border-accent">
              <span className="block text-lg font-semibold text-fg">{g.name}</span>
              <span className="mt-1 block text-sm text-muted">{g.summary}</span>
              <span className="mt-3 block text-sm text-muted">{g.readingMinutes} min read</span>
            </Link>
          </li>
        ))}
      </ul>
    </StaticPage>
  );
}
