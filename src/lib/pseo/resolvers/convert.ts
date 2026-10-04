import type { Resolver, ResolverListEntry, PageModel, TimeFormat } from "../types";
import formats from "@/data/formats.json" assert { type: "json" };
import { buildConvertBlocks } from "../content/convert-blocks";
import { isIndexable, scoreBlocks, buildFingerprint } from "../gate";

const DATA_VERSION = "2026-10-03";

const formatList = formats as unknown as TimeFormat[];

function deriveTopPairs(): Set<string> {
  const topPairs = new Set<string>();
  let count = 0;
  for (const fmt of formatList) {
    for (const to of fmt.convertsTo) {
      if (count >= 12) break;
      topPairs.add(`${fmt.id}->${to}`);
      count++;
    }
    if (count >= 12) break;
  }
  return topPairs;
}

const TOP_PAIRS = deriveTopPairs();

const FORMAT_BY_ID = new Map<string, TimeFormat>(
  formatList.map((f) => [f.id, f])
);
const FORMAT_BY_SLUG = new Map<string, TimeFormat>(
  formatList.map((f) => [f.slug, f])
);

export const convertResolver: Resolver = {
  type: "convert",
  prefix: "convert",

  list(): ResolverListEntry[] {
    const entries: ResolverListEntry[] = [];

    for (const fromFormat of formatList) {
      for (const toId of fromFormat.convertsTo) {
        const toFormat = FORMAT_BY_ID.get(toId);
        if (!toFormat) continue;
        const pairKey = `${fromFormat.id}->${toId}`;
        const tier = TOP_PAIRS.has(pairKey) ? 1 : 2;

        entries.push({
          segments: [fromFormat.slug, "to", toFormat.slug],
          tier,
          indexable: true,
          lastModified: DATA_VERSION,
          fingerprint: buildFingerprint([
            "convert",
            fromFormat.slug,
            toFormat.slug,
            DATA_VERSION,
            fromFormat.facts + toFormat.facts,
          ]),
        });
      }
    }

    return entries;
  },

  resolve([fromSlug, word, toSlug, ...extra]): PageModel | null {
    if (extra.length > 0) return null;
    if (word !== "to") return null;
    if (!fromSlug || !toSlug) return null;

    const fromFormat = FORMAT_BY_SLUG.get(fromSlug);
    const toFormat = FORMAT_BY_SLUG.get(toSlug);
    if (!fromFormat || !toFormat) return null;

    const blocks = buildConvertBlocks(fromFormat.id, toFormat.id, formatList);
    const uniqueFacts = scoreBlocks(blocks);
    const fingerprint = buildFingerprint([
      "convert",
      fromFormat.slug,
      toFormat.slug,
      DATA_VERSION,
      fromFormat.facts + toFormat.facts,
    ]);

    const fromName = fromFormat.name;
    const toName = toFormat.name;
    const title = `Convert ${fromName} to ${toName} – exact steps & pitfalls | Castov`;
    const description = `${fromName} → ${toName} converter with a working example (${fromFormat.exampleInput} to ${toFormat.exampleOutput}), pitfalls, round-trip verification and step-by-step walk-through.`;
    const h1 = `Convert ${fromName} to ${toName}`;
    const intro = `Turn ${fromName} (${fromFormat.slug}) into ${toName} (${toFormat.slug}). Input example: ${fromFormat.exampleInput}. Expected output: ${toFormat.exampleOutput}. The walk-through below handles edge cases and daylight-saving-aware conversions.`;
    const breadcrumbs = [
      { name: "Home", href: "/" },
      { name: "Convert", href: "/convert" },
      { name: fromName, href: `/convert/${fromFormat.slug}` },
      { name: `to ${toName}` },
    ];

    const isIso =
      fromFormat.id.includes("iso") ||
      toFormat.id.includes("iso") ||
      fromFormat.id.includes("rfc") ||
      toFormat.id.includes("rfc");
    const tool = {
      component: (isIso ? "iso" : "timestamp") as "timestamp" | "iso",
    };

    return {
      type: "convert",
      path: `/convert/${fromSlug}/to/${toSlug}`,
      title,
      description,
      h1,
      intro,
      breadcrumbs,
      tool,
      blocks,
      faq: [
        {
          q: `How do I convert ${fromName} to ${toName}?`,
          a: `Parse "${fromFormat.exampleInput}" in ${fromName}, normalise to a canonical instant, then render through the ${toName} rules. Expected output: ${toFormat.exampleOutput}.`,
        },
        {
          q: `What is the difference between ${fromName} and ${toName}?`,
          a: `${fromName}: ${fromFormat.description} ${toName}: ${toFormat.description}.`,
        },
        {
          q: `Does this converter handle negative or pre-1970 values?`,
          a: `Yes, as long as both formats support them. ${fromFormat.name} and ${toFormat.name} are documented above with their pitfalls and edge cases.`,
        },
      ],
      related: [
        {
          heading: "Reverse & nearby conversions",
          links: [
            {
              href: `/convert/${toFormat.slug}/to/${fromFormat.slug}`,
              label: `Convert ${toName} back to ${fromName}`,
            },
            ...formatList
              .filter((f) => f.id !== fromFormat.id && f.id !== toFormat.id)
              .slice(0, 3)
              .map((f) => ({
                href: `/convert/${fromFormat.slug}/to/${f.slug}`,
                label: `${fromName} → ${f.name}`,
              })),
          ],
        },
        {
          heading: "Try the live tools",
          links: [
            { href: `/tools/unix-timestamp-converter`, label: "Unix Timestamp Converter" },
            { href: `/tools/iso-8601-to-unix`, label: "ISO 8601 to Unix" },
            { href: `/tools/unix-to-iso-8601`, label: "Unix to ISO 8601" },
          ],
        },
      ],
      uniqueFacts,
      indexable: isIndexable("convert", uniqueFacts),
      lastModified: DATA_VERSION,
      jsonLd: [],
      fingerprint,
    };
  },
};
