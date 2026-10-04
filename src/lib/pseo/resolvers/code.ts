import type { Resolver, ResolverListEntry, PageModel } from "../types";
import { LANGUAGES, getLanguage } from "@/data/languages";
import { getTask, taskTitle } from "@/data/tasks";
import { buildCodeBlocks, buildCodeFaq, buildCodeRelated } from "../content/code-blocks";
import { isIndexable, scoreBlocks, buildFingerprint } from "../gate";

const TOP_LANGS = [
  "javascript",
  "python",
  "java",
  "go",
  "php",
  "csharp",
  "rust",
  "ruby",
  "swift",
  "kotlin",
];

const TOP_TASKS = [
  "get-current-timestamp",
  "timestamp-to-date",
  "date-to-timestamp",
];

const DATA_VERSION = "2026-10-03";

export const codeResolver: Resolver = {
  type: "code",
  prefix: "code",

  list(): ResolverListEntry[] {
    const entries: ResolverListEntry[] = [];

    for (const lang of LANGUAGES) {
      const taskIds = Object.keys(lang.tasks);
      for (const taskId of taskIds) {
        const snippet = lang.tasks[taskId as keyof typeof lang.tasks];
        const indexable = !!snippet?.code;
        const tier =
          TOP_LANGS.includes(lang.slug) && TOP_TASKS.includes(taskId) ? 1 : 2;

        entries.push({
          segments: [lang.slug, taskId],
          tier,
          indexable,
          lastModified: DATA_VERSION,
          fingerprint: buildFingerprint([
            "code",
            lang.slug,
            taskId,
            DATA_VERSION,
            snippet?.code ?? "",
          ]),
        });
      }
    }

    return entries;
  },

  resolve([langSlug, taskId, ...extra]): PageModel | null {
    if (extra.length > 0) return null;
    if (!langSlug || !taskId) return null;

    const lang = getLanguage(langSlug);
    const task = getTask(taskId);
    if (!lang || !task) return null;

    const snippet = lang.tasks[task.id];
    if (!snippet?.code) return null;

    const blocks = buildCodeBlocks(lang, task);
    const uniqueFacts = scoreBlocks(blocks);
    const faq = buildCodeFaq(lang, task);
    const related = buildCodeRelated(lang, task);
    const fingerprint = buildFingerprint([
      "code",
      lang.slug,
      task.id,
      DATA_VERSION,
      snippet.code,
    ]);

    const title = task.title.replace("{lang}", lang.name) + " with example | Castov";
    const description =
      task.question.replace("{lang}", lang.name) +
      ` ${lang.name} ${lang.runner} code with tested output, pitfalls and related tools.`;
    const h1 = task.title.replace("{lang}", lang.name);
    const intro = `${task.summary.replace("{lang}", lang.name)} Snippet runs in ${lang.name} (${lang.runner}). Output format: ${task.output}. The example below uses ${task.input}.`;
    const breadcrumbs = [
      { name: "Home", href: "/" },
      { name: "Code", href: "/code" },
      { name: lang.name, href: `/code/${lang.slug}` },
      { name: taskTitle(task, lang.name) },
    ];
    const tool = {
      component: "timestamp" as const,
      initial: { unit: lang.precision === "ms" ? "ms" : "s" },
    };

    return {
      type: "code",
      path: `/code/${lang.slug}/${taskId}`,
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
      indexable: isIndexable("code", uniqueFacts),
      lastModified: DATA_VERSION,
      jsonLd: [],
      fingerprint,
    };
  },
};
