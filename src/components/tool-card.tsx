import Link from "next/link";
import { toolPath, type Tool } from "@/content/tools";
import { ArrowRightIcon, CategoryIcon } from "./icons";

export function ToolCard({ tool, headingLevel = 3 }: { tool: Tool; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className="tool-card card relative flex h-full flex-col p-5">
      <span className="tool-card-icon mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-hover text-accent">
        <CategoryIcon category={tool.category} />
      </span>
      <Heading className="text-lg font-semibold">{tool.name}</Heading>
      <p className="mt-1 flex-1 text-sm text-muted">{tool.cardDescription}</p>
      <Link
        href={toolPath(tool.slug)}
        className="mt-4 inline-flex items-center gap-1.5 self-start font-medium text-link no-underline"
        aria-label={`Open ${tool.name}`}
      >
        <span className="tool-card-stretched-link">Open tool</span>
        <ArrowRightIcon className="tool-card-arrow" />
      </Link>
    </article>
  );
}
