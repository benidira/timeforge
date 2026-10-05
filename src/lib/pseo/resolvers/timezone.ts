import type {
  Resolver,
  ResolverListEntry,
  PageModel,
  HubCity,
  CityEntry,
} from "../types";
import hubs from "@/data/hubs.json" assert { type: "json" };
import cities from "@/data/cities.json" assert { type: "json" };
import { zoneFacts, converterBlocks } from "../content/zone-facts";
import { isIndexable, scoreBlocks, buildFingerprint } from "../gate";

const DATA_VERSION = "2026-10-03";

const HUB_LIST = hubs as unknown as HubCity[];
const CITY_LIST = cities as unknown as CityEntry[];

const ZONE_TOP_PAIRS: [string, string][] = [
  ["UTC", "America/New_York"],
  ["UTC", "Europe/London"],
  ["UTC", "Europe/Paris"],
  ["UTC", "Asia/Tokyo"],
  ["UTC", "Asia/Dubai"],
  ["America/New_York", "Europe/London"],
  ["America/New_York", "America/Los_Angeles"],
  ["Europe/London", "Asia/Singapore"],
  ["Asia/Tokyo", "America/Los_Angeles"],
  ["Europe/Paris", "Africa/Algiers"],
  ["Asia/Dubai", "Asia/Kolkata"],
  ["UTC", "Australia/Sydney"],
];

const HUB_BY_SLUG = new Map<string, HubCity>(
  HUB_LIST.map((h) => [h.slug, h])
);
const HUB_BY_IANA = new Map<string, HubCity>(
  HUB_LIST.map((h) => [h.iana, h])
);
const CITY_BY_SLUG = new Map<string, CityEntry>(
  CITY_LIST.map((c) => [c.slug, c])
);
const CITY_BY_IANA = new Map<string, CityEntry>(
  CITY_LIST.map((c) => [c.iana, c])
);

function zoneSlugToIana(slug: string): string | null {
  const hub = HUB_BY_SLUG.get(slug);
  if (hub) return hub.iana;
  const city = CITY_BY_SLUG.get(slug);
  if (city) return city.iana;
  const direct = slug.replace(/-/g, "/");
  const slashForm = direct.replace(/^([A-Za-z]+)\//, (m) => m);
  if (HUB_BY_IANA.has(slashForm) || CITY_BY_IANA.has(slashForm)) return slashForm;
  if (/^[A-Za-z0-9_]+\/[A-Za-z0-9_\/]+$/.test(slashForm)) return slashForm;
  return null;
}

function ianaFromSegment(segment: string): string | null {
  const hub = HUB_BY_SLUG.get(segment);
  if (hub) return hub.iana;
  const city = CITY_BY_SLUG.get(segment);
  if (city) return city.iana;
  const slashed = segment.replace(/-/g, "/");
  if (/^[A-Za-z_]+(\/[A-Za-z0-9_]+)+$/.test(slashed)) return slashed;
  if (/^Etc\/[A-Za-z0-9+\-]+$/.test(slashed)) return slashed;
  return null;
}

function findZoneInfo(iana: string): HubCity | CityEntry | undefined {
  return HUB_BY_IANA.get(iana) ?? CITY_BY_IANA.get(iana);
}

export const timezoneResolver: Resolver = {
  type: "timezone",
  prefix: "timezones",

  list(): ResolverListEntry[] {
    const entries: ResolverListEntry[] = [];

    for (const hub of HUB_LIST) {
      entries.push({
        segments: [hub.slug],
        tier: 1,
        indexable: true,
        lastModified: DATA_VERSION,
        fingerprint: buildFingerprint([
          "timezone",
          "zone",
          hub.iana,
          DATA_VERSION,
          hub.population,
        ]),
      });
    }

    for (const city of CITY_LIST) {
      entries.push({
        segments: [city.slug],
        tier: city.tier,
        indexable: true,
        lastModified: DATA_VERSION,
        fingerprint: buildFingerprint([
          "timezone",
          "zone",
          city.iana,
          DATA_VERSION,
          city.population,
          city.tier,
        ]),
      });
    }

    for (const [fromIana, toIana] of ZONE_TOP_PAIRS) {
      const pairSlug = `${fromIana.replace(/\//g, "-")}-to-${toIana.replace(/\//g, "-")}`;
      entries.push({
        segments: [pairSlug.toLowerCase()],
        tier: 1,
        indexable: true,
        lastModified: DATA_VERSION,
        fingerprint: buildFingerprint([
          "timezone",
          "converter",
          fromIana,
          toIana,
          DATA_VERSION,
        ]),
      });
    }

    return entries.slice(0, 40);
  },

  resolve(segments): PageModel | null {
    if (segments.length !== 1) return null;
    const seg = segments[0];
    if (!seg) return null;

    if (seg.includes("-to-")) {
      return resolveConverterPage(seg);
    }

    return resolveZonePage(seg);
  },
};

function resolveZonePage(slug: string): PageModel | null {
  const iana = ianaFromSegment(slug) ?? zoneSlugToIana(slug);
  if (!iana) return null;

  const info = findZoneInfo(iana);
  const blocks = zoneFacts(iana, info);
  const uniqueFacts = scoreBlocks(blocks);
  const fingerprint = buildFingerprint([
    "timezone",
    "zone",
    iana,
    DATA_VERSION,
    uniqueFacts,
  ]);

  const displayName = info
    ? `${info.name}, ${info.country}`
    : iana.replace(/\//g, " ");
  const title = `Time Zone ${displayName} – IANA ${iana} rules, offset & DST | Castov`;
  const description = `IANA time zone ${iana} reference page: ${info ? `${info.name} ${info.country}` : ""} current UTC offset, daylight saving schedule, historical rule changes and the safe way to use this zone in code.`;
  const h1 = `Time Zone: ${displayName}`;
  const intro = `Everything you need to work with the IANA time zone ${iana}. Reference city: ${info ? info.name : "—"}. Population ${info && "population" in info ? info.population.toLocaleString() : "—"}. Use the timezone converter below to translate times between this zone and any other.`;
  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Time Zones", href: "/timezones" },
    { name: displayName },
  ];

  return {
    type: "timezone",
    path: `/timezones/${slug}`,
    title,
    description,
    h1,
    intro,
    breadcrumbs,
    tool: { component: "timezone-converter" },
    blocks,
    faq: [
      {
        q: `What is the IANA identifier for ${displayName}?`,
        a: `The canonical IANA identifier is ${iana}. Store this string in databases and config files; never hard-code a numeric UTC offset or a three-letter abbreviation.`,
      },
      {
        q: `Does ${iana} observe daylight saving time?`,
        a: `Convert a specific date using the timezone converter above to see if DST was in effect on that day. Legislatures change DST rules occasionally, so the IANA TZ database is updated several times a year.`,
      },
      {
        q: `How do I convert times between ${iana} and UTC?`,
        a: `Use the timezone converter above, or in code pass ${iana} as the zone parameter to your runtime's IANA-aware date library (Intl.DateTimeFormat, ZoneInfo, java.time, etc.). Never add or subtract a fixed offset.`,
      },
    ],
    related: [
      {
        heading: "Popular converter pairs",
        links: ZONE_TOP_PAIRS.slice(0, 6).map(([f, t]) => ({
          href: `/timezones/${f.replace(/\//g, "-").toLowerCase()}-to-${t.replace(/\//g, "-").toLowerCase()}`,
          label: `${f.replace(/\//g, " ")} → ${t.replace(/\//g, " ")}`,
        })),
      },
      {
        heading: "Nearby cities / zones",
        links: HUB_LIST.filter((h) => h.iana !== iana)
          .slice(0, 6)
          .map((h) => ({
            href: `/timezones/${h.slug}`,
            label: `${h.name}, ${h.country} (${h.iana})`,
          })),
      },
      {
        heading: "Live tools",
        links: [
          { href: `/timezone-converter`, label: "Timezone Converter" },
          { href: `/world-clock`, label: "World Clock" },
          { href: `/tools/utc-converter`, label: "UTC Converter" },
        ],
      },
    ],
    uniqueFacts,
    indexable: isIndexable("timezone", uniqueFacts),
    lastModified: DATA_VERSION,
    jsonLd: [],
    fingerprint,
  };
}

function resolveConverterPage(slug: string): PageModel | null {
  const idx = slug.indexOf("-to-");
  if (idx < 0) return null;
  const fromPart = slug.slice(0, idx);
  const toPart = slug.slice(idx + 4);
  const fromIana = zoneSlugToIana(fromPart) ?? fromPart.replace(/-/g, "/");
  const toIana = zoneSlugToIana(toPart) ?? toPart.replace(/-/g, "/");

  if (!fromIana || !toIana) return null;

  const fromInfo = findZoneInfo(fromIana);
  const toInfo = findZoneInfo(toIana);

  let fromOffset: number | undefined;
  let toOffset: number | undefined;
  let dstInfo: string | undefined;
  try {
    const now = new Date();
    const fmt = (tz: string) =>
      new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        timeZoneName: "shortOffset",
      })
        .formatToParts(now)
        .find((p) => p.type === "timeZoneName")?.value ?? "";
    const parseOffset = (s: string): number => {
      const m = /GMT([+-]?)(\d{1,2}):?(\d{2})?/.exec(s);
      if (!m) return 0;
      const sign = m[1] === "-" ? -1 : 1;
      const h = parseInt(m[2], 10);
      const mm = m[3] ? parseInt(m[3], 10) : 0;
      return sign * (h * 60 + mm);
    };
    fromOffset = parseOffset(fmt(fromIana));
    toOffset = parseOffset(fmt(toIana));
    const diff = (toOffset - fromOffset) / 60;
    dstInfo = `At this moment ${fromIana.replace(/\//g, " ")} is UTC${fmtOffset(fromOffset)} and ${toIana.replace(/\//g, " ")} is UTC${fmtOffset(toOffset)}, a wall-clock difference of ${diff >= 0 ? "+" : "−"}${Math.abs(diff)}h.`;
  } catch {
    // Intl unavailable or unsupported zone – fall back gracefully.
  }

  const blocks = [
    ...converterBlocks(fromIana, toIana, fromOffset, toOffset, dstInfo),
  ];
  const uniqueFacts = scoreBlocks(blocks);
  const fingerprint = buildFingerprint([
    "timezone",
    "converter",
    fromIana,
    toIana,
    DATA_VERSION,
    uniqueFacts,
  ]);

  const fromDisplay = fromIana.replace(/\//g, " ");
  const toDisplay = toIana.replace(/\//g, " ");
  const title = `Convert ${fromDisplay} to ${toDisplay} Time – exact offset now | Castov`;
  const description =
    (dstInfo
      ? `${dstInfo} `
      : "") +
    `IANA time zone converter between ${fromIana} and ${toIana}, with correct daylight saving handling, next DST transition info and the common pitfalls when comparing times across these zones.`;
  const h1 = `Convert ${fromDisplay} to ${toDisplay}`;
  const intro = `Translate any moment between the IANA time zones ${fromIana} and ${toIana}. Use the timezone converter tool above for a specific date; the walk-through below explains how the offsets shift and where the one-hour gaps or overlaps fall.`;
  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Time Zones", href: "/timezones" },
    { name: fromDisplay, href: `/timezones/${fromPart}` },
    { name: `to ${toDisplay}` },
  ];

  return {
    type: "timezone",
    path: `/timezones/${slug}`,
    title,
    description,
    h1,
    intro,
    breadcrumbs,
    tool: { component: "timezone-converter" },
    blocks,
    faq: [
      {
        q: `What is the time difference between ${fromDisplay} and ${toDisplay} right now?`,
        a: dstInfo ??
          `Use the converter tool above with today's date. The wall-clock difference depends on daylight saving rules in effect on the specific date, so it is not constant across the year.`,
      },
      {
        q: `Does this converter handle daylight saving time correctly?`,
        a: `Yes. It uses the IANA time zone database built into your browser/runtime, which includes the full history of rule changes for ${fromIana} and ${toIana}. Convert the exact date you care about instead of trusting a fixed hour difference.`,
      },
      {
        q: `Why is ${fromDisplay} to ${toDisplay} not a constant N hours?`,
        a: `Because either zone may enter or leave daylight saving on a different weekend. ${fromInfo?.name ?? fromIana} and ${toInfo?.name ?? toIana} do not necessarily share the same DST schedule, and legislators sometimes change the rules with short notice.`,
      },
    ],
    related: [
      {
        heading: "Reverse & nearby pairs",
        links: [
          {
            href: `/timezones/${toPart}-to-${fromPart}`,
            label: `Convert ${toDisplay} → ${fromDisplay}`,
          },
          ...ZONE_TOP_PAIRS.filter(
            ([f, t]) => f !== fromIana || t !== toIana
          )
            .slice(0, 5)
            .map(([f, t]) => ({
              href: `/timezones/${f.replace(/\//g, "-").toLowerCase()}-to-${t.replace(/\//g, "-").toLowerCase()}`,
              label: `${f.replace(/\//g, " ")} → ${t.replace(/\//g, " ")}`,
            })),
        ],
      },
      {
        heading: "Standalone zone pages",
        links: [
          { href: `/timezones/${fromPart}`, label: `${fromDisplay} zone reference` },
          { href: `/timezones/${toPart}`, label: `${toDisplay} zone reference` },
        ],
      },
      {
        heading: "Live tools",
        links: [
          { href: `/timezone-converter`, label: "Timezone Converter" },
          { href: `/world-clock`, label: "World Clock" },
          { href: `/tools/utc-converter`, label: "UTC Converter" },
        ],
      },
    ],
    uniqueFacts,
    indexable: isIndexable("timezone", uniqueFacts),
    lastModified: DATA_VERSION,
    jsonLd: [],
    fingerprint,
  };
}

function fmtOffset(minutes: number): string {
  if (minutes === 0) return "±00:00";
  const sign = minutes > 0 ? "+" : "−";
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
