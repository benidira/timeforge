import Link from "next/link";
import { TOOLS, getTool, toolPath, type ToolSlug } from "@/content/tools";

interface RelatedToolsProps {
  /** Tool slugs to show, in order. Unknown slugs are ignored. */
  slugs: readonly ToolSlug[];
  heading?: string;
  headingLevel?: 2 | 3;
}

/** Reusable internal-link block. */
export function RelatedTools({ slugs, heading = "Related tools", headingLevel = 2 }: RelatedToolsProps) {
  const tools = slugs.map((s) => getTool(s)).filter((t): t is (typeof TOOLS)[number] => Boolean(t));
  if (tools.length === 0) return null;
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <section aria-labelledby="related-tools-heading" className="mt-12">
      <Heading id="related-tools-heading" className="mb-4 text-xl font-bold">
        {heading}
      </Heading>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <li key={t.slug}>
            <Link href={toolPath(t.slug)} className="card block h-full p-4 text-fg no-underline hover:border-accent">
              <span className="block font-semibold">{t.name}</span>
              <span className="mt-1 block text-sm text-muted">{t.cardDescription}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
