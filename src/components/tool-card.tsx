import Link from "next/link";
import { toolPath, type Tool } from "@/content/tools";
import { ArrowRightIcon, CategoryIcon } from "./icons";

export function ToolCard({ tool, headingLevel = 3 }: { tool: Tool; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className="tool-card group relative flex h-full flex-col p-6 bg-[#0a0a0a] border border-white/5 hover:border-white/20 rounded-2xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.03)] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="flex items-center justify-between gap-2 mb-4 relative z-10">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-fg transition-transform duration-300 group-hover:scale-105 group-hover:bg-white/10">
          <CategoryIcon category={tool.category} />
        </span>
        <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted">
          {tool.category}
        </span>
      </div>
      <Heading className="text-lg font-bold tracking-tight text-fg group-hover:text-white transition-colors relative z-10">
        {tool.name}
      </Heading>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted line-clamp-2 relative z-10">
        {tool.cardDescription}
      </p>
      <Link
        href={toolPath(tool.slug)}
        className="mt-6 inline-flex items-center gap-1.5 self-start text-xs font-bold text-fg/70 no-underline group-hover:text-white uppercase tracking-wider transition-colors relative z-10"
        aria-label={`Open ${tool.name}`}
      >
        <span className="tool-card-stretched-link">Open tool</span>
        <ArrowRightIcon className="transition-transform duration-300 group-hover:translate-x-1 w-4 h-4" />
      </Link>
    </article>
  );
}
