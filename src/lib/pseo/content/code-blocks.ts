import type { ContentBlock, FaqItem, RelatedGroup } from "../types";
import type { LanguageEntry } from "@/data/types";
import type { TaskDef } from "@/data/types";
import { LANGUAGES, getLanguage } from "@/data/languages";
import { TASKS } from "@/data/tasks";

export function buildCodeBlocks(
  lang: LanguageEntry,
  task: TaskDef
): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const snippet = lang.tasks[task.id];
  const relevantTopics = task.topics;

  blocks.push({
    kind: "prose",
    heading: "Overview",
    paragraphs: [
      task.summary.replace("{lang}", lang.name),
      `This ${lang.name} snippet uses ${task.input} as input and produces the exact output ${task.output}.`,
    ],
    facts: 3,
  });

  if (snippet) {
    blocks.push({
      kind: "code",
      heading: "Working Snippet",
      lang: lang.slug,
      code: snippet.code,
      expected: task.output,
      runtime: lang.runner,
      notes: snippet.notes ?? [],
      facts: 5,
    });
  }

  const stepBlock: ContentBlock = {
    kind: "steps",
    heading: "How It Works",
    steps: task.steps.map((s, i) => ({
      name: `Step ${i + 1}`,
      text: s.replace("{lang}", lang.name),
    })),
    facts: 2,
  };
  blocks.push(stepBlock);

  const callouts = relevantTopics
    .filter((t) => lang.facts[t])
    .map((t) => ({
      title: lang.facts[t].title,
      body: lang.facts[t].body,
      severity: "info" as const,
    }));

  if (callouts.length > 0) {
    blocks.push({
      kind: "callouts",
      heading: `${lang.name} Specifics`,
      items: callouts,
      facts: callouts.length * 2,
    });
  }

  const rowHead = ["Field", "Value"];
  const rows: string[][] = [
    ["Language", lang.name],
    ["Precision", lang.precision.toUpperCase()],
    ["Runner", lang.runner],
    ["Input", task.input],
    ["Output format", task.output],
    ["Topics", relevantTopics.join(", ")],
  ];
  blocks.push({
    kind: "table",
    heading: "Reference Table",
    head: rowHead,
    rows,
    facts: 3,
  });

  return blocks;
}

export function buildCodeFaq(lang: LanguageEntry, task: TaskDef): FaqItem[] {
  const faq: FaqItem[] = [];

  faq.push({
    q: task.question.replace("{lang}", lang.name),
    a: `Use the ${lang.name} snippet shown above. It takes ${task.input} and returns ${task.output}. Run with ${lang.runner}.`,
  });

  faq.push({
    q: `What precision does ${lang.name} use for timestamps?`,
    a: `${lang.name} standard-library timestamps have ${lang.precision.toUpperCase()} precision. When you need Unix seconds, ${lang.precision === "s" ? "use the value directly" : `divide by ${lang.precision === "ms" ? 1000 : lang.precision === "us" ? 1_000_000 : 1_000_000_000} and floor`}.`,
  });

  if (task.topics.includes("timezone")) {
    faq.push({
      q: `Does the ${task.id} snippet depend on the server time zone?`,
      a: `No. The code on this page explicitly declares UTC, so the output is ${task.output} regardless of the machine's local zone.`,
    });
  }

  if (task.topics.includes("y2038")) {
    faq.push({
      q: `Is there a Year 2038 problem in ${lang.name}?`,
      a: lang.facts.y2038.body,
    });
  }

  return faq;
}

export function buildCodeRelated(
  lang: LanguageEntry,
  task: TaskDef
): RelatedGroup[] {
  const groups: RelatedGroup[] = [];

  const sameTaskOtherLangs = LANGUAGES
    .filter((l) => l.slug !== lang.slug && l.tasks[task.id])
    .slice(0, 6)
    .map((l) => ({
      href: `/code/${l.slug}/${task.id}`,
      label: `${l.name} – ${task.title.replace("{lang}", l.name)}`,
    }));

  if (sameTaskOtherLangs.length > 0) {
    groups.push({
      heading: `Same task in other languages`,
      links: sameTaskOtherLangs,
    });
  }

  const otherTasks = TASKS
    .filter((t) => t.id !== task.id && lang.tasks[t.id])
    .slice(0, 6)
    .map((t) => ({
      href: `/code/${lang.slug}/${t.id}`,
      label: t.title.replace("{lang}", lang.name),
    }));

  if (otherTasks.length > 0) {
    groups.push({
      heading: `Other ${lang.name} time tasks`,
      links: otherTasks,
    });
  }

  const relatedLangs = lang.related
    .map((s) => getLanguage(s))
    .filter((l): l is LanguageEntry => !!l)
    .slice(0, 4)
    .flatMap((l) =>
      TASKS.slice(0, 2)
        .filter((t) => l.tasks[t.id])
        .map((t) => ({
          href: `/code/${l.slug}/${t.id}`,
          label: `${l.name}: ${t.title.replace("{lang}", l.name)}`,
        }))
    );

  if (relatedLangs.length > 0) {
    groups.push({
      heading: "Commonly compared",
      links: relatedLangs,
    });
  }

  groups.push({
    heading: "Try the live tools",
    links: [
      { href: `/tools/current-unix-timestamp`, label: "Current Unix Timestamp" },
      { href: `/tools/timestamp-to-date`, label: "Timestamp to Date" },
      { href: `/tools/date-to-timestamp`, label: "Date to Timestamp" },
      { href: `/tools/unix-to-iso-8601`, label: "Unix to ISO 8601" },
    ],
  });

  return groups;
}
