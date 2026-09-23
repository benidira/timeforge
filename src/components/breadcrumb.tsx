import Link from "next/link";
import { breadcrumbJsonLd, type Crumb } from "@/lib/seo";
import { JsonLd } from "./json-ld";

/** Visible breadcrumb trail plus matching BreadcrumbList structured data. */
export function Breadcrumb({ crumbs, path }: { crumbs: Crumb[]; path: string }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1;
            return (
              <li key={c.name} className="flex items-center gap-2">
                {c.href && !last ? <Link href={c.href}>{c.name}</Link> : <span aria-current="page">{c.name}</span>}
                {!last ? <span aria-hidden="true">/</span> : null}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(crumbs, path)} />
    </>
  );
}
