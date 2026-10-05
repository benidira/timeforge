import Link from "next/link";
import { toolPath, type Tool } from "@/content/tools";
import { ArrowRightIcon, CategoryIcon } from "./icons";

export function ToolCard({ tool, headingLevel = 3 }: { tool: Tool; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className="tool-card card group relative flex h-full flex-col p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      <div className="flex items-center justify-between gap-2 mb-4">
        <span className="tool-card-icon flex h-12 w-12 items-center justify-center rounded-xl bg-hover/80 text-accent transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
          <CategoryIcon category={tool.category} />
        </span>
        <span className="rounded-full bg-hover/60 border border-line px-3 py-1 text-xs font-semibold tracking-wide text-muted">
          {tool.category}
        </span>
      </div>
      <Heading className="text-lg sm:text-xl font-bold tracking-tight text-fg group-hover:text-accent transition-colors">
        {tool.name}
      </Heading>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted line-clamp-2">
        {tool.cardDescription}
      </p>
      <Link
        href={toolPath(tool.slug)}
        className="mt-6 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-accent no-underline group-hover:underline"
        aria-label={`Open ${tool.name}`}
      >
        <span className="tool-card-stretched-link">Open tool</span>
        <ArrowRightIcon className="tool-card-arrow transition-transform duration-300 group-hover:translate-x-1.5" />
      </Link>
    </article>
  );
}
