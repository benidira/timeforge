import type { PageModel } from "@/lib/pseo/types";
import { Breadcrumb } from "@/components/breadcrumb";
import { AdSlot } from "@/components/ad-slot";
import { ToolHost } from "./tool-host";
import { Blocks } from "./blocks";
import { FaqSection } from "@/components/faq-section";
import { RelatedMesh } from "./related-mesh";

export function PageShell({ page }: { page: PageModel }) {
  const mid = Math.ceil(page.blocks.length / 2);
  const firstHalf = page.blocks.slice(0, mid);
  const secondHalf = page.blocks.slice(mid);

  return (
    <article className="mx-auto max-w-4xl px-4 py-8">
      <Breadcrumb crumbs={page.breadcrumbs} path={page.path} />

      <h1 className="text-3xl font-semibold">{page.h1}</h1>
      <p className="mt-3 text-muted">{page.intro}</p>

      <AdSlot placement="tool-top" />

      {page.tool ? <ToolHost config={page.tool} /> : null}

      <Blocks blocks={firstHalf} />

      <AdSlot placement="content-middle" />

      <Blocks blocks={secondHalf} />

      <AdSlot placement="content-bottom" />

      <FaqSection items={page.faq} headingId="faq" />

      <RelatedMesh groups={page.related} />

      {page.jsonLd.map((ld, i) => {
        const json = JSON.stringify(ld).replace(/</g, "\\u003c");
        return (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: json }}
          />
        );
      })}
    </article>
  );
}
