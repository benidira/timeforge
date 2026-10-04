import Link from "next/link";
import type { RelatedGroup } from "@/lib/pseo/types";

export function RelatedMesh({ groups }: { groups: RelatedGroup[] }) {
  if (!groups || groups.length === 0) return null;
  return (
    <>
      {groups.map((group, gi) => (
        <section key={gi} className="mt-12" aria-labelledby={`related-${gi}`}>
          <h2 id={`related-${gi}`} className="section-heading mb-4">
            {group.heading}
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 not-prose list-none p-0">
            {group.links.map((link, li) => (
              <li key={`${link.href}-${li}`}>
                <Link
                  href={link.href}
                  className="card block p-4 no-underline hover:border-accent transition-colors h-full"
                >
                  <span className="block font-semibold text-fg">
                    {link.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
