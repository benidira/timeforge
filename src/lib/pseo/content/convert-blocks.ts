import type { ContentBlock, FaqItem, RelatedGroup, TimeFormat, FormatId } from "../types";
import { TOOLS, toolPath } from "@/content/tools";
import { GUIDES } from "@/content/guides";

const INLINE_FORMATS: TimeFormat[] = [
  {
    id: "unix-seconds",
    slug: "unix-seconds",
    name: "Unix seconds",
    description: "Number of whole seconds since 1 January 1970 UTC. Ten digits today.",
    exampleInput: "1700000000",
    exampleOutput: "2023-11-14T22:13:20Z",
    digitsNow: 10,
    pitfalls: [
      { title: "Off by 1000 vs milliseconds", body: "A 10-digit number is seconds, 13 digits is milliseconds. Confusing them lands you in 1970 or the year 55000.", severity: "warn" },
      { title: "Floating point rounding", body: "Floating-point division can lose precision for large values; prefer integer arithmetic or floor when converting.", severity: "info" },
    ],
    convertsTo: ["unix-milliseconds", "iso-8601", "rfc-3339", "utc", "local-date"],
    facts: 3,
  },
  {
    id: "unix-milliseconds",
    slug: "unix-milliseconds",
    name: "Unix milliseconds",
    description: "Number of milliseconds since 1 January 1970 UTC. Thirteen digits today.",
    exampleInput: "1700000000123",
    exampleOutput: "2023-11-14T22:13:20.123Z",
    digitsNow: 13,
    pitfalls: [
      { title: "Last three digits are the fraction", body: "Don't strip the last three digits with string slicing unless you also floor; negative values need sign-aware handling.", severity: "warn" },
      { title: "JavaScript Date.now() is this unit", body: "Client timestamps from Date.now() are already milliseconds; dividing again would give an answer in 1970.", severity: "info" },
    ],
    convertsTo: ["unix-seconds", "iso-8601", "rfc-3339", "utc", "local-date"],
    facts: 3,
  },
  {
    id: "iso-8601",
    slug: "iso-8601",
    name: "ISO 8601",
    description: "International standard format, e.g. 2023-11-14T22:13:20Z. Sorts alphabetically in time order.",
    exampleInput: "2023-11-14T22:13:20Z",
    exampleOutput: "1700000000",
    pitfalls: [
      { title: "Missing offset is ambiguous", body: "A string without Z or +/-HH:MM is read as local time by some parsers and UTC by others. Always demand an explicit offset.", severity: "warn" },
      { title: "Date-only vs date-time", body: "ISO 8601 allows 2023-11-14 alone; in JavaScript that is midnight UTC but 2023-11-14T00:00:00 is midnight local. Same text, two instants.", severity: "warn" },
    ],
    convertsTo: ["unix-seconds", "unix-milliseconds", "rfc-3339", "utc", "local-date"],
    facts: 3,
  },
  {
    id: "rfc-3339",
    slug: "rfc-3339",
    name: "RFC 3339",
    description: "Internet profile of ISO 8601 used by JSON APIs. Allows space instead of T and requires an offset or Z.",
    exampleInput: "2023-11-14 22:13:20+00:00",
    exampleOutput: "1700000000",
    pitfalls: [
      { title: "Space vs T separator", body: "RFC 3339 explicitly allows a space, but some strict ISO-only parsers require a T. Use the T form if interchange matters.", severity: "info" },
      { title: "Offset required", body: "Unlike base ISO 8601, RFC 3339 forbids an offset-less date-time. Anything without Z or +/-HH:MM is not valid RFC 3339.", severity: "warn" },
    ],
    convertsTo: ["unix-seconds", "unix-milliseconds", "iso-8601", "utc", "local-date"],
    facts: 3,
  },
  {
    id: "utc",
    slug: "utc",
    name: "UTC date-time",
    description: "Human-readable UTC calendar date and clock time, e.g. 2023-11-14 22:13:20 UTC.",
    exampleInput: "2023-11-14 22:13:20 UTC",
    exampleOutput: "1700000000",
    pitfalls: [
      { title: "UTC label required", body: "22:13:20 without UTC or a zone name is ambiguous. It could be any time zone; label the text explicitly.", severity: "warn" },
      { title: "Not sortable without a zone", body: "A plain date-time string without an offset does not sort consistently. Use ISO 8601 with Z for storage keys.", severity: "info" },
    ],
    convertsTo: ["unix-seconds", "unix-milliseconds", "iso-8601", "rfc-3339", "local-date"],
    facts: 3,
  },
  {
    id: "local-date",
    slug: "local-date",
    name: "Local date",
    description: "A calendar date (YYYY-MM-DD) in some implied local zone. Useful for birthdays, not for instants.",
    exampleInput: "2023-11-14",
    exampleOutput: "2023-11-14 00:00 (local)",
    pitfalls: [
      { title: "Does not identify an instant", body: "A date alone covers up to 50 real-world hours depending on the zone. Never use a local date alone as a key or expiry.", severity: "warn" },
      { title: "Leap day validation", body: "2024-02-29 is valid, 2023-02-29 is not. Rejecting impossible dates before conversion avoids silent rollover to March 1.", severity: "warn" },
    ],
    convertsTo: ["unix-seconds", "unix-milliseconds", "iso-8601", "rfc-3339", "utc"],
    facts: 3,
  },
];

const FORMAT_BY_ID = new Map<FormatId, TimeFormat>(
  INLINE_FORMATS.map((f) => [f.id, f]),
);

function getFormat(id: FormatId, formats: TimeFormat[] | undefined): TimeFormat {
  if (formats && formats.length > 0) {
    const found = formats.find((f) => f.id === id);
    if (found) return found;
  }
  const f = FORMAT_BY_ID.get(id);
  if (!f) throw new Error(`Unknown format id: ${id}`);
  return f;
}

function fmtInputMs(ts: number): Record<FormatId, string> {
  const date = new Date(ts);
  const iso = date.toISOString();
  const s = Math.floor(ts / 1000);
  const y = date.getUTCFullYear();
  const mo = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const d = date.getUTCDate().toString().padStart(2, "0");
  const h = date.getUTCHours().toString().padStart(2, "0");
  const mi = date.getUTCMinutes().toString().padStart(2, "0");
  const se = date.getUTCSeconds().toString().padStart(2, "0");
  return {
    "unix-seconds": String(s),
    "unix-milliseconds": String(ts),
    "iso-8601": iso.replace(/\.\d{3}Z$/, "Z"),
    "rfc-3339": `${y}-${mo}-${d} ${h}:${mi}:${se}+00:00`,
    "utc": `${y}-${mo}-${d} ${h}:${mi}:${se} UTC`,
    "local-date": `${y}-${mo}-${d}`,
  };
}

function isNumericFormat(id: FormatId): boolean {
  return id === "unix-seconds" || id === "unix-milliseconds";
}

export function buildConvertBlocks(
  fromId: FormatId,
  toId: FormatId,
  formats?: TimeFormat[],
): ContentBlock[] {
  const from = getFormat(fromId, formats);
  const to = getFormat(toId, formats);

  const paragraph1 = `Converting ${from.name} to ${to.name} means translating between two representations of the same instant in time. ${from.name} is ${from.description.toLowerCase()} ${to.name} is ${to.description.toLowerCase()}`;
  const paragraph2 = `The conversion is exact when both formats carry enough precision. If you convert ${isNumericFormat(from.id) ? "seconds" : from.name} into ${isNumericFormat(to.id) ? "milliseconds" : to.name} and back, you should recover the original value whenever the input had enough digits.`;

  const proseBlock: ContentBlock = {
    kind: "prose",
    heading: `Converting ${from.name} to ${to.name}`,
    paragraphs: [paragraph1, paragraph2],
    facts: 2,
  };

  const nowMs = Date.now();
  const oneDay = 86_400_000;
  const samples: { label: string; ms: number; note: string }[] = [
    { label: "Now", ms: nowMs, note: "the current moment" },
    { label: "1 day ago", ms: nowMs - oneDay, note: "yesterday at this time" },
    { label: "1 day ahead", ms: nowMs + oneDay, note: "tomorrow at this time" },
    { label: "Y2038 boundary", ms: 2_147_483_647_000, note: "2038-01-19T03:14:07Z, the 32-bit signed max" },
    { label: "Unix epoch", ms: 0, note: "1970-01-01T00:00:00Z, the reference instant" },
  ];

  const rows = samples.map((s) => {
    const i = fmtInputMs(s.ms);
    return [i[from.id], i[to.id], s.note];
  });

  const tableBlock: ContentBlock = {
    kind: "table",
    heading: "Example conversions",
    head: ["Input", "Result", "Notes"],
    rows,
    facts: 5,
  };

  const pitfalls = [...from.pitfalls, ...to.pitfalls].slice(0, 4);
  const calloutsBlock: ContentBlock = {
    kind: "callouts",
    heading: "Format-specific pitfalls",
    items: pitfalls,
    facts: pitfalls.length,
  };

  const stepsBlock: ContentBlock = {
    kind: "steps",
    heading: "How to do it manually",
    steps: [
      { name: "Step 1", text: `Identify the instant the ${from.name} value refers to, resolving any missing UTC offset or zone by declaring UTC explicitly.` },
      { name: "Step 2", text: `Convert that instant into a Unix timestamp in seconds or milliseconds, keeping the precision of the input.` },
      { name: "Step 3", text: `Re-render the timestamp as ${to.name}, using the canonical pattern for the target format.` },
      { name: "Step 4", text: "Verify the result by converting back to the source format and comparing to the original input." },
    ],
    facts: 4,
  };

  return [proseBlock, tableBlock, calloutsBlock, stepsBlock];
}

export function buildConvertFaq(
  from: TimeFormat,
  to: TimeFormat,
): FaqItem[] {
  const faqs: FaqItem[] = [
    {
      q: `Is converting ${from.name} to ${to.name} lossless?`,
      a: `${isNumericFormat(from.id) && isNumericFormat(to.id) ? "Mostly." : "It depends on precision."} ${from.name} has ${from.digitsNow ? `${from.digitsNow} digits` : "date-level"} precision and ${to.name} has ${to.digitsNow ? `${to.digitsNow} digits` : "date-level"} precision. When the target is coarser than the source, rounding or truncation is required. Use floor to move a timestamp into the past, never ceil.`,
    },
    {
      q: `What is the best format to store after converting from ${from.name}?`,
      a: `If you need a number, prefer Unix milliseconds (${to.id === "unix-milliseconds" ? "your target format" : "or target that for storage"}). If you need a human-readable string, prefer ISO 8601 ending in Z. Both are unambiguous and sort in time order. Avoid plain date-only or offset-less strings in databases and logs.`,
    },
    {
      q: `Why does my ${from.name} value give a different ${to.name} on another machine?`,
      a: `Because at least one side involved the host's local time zone. Both parsing and formatting can default to local when no zone is declared. Do the whole conversion in UTC: parse with Z or an explicit offset, and format to UTC output.`,
    },
  ];
  return faqs;
}

export function buildConvertRelated(
  from: TimeFormat,
  to: TimeFormat,
  formats?: TimeFormat[],
): RelatedGroup[] {
  const pool = formats && formats.length > 0 ? formats : INLINE_FORMATS;

  const otherConversions: { href: string; label: string }[] = [];
  for (const target of pool) {
    if (target.id === from.id) continue;
    if (target.id === to.id) continue;
    otherConversions.push({
      href: `/convert/${from.slug}/${target.slug}`,
      label: `${from.name} to ${target.name}`,
    });
    if (otherConversions.length >= 5) break;
  }

  const reverseLinks: { href: string; label: string }[] = [];
  for (const source of pool) {
    if (source.id === to.id) continue;
    if (source.id === from.id) continue;
    reverseLinks.push({
      href: `/convert/${source.slug}/${to.slug}`,
      label: `${source.name} to ${to.name}`,
    });
    if (reverseLinks.length >= 5) break;
  }

  const toolLinks: { href: string; label: string }[] = [];
  for (const tool of TOOLS) {
    const matches =
      tool.slug.includes(from.slug.replaceAll("-", "")) ||
      tool.slug.includes(to.slug.replaceAll("-", "")) ||
      (isNumericFormat(from.id) && tool.category === "Timestamp") ||
      (from.id.includes("iso") && tool.slug.includes("iso")) ||
      (to.id.includes("iso") && tool.slug.includes("iso"));
    if (matches) {
      toolLinks.push({ href: toolPath(tool.slug), label: tool.name });
      if (toolLinks.length >= 3) break;
    }
  }
  if (toolLinks.length < 3) {
    for (const tool of TOOLS) {
      if (!toolLinks.find((l) => l.label === tool.name)) {
        toolLinks.push({ href: toolPath(tool.slug), label: tool.name });
        if (toolLinks.length >= 3) break;
      }
    }
  }

  const guideLinks: { href: string; label: string }[] = [];
  for (const guide of GUIDES) {
    const relevant =
      (from.id.includes("iso") || to.id.includes("iso")) && guide.slug === "iso-8601-date-format-guide" ||
      (isNumericFormat(from.id) || isNumericFormat(to.id)) && guide.slug === "seconds-vs-milliseconds-timestamps" ||
      guide.slug === "what-is-unix-time";
    if (relevant) {
      guideLinks.push({ href: `/guides/${guide.slug}`, label: guide.name });
      if (guideLinks.length >= 2) break;
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
      heading: `More conversions from ${from.name}`,
      links: otherConversions,
    },
    {
      heading: `More conversions into ${to.name}`,
      links: reverseLinks,
    },
    {
      heading: "Tools and guides",
      links: [...toolLinks, ...guideLinks],
    },
  ];
}
