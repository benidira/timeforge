import type { PageModel, PageType, Resolver } from "./types";
import { convertResolver } from "./resolvers/convert";
import { timezoneResolver } from "./resolvers/timezone";
import { codeResolver } from "./resolvers/code";
import { cronResolver } from "./resolvers/cron";

export const RESOLVERS: Resolver[] = [
  convertResolver,
  timezoneResolver,
  codeResolver,
  cronResolver,
];

export const byPrefix = new Map<string, Resolver>(
  RESOLVERS.map((r) => [r.prefix, r])
);

const emitted = new Set<string>();

export function resolvePage(slug: string[]): PageModel | null {
  if (!slug || slug.length === 0) return null;

  for (const segment of slug) {
    if (!segment || segment !== segment.toLowerCase()) {
      return null;
    }
  }

  const prefix = slug[0].toLowerCase();
  const resolver = byPrefix.get(prefix);
  if (!resolver) return null;

  const rest = slug.slice(1);
  const candidate = resolver.resolve(rest);
  if (!candidate) return null;

  const { fingerprint } = candidate;
  if (emitted.has(fingerprint)) {
    candidate.indexable = false;
  } else {
    emitted.add(fingerprint);
  }

  return candidate;
}

export function tierOneParams(): string[][] {
  const result: string[][] = [];
  for (const r of RESOLVERS) {
    for (const e of r.list()) {
      if (e.tier !== 1) continue;
      const segments = [r.prefix, ...e.segments];
      let canonical = true;
      for (const s of segments) {
        if (!s || s !== s.toLowerCase()) {
          canonical = false;
          break;
        }
      }
      if (!canonical) continue;
      result.push(segments);
    }
  }
  return result;
}

export function allIndexable(): {
  path: string;
  lastModified: string;
  group: PageType;
}[] {
  const result: { path: string; lastModified: string; group: PageType }[] = [];
  for (const r of RESOLVERS) {
    for (const e of r.list()) {
      if (!e.indexable) continue;
      const pathSegs = [r.prefix, ...e.segments];
      const path = "/" + pathSegs.join("/");
      result.push({
        path,
        lastModified: e.lastModified,
        group: r.type,
      });
    }
  }
  return result;
}
