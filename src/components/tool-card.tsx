import Link from "next/link";
import { toolPath, type Tool } from "@/content/tools";
import { ArrowRightIcon, CategoryIcon } from "./icons";

export function ToolCard({ tool, headingLevel = 3 }: { tool: Tool; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className="tool-card card group relative flex h-full flex-col p-5">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="tool-card-icon flex h-10 w-10 items-center justify-center rounded-xl bg-hover/80 text-accent transition-transform duration-200 group-hover:scale-105">
          <CategoryIcon category={tool.category} />
        </span>
        <span className="rounded-md bg-hover/60 px-2 py-0.5 text-[11px] font-medium tracking-wide text-muted">
          {tool.category}
        </span>
      </div>
      <Heading className="text-base sm:text-lg font-bold tracking-tight text-fg group-hover:text-accent transition-colors">
        {tool.name}
      </Heading>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted line-clamp-2">
        {tool.cardDescription}
      </p>
      <Link
        href={toolPath(tool.slug)}
        className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-accent no-underline group-hover:underline"
        aria-label={`Open ${tool.name}`}
      >
        <span className="tool-card-stretched-link">Open tool</span>
        <ArrowRightIcon className="tool-card-arrow transition-transform duration-200 group-hover:translate-x-1" />
      </Link>
    </article>
  );
}
