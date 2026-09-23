import { describe, expect, it } from "vitest";
import { GUIDES } from "@/content/guides";
import { getExamples } from "@/content/examples";
import { TOOLS, TOOL_SLUGS, getTool } from "@/content/tools";
import { allPaths } from "@/lib/routes";
import { breadcrumbJsonLd, buildMetadata, faqJsonLd, webApplicationJsonLd } from "@/lib/seo";
import { SITE, absoluteUrl } from "@/lib/site";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

/** Titles exactly as specified for the project. */
const SPEC_TITLES: Record<string, string> = {
  "unix-timestamp-converter": "Unix Timestamp Converter – Convert Unix Time to Date | TimeForge",
  "epoch-converter": "Epoch Converter – Convert Epoch Time to Date | TimeForge",
  "timestamp-to-date": "Timestamp to Date Converter – Convert Unix Timestamp | TimeForge",
  "date-to-timestamp": "Date to Unix Timestamp Converter | TimeForge",
  "current-unix-timestamp": "Current Unix Timestamp – Live Epoch Time Now | TimeForge",
  "milliseconds-to-date": "Milliseconds to Date Converter – Unix Milliseconds | TimeForge",
  "iso-8601-to-unix": "ISO 8601 to Unix Timestamp Converter | TimeForge",
  "unix-to-iso-8601": "Unix Timestamp to ISO 8601 Converter | TimeForge",
  "timezone-converter": "Timezone Converter – Convert Time Between Time Zones | TimeForge",
  "timestamp-difference": "Timestamp Difference Calculator – Calculate Time Difference | TimeForge",
};

const ORIGINAL_TEN = Object.keys(SPEC_TITLES);

describe("tool registry", () => {
  it("contains 25 tools, including the original ten", () => {
    expect(TOOLS).toHaveLength(25);
    for (const slug of ORIGINAL_TEN) expect(TOOL_SLUGS).toContain(slug);
    expect(new Set(TOOL_SLUGS).size).toBe(TOOL_SLUGS.length);
  });

  it("keeps the exact SEO titles from the original spec for the first ten tools", () => {
    for (const slug of ORIGINAL_TEN) expect(getTool(slug)?.seoTitle).toBe(SPEC_TITLES[slug]);
  });

  it("gives every new tool a title ending in | TimeForge", () => {
    for (const t of TOOLS) expect(t.seoTitle.endsWith("| TimeForge")).toBe(true);
  });

  it("has unique titles, descriptions, intros and FAQs", () => {
    for (const key of ["seoTitle", "metaDescription", "intro", "cardDescription"] as const) {
      const values = TOOLS.map((t) => t[key]);
      expect(new Set(values).size).toBe(values.length);
    }
    const questions = TOOLS.flatMap((t) => t.faq.map((f) => f.q));
    expect(new Set(questions).size).toBe(questions.length);
    const paragraphs = TOOLS.flatMap((t) => t.sections.flatMap((s) => s.paragraphs));
    expect(new Set(paragraphs).size).toBe(paragraphs.length);
  });

  it("keeps meta descriptions a sensible length and free of keyword stuffing", () => {
    for (const t of TOOLS) {
      expect(t.metaDescription.length).toBeGreaterThanOrEqual(90);
      expect(t.metaDescription.length).toBeLessThanOrEqual(160);
      expect(t.seoTitle.endsWith("| TimeForge")).toBe(true);
    }
  });

  it("gives every tool real content", () => {
    for (const t of TOOLS) {
      expect(t.sections.length).toBeGreaterThanOrEqual(2);
      expect(t.sections[0].paragraphs.join(" ").length).toBeGreaterThan(200);
      expect(t.howTo.length).toBeGreaterThanOrEqual(4);
      expect(t.faq.length).toBeGreaterThanOrEqual(4);
      expect(t.related.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("links only to existing, different tools and guides", () => {
    const guides = new Set<string>(GUIDES.map((g) => g.slug));
    for (const t of TOOLS) {
      expect(t.related).not.toContain(t.slug);
      expect(new Set(t.related).size).toBe(t.related.length);
      for (const r of t.related) expect(getTool(r)).toBeDefined();
      if (t.guide) expect(guides.has(t.guide)).toBe(true);
    }
  });

  it("follows the internal linking plan for the Unix Timestamp Converter", () => {
    expect(getTool("unix-timestamp-converter")?.related).toEqual([
      "epoch-converter",
      "timestamp-to-date",
      "date-to-timestamp",
      "milliseconds-to-date",
      "unix-to-iso-8601",
    ]);
  });

  it("builds examples for every tool without errors", () => {
    for (const t of TOOLS) {
      const ex = getExamples(t.slug);
      expect(ex.items.length).toBeGreaterThanOrEqual(3);
      const text = JSON.stringify(ex);
      expect(text).not.toMatch(/NaN|Invalid Date|undefined|null/);
    }
  });

  it("computes the documented examples correctly", () => {
    const unix = JSON.stringify(getExamples("unix-timestamp-converter"));
    expect(unix).toContain("2026-09-21T14:13:20.000Z");
    expect(unix).toContain("2026-09-21T14:13:20.123Z");
    expect(unix).toContain("1969-12-31T00:00:00.000Z");
    expect(JSON.stringify(getExamples("epoch-converter"))).toContain("2038-01-19T03:14:07.000Z");
    expect(JSON.stringify(getExamples("timestamp-difference"))).toContain("2 days 4 hours 12 minutes 30 seconds");
    expect(JSON.stringify(getExamples("iso-8601-to-unix"))).toContain("1789907400");
    expect(JSON.stringify(getExamples("date-to-timestamp"))).toContain("1789921800");
    expect(JSON.stringify(getExamples("timezone-converter"))).toContain("2026-09-20 08:00:00");
  });
});

describe("guides", () => {
  it("are unique, substantial and link to real tools", () => {
    expect(new Set(GUIDES.map((g) => g.slug)).size).toBe(GUIDES.length);
    expect(new Set(GUIDES.map((g) => g.seoTitle)).size).toBe(GUIDES.length);
    for (const g of GUIDES) {
      expect(g.metaDescription.length).toBeLessThanOrEqual(160);
      expect(g.sections.length).toBeGreaterThanOrEqual(3);
      expect(g.sections.flatMap((s) => s.paragraphs).join(" ").length).toBeGreaterThan(900);
      for (const slug of g.tools) expect(getTool(slug)).toBeDefined();
    }
  });
});

describe("sitemap and robots", () => {
  it("lists every page once with absolute URLs", () => {
    const urls = sitemap().map((e) => e.url);
    expect(new Set(urls).size).toBe(urls.length);
    for (const u of urls) expect(u.startsWith(SITE.url)).toBe(true);
    for (const t of TOOLS) expect(urls).toContain(absoluteUrl(`/${t.slug}`));
    for (const p of ["/", "/tools", "/guides", "/about", "/privacy", "/terms", "/contact"]) expect(urls).toContain(absoluteUrl(p));
    for (const g of GUIDES) expect(urls).toContain(absoluteUrl(`/guides/${g.slug}`));
    expect(urls).toHaveLength(allPaths().length);
  });

  it("robots.txt allows crawling and points to the sitemap", () => {
    const r = robots();
    expect(r.sitemap).toBe(absoluteUrl("/sitemap.xml"));
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules];
    expect(rules.some((x) => x.allow === "/" && !x.disallow)).toBe(true);
  });
});

describe("metadata and structured data", () => {
  it("builds unique canonical URLs and social tags", () => {
    const m = buildMetadata({ title: "T | TimeForge", description: "D", path: "/epoch-converter" });
    expect(m.alternates?.canonical).toBe(absoluteUrl("/epoch-converter"));
    expect(m.title).toEqual({ absolute: "T | TimeForge" });
    expect(m.openGraph).toMatchObject({ url: absoluteUrl("/epoch-converter"), title: "T | TimeForge", siteName: "TimeForge" });
    expect(m.twitter).toMatchObject({ card: "summary_large_image" });
    expect(JSON.stringify(m)).not.toContain("keywords");
  });

  it("builds a valid BreadcrumbList", () => {
    const data = breadcrumbJsonLd([{ name: "Home", href: "/" }, { name: "Tools", href: "/tools" }, { name: "Epoch" }], "/epoch-converter");
    expect(data["@type"]).toBe("BreadcrumbList");
    expect(data.itemListElement.map((i) => i.position)).toEqual([1, 2, 3]);
    expect(data.itemListElement[2].item).toBe(absoluteUrl("/epoch-converter"));
    expect(data.itemListElement[0].item).toBe(SITE.url);
  });

  it("builds FAQPage data that mirrors the visible FAQ", () => {
    const tool = TOOLS[0];
    const data = faqJsonLd(tool.faq);
    expect(data.mainEntity).toHaveLength(tool.faq.length);
    expect(data.mainEntity[0].name).toBe(tool.faq[0].q);
    expect(data.mainEntity[0].acceptedAnswer.text).toBe(tool.faq[0].a);
  });

  it("builds WebApplication data without invented ratings", () => {
    const data = webApplicationJsonLd({ name: "X", description: "Y", path: "/x" });
    expect(data["@type"]).toBe("WebApplication");
    expect(data.offers).toMatchObject({ price: "0" });
    expect(data.url).toBe(absoluteUrl("/x"));
    expect(JSON.stringify(data)).not.toMatch(/aggregateRating|review/);
  });
});
