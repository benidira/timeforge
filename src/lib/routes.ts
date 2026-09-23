import { GUIDES } from "@/content/guides";
import { TOOLS, toolPath } from "@/content/tools";

/** Every indexable path of the site, in sitemap order. */
export function allPaths(): string[] {
  return [
    "/",
    "/tools",
    ...TOOLS.map((t) => toolPath(t.slug)),
    "/guides",
    ...GUIDES.map((g) => `/guides/${g.slug}`),
    "/about",
    "/privacy",
    "/terms",
    "/contact",
  ];
}
