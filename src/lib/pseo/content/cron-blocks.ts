import type { ContentBlock, CronPreset, FaqItem, RelatedGroup } from "../types";
import { TOOLS, toolPath } from "@/content/tools";
import { GUIDES } from "@/content/guides";

const FIELD_NAMES = ["Minute", "Hour", "Day of month", "Month", "Day of week"];

export function buildCronBlocks(preset: CronPreset): ContentBlock[] {
  const proseBlock: ContentBlock = {
    kind: "prose",
    heading: "What this cron expression does",
    paragraphs: [
      preset.intent,
      `This expression belongs to the "${preset.category}" category and fires at regular cadence that matches ${preset.title.toLowerCase()}. Use it when you need behaviour that repeats consistently.`,
    ],
    facts: preset.gotchas.length + preset.nextRuns.length,
  };

  const fieldRows = FIELD_NAMES.map((name, idx) => {
    const value = preset.fieldBreakdown[idx] ?? "*";
    const meaning = meaningForField(idx, value);
    return [name, value, meaning];
  });

  const fieldTable: ContentBlock = {
    kind: "table",
    heading: "Field breakdown",
    head: ["Field", "Value", "Meaning"],
    rows: fieldRows,
    facts: 5,
  };

  const nextRows = preset.nextRuns.map((run, idx) => [String(idx + 1), run]);
  const nextTable: ContentBlock = {
    kind: "table",
    heading: "Next scheduled runs (UTC)",
    head: ["#", "Next run (UTC)"],
    rows: nextRows,
    facts: 5,
  };

  const callouts: ContentBlock = {
    kind: "callouts",
    heading: "Common mistakes and edge cases",
    items: preset.gotchas,
    facts: preset.gotchas.length,
  };

  return [proseBlock, fieldTable, nextTable, callouts];
}

function meaningForField(fieldIdx: number, value: string): string {
  if (value === "*") {
    switch (fieldIdx) {
      case 0: return "Every minute (0-59)";
      case 1: return "Every hour (0-23)";
      case 2: return "Every day of the month (1-31)";
      case 3: return "Every month (1-12)";
      case 4: return "Every day of the week (0-6)";
      default: return "Any value";
    }
  }
  if (value.startsWith("*/")) {
    return `Every ${value.slice(2)}th value in the field`;
  }
  if (value.includes(",")) {
    return "Exactly the listed values";
  }
  if (value.includes("-")) {
    return "Every value in the inclusive range";
  }
  if (/^\d+$/.test(value)) {
    return `Only the value ${value}`;
  }
  return value;
}

export function buildCronFaq(preset: CronPreset): FaqItem[] {
  const faqs: FaqItem[] = [];

  faqs.push({
    q: `What does the cron expression \`${preset.expression}\` do exactly?`,
    a: `${preset.intent} The canonical form is \`${preset.expression}\`, and when parsed in standard 5-field cron it matches ${preset.title.toLowerCase()}. The table on this page walks through each field and the next few scheduled runs.`,
  });

  if (preset.fieldBreakdown[2] !== "*" && preset.fieldBreakdown[4] !== "*") {
    faqs.push({
      q: "Why does this expression have both day-of-month and day-of-week set?",
      a: "In standard cron, when both fields are restricted (neither is *) the match is an OR, not an AND. That means the job runs on any day that satisfies EITHER field. For example `0 0 1 * 1` runs on the 1st of every month AND every Monday, not just Mondays that fall on the 1st. If you want AND semantics you need a wrapper script or a different scheduler.",
    });
  } else {
    faqs.push({
      q: "Which time zone does cron use?",
      a: "Standard Vixie cron and most system cron daemons use the host's local time zone, which is usually the server's configured zone, almost always a container without a zone set. That means the same expression triggers at a different UTC instant when the host offset changes in DST or when the server zone is changed. Some schedulers such as Quartz, AWS EventBridge and Kubernetes CronJob let you configure an explicit zone. If your scheduler's documentation for zone semantics.",
    });
  }

  if (preset.dialects && Object.keys(preset.dialects).length > 0) {
    faqs.push({
      q: "Do Quartz / AWS EventBridge / GitHub Actions use the same 5 fields?",
      a: "No. Many variants add extra fields at the start (Quartz typically has seconds and sometimes year). AWS EventBridge has six fields plus an extra one-year one). GitHub Actions adds a seconds field. The same schedule looks similar but is not interchangeable. The related links under dialect variants for this page lists the equivalents where available.",
    });
  } else {
    faqs.push({
      q: "How do I make this run in a specific time zone?",
      a: "Standard system cron uses the server's configured zone. If you need a zone the host zone, either set the TZ environment variable in the crontab (on Linux, wrap your job with `CRON_TZ= before the expression (some implementations), or switch to a scheduler that takes a zone parameter such as Kubernetes CronJob's `.spec.timezone or a hosted scheduler. Alternatively, convert the desired local time to UTC and write the expression in UTC and accept the DST-shifted runs.",
    });
  }

  while (faqs.length < 3) {
    faqs.push({
      q: "Why don't my cron jobs run at the second I expect?",
      a: "Standard cron has one-minute granularity. It fires once per minute on average and checks the expression against the current wall clock. If the system is heavily loaded or you need sub-minute cadence you need a different scheduler. Also double-check that the daemon is the one actually running and that any quoted or systemd timer is enabled.",
    });
  }

  return faqs.slice(0, 3);
}

export function buildCronRelated(
  preset: CronPreset,
  allPresets: CronPreset[],
): RelatedGroup[] {
  const sameCategory = allPresets
    .filter((p) => p.category === preset.category && p.slug !== preset.slug)
    .slice(0, 5)
    .map((p) => ({
      href: `/cron/${p.slug}`,
      label: p.title,
    }));

  const dialectLinks: { href: string; label: string }[] = [];
  if (preset.dialects) {
    for (const [dialect, expr] of Object.entries(preset.dialects)) {
      if (!expr) continue;
      const name = dialectName(dialect);
      dialectLinks.push({
        href: `/cron/${preset.slug}#${dialect}`,
        label: `${name}: ${expr}`,
      });
      if (dialectLinks.length >= 4) break;
    }
  }

  const toolLinks: { href: string; label: string }[] = [];
  const cronTool = TOOLS.find((t) => t.slug === "cron-generator");
  if (cronTool) {
    toolLinks.push({ href: toolPath(cronTool.slug), label: cronTool.name });
  }
  for (const tool of TOOLS) {
    if (toolLinks.length >= 3) break;
    if (tool.slug === "cron-generator") continue;
    if (tool.category === "Developer") {
      toolLinks.push({ href: toolPath(tool.slug), label: tool.name });
    }
  }

  const guideLinks: { href: string; label: string }[] = [];
  const cronGuide = GUIDES.find((g) => g.slug === "cron-expressions-explained");
  if (cronGuide) {
    guideLinks.push({ href: `/guides/${cronGuide.slug}`, label: cronGuide.name });
  }
  for (const guide of GUIDES) {
    if (guideLinks.length >= 2) break;
    if (guide.slug === "cron-expressions-explained") continue;
    if (guide.slug === "time-zones-and-dst-for-developers" || guide.slug === "what-is-unix-time") {
      guideLinks.push({ href: `/guides/${guide.slug}`, label: guide.name });
    }
  }
  if (guideLinks.length < 2) {
    for (const guide of GUIDES) {
      if (!guideLinks.find((l) => l.label === guide.name)) {
        guideLinks.push({ href: `/guides/${guide.slug}`, label: guide.name });
        if (guideLinks.length >= 2) break;
      }
    }
  }

  return [
    {
      heading: `More ${preset.category} cron patterns`,
      links: sameCategory,
    },
    {
      heading: dialectLinks.length > 0 ? "Dialect variants" : "Dialect variants (standard cron)",
      links: dialectLinks.length > 0
        ? dialectLinks
        : allPresets
            .filter((p) => p.slug !== preset.slug && p.dialects && Object.keys(p.dialects).length > 0)
            .slice(0, 4)
            .map((p) => ({
              href: `/cron/${p.slug}`,
              label: `${p.title} variants`,
            })),
    },
    {
      heading: "Tools and guides",
      links: [...toolLinks, ...guideLinks],
    },
  ];
}

function dialectName(d: string): string {
  switch (d) {
    case "quartz": return "Quartz";
    case "aws-eventbridge": return "AWS EventBridge";
    case "kubernetes": return "Kubernetes CronJob";
    case "github-actions": return "GitHub Actions";
    default: return d;
  }
}
