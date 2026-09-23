import type { MetadataRoute } from "next";
import { allPaths } from "@/lib/routes";
import { SITE, absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(SITE.contentUpdated);
  return allPaths().map((path) => ({ url: absoluteUrl(path), lastModified }));
}
