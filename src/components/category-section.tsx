import Link from "next/link";
import { TOOL_CATEGORIES, TOOLS, toolPath } from "@/content/tools";
import { ArrowRightIcon, CategoryIcon } from "./icons";

const CATEGORY_DESCRIPTIONS: Record<(typeof TOOL_CATEGORIES)[number], string> = {
  Timestamp: "Convert, validate, compare and work with Unix timestamps.",
  "Date & Duration": "Calculate differences, durations, and add or subtract time from a date.",
  "Time Zones": "Convert, compare and browse time across the world's time zones.",
  Developer: "ISO 8601, RFC 3339, cron and other formats developers work with daily.",
};

/** Grouped tool listing used on the homepage and the /tools page, for visual consistency. */
export function CategorySection({ headingLevel = 2 }: { headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {TOOL_CATEGORIES.map((category) => {
        const tools = TOOLS.filter((t) => t.category === category);
        return (
          <div key={category} className="card p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-hover text-accent">
                <CategoryIcon category={category} />
              </span>
              <div className="min-w-0">
                <Heading className="text-lg font-semibold">{category}</Heading>
                <p className="text-sm text-muted">{tools.length} tools</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted">{CATEGORY_DESCRIPTIONS[category]}</p>
            <ul className="mt-4 space-y-1 border-t border-line pt-3">
              {tools.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={toolPath(t.slug)}
                    className="group flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm text-fg no-underline hover:bg-hover"
                  >
                    <span className="truncate">{t.name}</span>
                    <ArrowRightIcon className="tool-card-arrow shrink-0 text-muted group-hover:text-accent" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
