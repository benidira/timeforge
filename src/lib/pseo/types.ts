import type { FaqItem, Crumb } from "@/lib/seo";
import type { ToolSlug } from "@/content/tools";

export type { FaqItem, Crumb };

export type PageType = "convert" | "timezone" | "code" | "cron";

export type ContentBlock =
  | { kind: "prose"; heading: string; paragraphs: string[]; facts: number }
  | {
      kind: "code";
      heading: string;
      lang: string;
      code: string;
      expected?: string;
      verifiedOn?: string;
      runtime?: string;
      notes?: string[];
      facts: number;
    }
  | { kind: "table"; heading: string; head: string[]; rows: string[][]; facts: number }
  | {
      kind: "callouts";
      heading: string;
      items: { title: string; body: string; severity: "info" | "warn" }[];
      facts: number;
    }
  | { kind: "steps"; heading: string; steps: { name: string; text: string }[]; facts: number };

export type ToolComponent =
  | "timestamp"
  | "iso"
  | "timezone-converter"
  | "cron"
  | "world-clock"
  | "date-diff"
  | "duration"
  | "shift"
  | "json-viewer";

export interface ToolConfig {
  component: ToolComponent;
  initial?: Record<string, string | number | boolean | undefined>;
}

export interface RelatedGroup {
  heading: string;
  links: { href: string; label: string }[];
}

export interface PageModel {
  type: PageType;
  path: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  breadcrumbs: Crumb[];
  tool?: ToolConfig;
  blocks: ContentBlock[];
  faq: FaqItem[];
  related: RelatedGroup[];
  uniqueFacts: number;
  indexable: boolean;
  lastModified: string;
  jsonLd: object[];
  /** Opaque quality fingerprint (not slug based) for near-duplicate detection. */
  fingerprint: string;
}

export interface ResolverListEntry {
  segments: string[];
  tier: 1 | 2 | 3;
  indexable: boolean;
  lastModified: string;
  fingerprint: string;
}

export interface Resolver {
  type: PageType;
  prefix: string;
  list(): ResolverListEntry[];
  resolve(segments: string[]): PageModel | null;
}

export type FormatId =
  | "unix-seconds"
  | "unix-milliseconds"
  | "iso-8601"
  | "rfc-3339"
  | "utc"
  | "local-date";

export interface TimeFormat {
  id: FormatId;
  slug: string;
  name: string;
  description: string;
  exampleInput: string;
  exampleOutput: string;
  digitsNow?: number;
  pitfalls: { title: string; body: string; severity: "info" | "warn" }[];
  convertsTo: FormatId[];
  facts: number;
}

export interface HubCity {
  slug: string;
  name: string;
  country: string;
  iana: string;
  population: number;
  /** Extra callout facts. */
  notes?: string[];
}

export interface CronPreset {
  slug: string;
  expression: string;
  title: string;
  intent: string;
  category:
    | "interval"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "business"
    | "special";
  nextRuns: string[];
  fieldBreakdown: string[];
  gotchas: { title: string; body: string; severity: "info" | "warn" }[];
  dialects?: Partial<
    Record<"quartz" | "aws-eventbridge" | "kubernetes" | "github-actions", string>
  >;
  facts: number;
}

export interface CityEntry {
  slug: string;
  name: string;
  country: string;
  admin1?: string;
  iana: string;
  population: number;
  tier: 1 | 2 | 3;
}

export type { ToolSlug };
