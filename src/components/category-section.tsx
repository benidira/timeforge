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
          <div key={category} className="bg-[#0a0a0a] border border-white/5 hover:border-white/20 rounded-2xl p-6 transition-all duration-300">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-fg">
                <CategoryIcon category={category} />
              </span>
              <div className="min-w-0">
                <Heading className="text-xl font-bold text-fg tracking-tight">{category}</Heading>
                <p className="text-sm font-semibold text-zinc-500">{tools.length} tools</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-zinc-400 leading-relaxed">{CATEGORY_DESCRIPTIONS[category]}</p>
            <ul className="mt-6 space-y-1 border-t border-white/10 pt-4">
              {tools.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={toolPath(t.slug)}
                    className="group flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-300 no-underline hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <span className="truncate">{t.name}</span>
                    <ArrowRightIcon className="w-4 h-4 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
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
