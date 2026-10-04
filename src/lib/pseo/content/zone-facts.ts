import type { ContentBlock, HubCity, CityEntry } from "../types";

export function zoneFacts(iana: string, city?: HubCity | CityEntry): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const region = iana.includes("/") ? iana.split("/")[0] : "Etc";
  const locality = iana.includes("/") ? iana.split("/").slice(1).join(" / ") : iana;

  blocks.push({
    kind: "prose",
    heading: `Time Zone ${iana}`,
    paragraphs: [
      `${iana} is an IANA time zone identifier in the ${region} region, covering the locality ${locality.replace(/_/g, " ")}.`,
      city
        ? `${city.name}, ${city.country}${"population" in city ? ` (population ${city.population.toLocaleString()})` : ""} is the reference city used for this zone's rules.`
        : "Daylight saving rules and UTC offsets are maintained by the IANA Time Zone Database and ship with every modern browser and operating system.",
      "Use IANA identifiers like this one instead of fixed UTC offsets or three-letter abbreviations: they encode the full history of rule changes.",
    ],
    facts: 4,
  });

  blocks.push({
    kind: "table",
    heading: "Zone Reference",
    head: ["Field", "Value"],
    rows: [
      ["IANA ID", iana],
      ["Region", region],
      ["Locality", locality.replace(/_/g, " ")],
      ["Reference city", city?.name ?? "—"],
      ["Country", city?.country ?? "—"],
      ["Population", city && "population" in city ? city.population.toLocaleString() : "—"],
    ],
    facts: 3,
  });

  const calloutItems = [
    {
      title: "Why IANA names beat abbreviations",
      body: "Three-letter codes like EST, CST or IST are ambiguous (IST can mean India, Ireland or Israel) and do not encode whether daylight saving is in effect. Always store and transmit the IANA identifier.",
      severity: "info" as const,
    },
    {
      title: "Offsets change with the calendar",
      body: "The UTC offset for a zone is not a constant. Where daylight saving is observed, the offset shifts twice per year on legislated dates. Convert a specific date to get the exact offset that applied then.",
      severity: "warn" as const,
    },
  ];

  if (city && "notes" in city && city.notes) {
    for (const note of city.notes) {
      calloutItems.push({
        title: `${city.name} note`,
        body: note,
        severity: "info" as const,
      });
    }
  }

  blocks.push({
    kind: "callouts",
    heading: "Key Facts",
    items: calloutItems,
    facts: calloutItems.length * 2,
  });

  blocks.push({
    kind: "steps",
    heading: "Converting Times to and from This Zone",
    steps: [
      {
        name: "Pick a moment",
        text: "Start from either a Unix timestamp / UTC ISO string, or from local calendar fields together with this zone name.",
      },
      {
        name: "Resolve the offset",
        text: `For the specific date, look up the current UTC offset for ${iana}. Daylight saving transitions are handled automatically by IANA-aware libraries.`,
      },
      {
        name: "Format for display",
        text: "Render the result in the target zone with a four-digit offset (e.g. +05:30) and the IANA identifier so the reader can verify it.",
      },
    ],
    facts: 3,
  });

  return blocks;
}

export function converterBlocks(
  fromIana: string,
  toIana: string,
  fromOffset?: number,
  toOffset?: number,
  dstInfo?: string
): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const fromName = fromIana.replace(/\//g, " ");
  const toName = toIana.replace(/\//g, " ");

  blocks.push({
    kind: "prose",
    heading: `Convert ${fromName} to ${toName}`,
    paragraphs: [
      `This page converts a moment between the IANA time zones ${fromIana} and ${toIana}.`,
      fromOffset !== undefined && toOffset !== undefined
        ? `Right now ${fromIana} is UTC${formatOffset(fromOffset)} and ${toIana} is UTC${formatOffset(toOffset)}. The wall-clock difference is ${formatDiff(toOffset - fromOffset)}.`
        : "Use the converter above to enter a specific date and see the exact offsets that applied at that moment.",
      dstInfo ? dstInfo : "Daylight saving transitions shift the offset on specific dates; convert the exact date you care about instead of trusting a fixed difference.",
    ],
    facts: 5,
  });

  blocks.push({
    kind: "table",
    heading: "Zone Pair Reference",
    head: ["Property", fromIana, toIana],
    rows: [
      ["IANA ID", fromIana, toIana],
      ["Region", fromIana.split("/")[0], toIana.split("/")[0]],
      ["Current UTC offset", fromOffset !== undefined ? formatOffset(fromOffset) : "—", toOffset !== undefined ? formatOffset(toOffset) : "—"],
    ],
    facts: 3,
  });

  blocks.push({
    kind: "steps",
    heading: "Performing the Conversion",
    steps: [
      {
        name: "Anchor the moment",
        text: `Convert the ${fromIana} local date/time into a UTC instant using ${fromIana}'s offset for that date.`,
      },
      {
        name: "Transport across zones",
        text: "The UTC instant is identical in every zone. Nothing changes at this step; only the interpretation changes.",
      },
      {
        name: "Render in the target",
        text: `Format the UTC instant through ${toIana}'s rules for the same date, yielding the local wall-clock reading in ${toIana}.`,
      },
    ],
    facts: 3,
  });

  blocks.push({
    kind: "callouts",
    heading: "Daylight Saving & Dangers",
    items: [
      {
        title: "Never use a fixed hour difference",
        body: `The difference between ${fromIana} and ${toIana} is not constant across the year. Either zone may enter or leave daylight saving on a different weekend, so hard-coding a 5-hour gap is a bug waiting to happen.`,
        severity: "warn" as const,
      },
      {
        title: "Spring forward / fall back",
        body: "Around DST transitions a whole local hour either never exists or happens twice. Always convert through a library that honours the IANA rules for the exact date.",
        severity: "warn" as const,
      },
    ],
    facts: 4,
  });

  return blocks;
}

function formatOffset(minutes: number): string {
  if (minutes === 0) return "±00:00";
  const sign = minutes > 0 ? "+" : "−";
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function formatDiff(minutes: number): string {
  const sign = minutes >= 0 ? "+" : "−";
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h === 0) return `${sign}${m} minute${m === 1 ? "" : "s"}`;
  if (m === 0) return `${sign}${h} hour${h === 1 ? "" : "s"}`;
  return `${sign}${h}h ${m}m`;
}
