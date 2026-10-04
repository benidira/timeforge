import type { Resolver, ResolverListEntry, PageModel, CronPreset } from "../types";
import presets from "@/data/cron-presets.json" assert { type: "json" };
import { buildCronBlocks, buildCronFaq, buildCronRelated } from "../content/cron-blocks";
import { isIndexable, scoreBlocks, buildFingerprint } from "../gate";

const DATA_VERSION = "2026-10-03";

const CRON_PRESETS = presets as unknown as CronPreset[];

const TOP_CRON = CRON_PRESETS.slice(0, 12).map((p) => p.slug);

const PRESET_BY_SLUG = new Map<string, CronPreset>(
  CRON_PRESETS.map((p) => [p.slug, p])
);

export const cronResolver: Resolver = {
  type: "cron",
  prefix: "cron",

  list(): ResolverListEntry[] {
    const entries: ResolverListEntry[] = [];

    for (const preset of CRON_PRESETS) {
      const tier = TOP_CRON.includes(preset.slug) ? 1 : 2;
      entries.push({
        segments: [preset.slug],
        tier,
        indexable: true,
        lastModified: DATA_VERSION,
        fingerprint: buildFingerprint([
          "cron",
          preset.slug,
          preset.expression,
          DATA_VERSION,
          preset.facts,
        ]),
      });
    }

    return entries;
  },

  resolve([slug, ...extra]): PageModel | null {
    if (extra.length > 0) return null;
    if (!slug) return null;

    const preset = PRESET_BY_SLUG.get(slug);
    if (!preset) return null;

    const blocks = buildCronBlocks(preset);
    const uniqueFacts = scoreBlocks(blocks);
    const faq = buildCronFaq(preset);
    const related = buildCronRelated(preset, CRON_PRESETS);
    const fingerprint = buildFingerprint([
      "cron",
      preset.slug,
      preset.expression,
      DATA_VERSION,
      preset.facts,
    ]);

    const title = `${preset.title} – ${preset.expression} | TimeForge`;
    const description = `${preset.intent}. Expression ${preset.expression}. Next 5 runs listed, plus common mistakes and dialect variants.`;
    const h1 = preset.title;
    const intro = `${preset.intent}. The five-field standard expression is \`${preset.expression}\`. Category: ${preset.category}. Facts score: ${preset.facts}. Use the cron tool below to tweak the pattern and preview future runs.`;
    const breadcrumbs = [
      { name: "Home", href: "/" },
      { name: "Cron", href: "/cron" },
      { name: preset.title },
    ];
    const tool = {
      component: "cron" as const,
      initial: { expression: preset.expression },
    };

    return {
      type: "cron",
      path: `/cron/${slug}`,
      title,
      description,
      h1,
      intro,
      breadcrumbs,
      tool,
      blocks,
      faq,
      related,
      uniqueFacts,
      indexable: isIndexable("cron", uniqueFacts),
      lastModified: DATA_VERSION,
      jsonLd: [],
      fingerprint,
    };
  },
};
