import type { Metadata } from "next";
import Link from "next/link";
import { TOOLS } from "@/content/tools";
import { GUIDES } from "@/content/guides";
import { StaticPage } from "@/components/static-page";
import { ToolCard } from "@/components/tool-card";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Developer Hub – Timestamp & Time Tools for Developers | TimeForge",
  description:
    "Free developer resources for working with Unix timestamps, ISO 8601, RFC 3339, cron expressions and time zones in JavaScript, Python, Go and more.",
  path: "/developer",
});

const DEV_TOOL_SLUGS = [
  "iso-8601-converter",
  "rfc-3339-converter",
  "cron-generator",
  "iso-8601-to-unix",
  "unix-to-iso-8601",
  "business-hours-converter",
  "unix-timestamp-batch-converter",
  "unix-timestamp-validator",
];

const CODE_SNIPPETS = [
  {
    lang: "JavaScript",
    label: "Get current Unix timestamp",
    code: "Math.floor(Date.now() / 1000)            // seconds\nDate.now()                              // milliseconds",
  },
  {
    lang: "Python",
    label: "Convert timestamp to ISO 8601",
    code: "import datetime\ndt = datetime.datetime.utcfromtimestamp(1700000000)\ndt.isoformat() + 'Z'  # '2023-11-14T22:13:20Z'",
  },
  {
    lang: "Go",
    label: "Parse ISO 8601 string",
    code: 'import "time"\nt, _ := time.Parse(time.RFC3339, "2023-11-14T22:13:20Z")\nt.Unix() // 1700000000',
  },
  {
    lang: "SQL",
    label: "Extract Unix timestamp",
    code: "-- PostgreSQL\nEXTRACT(EPOCH FROM NOW())::BIGINT\n-- MySQL\nUNIX_TIMESTAMP(NOW())",
  },
];

const DEV_GUIDE_SLUGS = [
  "iso-8601-date-format-guide",
  "cron-expressions-explained",
  "time-zones-and-dst-for-developers",
  "seconds-vs-milliseconds-timestamps",
];

export default function DeveloperPage() {
  const devTools = TOOLS.filter((t) => DEV_TOOL_SLUGS.includes(t.slug));
  const devGuides = GUIDES.filter((g) => DEV_GUIDE_SLUGS.includes(g.slug));

  return (
    <StaticPage
      title="Developer Hub"
      intro="Code patterns, format references, and interactive tools for developers working with time, timestamps, and scheduling."
      crumbs={[{ name: "Home", href: "/" }, { name: "Developer" }]}
      path="/developer"
    >
      {/* Quick Reference */}
      <h2>Quick Code Reference</h2>
      <p>
        Common operations across popular languages. Use the interactive tools below to convert and validate values instantly.
      </p>
      <div className="not-prose grid gap-4 mt-4 mb-8 sm:grid-cols-2">
        {CODE_SNIPPETS.map((s) => (
          <div key={s.lang} className="card p-4 border border-line">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-muted">{s.lang}</span>
              <span className="text-xs text-muted">{s.label}</span>
            </div>
            <pre className="code-block mt-0 text-xs sm:text-sm overflow-x-auto">
              <code>{s.code}</code>
            </pre>
          </div>
        ))}
      </div>

      {/* Developer Tools */}
      <h2>Developer Tools</h2>
      <p>
        Interactive tools for ISO 8601, RFC 3339, cron expressions, batch conversion, and validation — all run in your browser.
      </p>
      <div className="not-prose grid gap-4 mt-4 mb-8 sm:grid-cols-2">
        {devTools.map((t) => (
          <ToolCard key={t.slug} tool={t} headingLevel={3} />
        ))}
      </div>

      {/* Format Reference */}
      <h2>Format Reference</h2>

      <h3>ISO 8601</h3>
      <p>
        The international standard for date and time strings. A full datetime looks like{" "}
        <code>2026-09-20T14:30:00Z</code> (UTC) or <code>2026-09-20T16:30:00+02:00</code> (with offset).
        The <code>T</code> separates date from time; <code>Z</code> means UTC.
      </p>

      <h3>RFC 3339</h3>
      <p>
        A strict profile of ISO 8601 used by most internet protocols. It requires a full timestamp with offset or Z.
        JSON APIs, JWT tokens, and HTTP headers typically use RFC 3339. Example: <code>2026-09-20T14:30:00.000Z</code>.
      </p>

      <h3>Unix Timestamp</h3>
      <p>
        Seconds (or milliseconds) elapsed since <strong>1970-01-01T00:00:00Z</strong>. Today&apos;s 10-digit value
        is seconds; 13 digits is milliseconds. Use the Auto mode in our converters to detect the unit automatically.
      </p>

      <h3>Cron Expressions</h3>
      <p>
        Five-field scheduler syntax: <code>minute hour day month weekday</code>. Example: <code>0 9 * * 1-5</code>{" "}
        runs every weekday at 09:00. Use <Link href="/cron-generator">Cron Generator</Link> to build and validate expressions interactively.
      </p>

      {/* Developer Guides */}
      <h2>Developer Guides</h2>
      <p>In-depth explanations of time-related concepts every developer should know.</p>
      <ul className="not-prose list-none p-0 grid gap-3 mt-4 mb-8 sm:grid-cols-2">
        {devGuides.map((g) => (
          <li key={g.slug} className="!mt-0">
            <Link href={`/guides/${g.slug}`} className="card block p-4 no-underline hover:border-accent transition-colors">
              <span className="block font-semibold text-fg">{g.name}</span>
              <span className="block text-sm text-muted mt-1">{g.summary}</span>
              <span className="block text-xs text-muted mt-2">{g.readingMinutes} min read →</span>
            </Link>
          </li>
        ))}
      </ul>

      <p>
        Browse all <Link href="/guides">guides</Link> or explore the full{" "}
        <Link href="/tools">tool catalogue</Link>.
      </p>
    </StaticPage>
  );
}
