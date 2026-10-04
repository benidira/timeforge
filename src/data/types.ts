import type { ToolSlug } from "@/content/tools";

/**
 * Dataset schemas for the programmatic pages. Datasets are plain, server-only data:
 * never import anything under src/data from a "use client" file (see check:seo bundle test).
 *
 * Type-only imports are erased, so scripts/verify-snippets.mjs can load the language files
 * directly with Node's built-in TypeScript type stripping.
 */

export type Topic = "y2038" | "negative" | "precision" | "timezone" | "parsing";

export type TaskId =
  | "get-current-timestamp"
  | "timestamp-to-date"
  | "date-to-timestamp"
  | "milliseconds-to-date"
  | "iso-8601-format"
  | "iso-8601-parse";

export interface TaskDef {
  id: TaskId;
  /** `{lang}` is replaced with the language name. */
  title: string;
  question: string;
  /** What the snippet is given. Shown to the reader. */
  input: string;
  /** Exact stdout every snippet must print. For `dynamic` tasks this is only an illustration. */
  output: string;
  /** `now-seconds`: output is the current time; the verifier checks shape and closeness instead of equality. */
  dynamic?: "now-seconds";
  /** Language facts that are relevant to this task (keeps sibling pages from repeating the same text). */
  topics: Topic[];
  toolSlug: ToolSlug;
  /** One sentence describing what the snippet does. */
  summary: string;
  steps: string[];
}

export interface Snippet {
  code: string;
  /** Language-specific remarks about THIS snippet (gotchas, portability). */
  notes?: string[];
  /** Extra dependencies, only when the snippet really needs them. */
  needs?: string[];
}

export interface TopicFact {
  /** Short statement shown as the callout title. */
  title: string;
  body: string;
}

export type Risk = "no" | "platform" | "yes";

export interface LanguageEntry {
  slug: string;
  name: string;
  kind: "language" | "shell";
  /** Native wall-clock precision of the standard library. */
  precision: "s" | "ms" | "us" | "ns";
  y2038: Risk;
  /** Whether pre-1970 (negative) timestamps behave sensibly in the standard library. */
  negative: Risk;
  /** Short version of how this language is run (shown with the verification stamp). */
  runner: string;
  facts: Record<Topic, TopicFact>;
  tasks: Partial<Record<TaskId, Snippet>>;
  docs: { label: string; url: string }[];
  /** Slugs of languages people commonly compare this one with. */
  related: string[];
}

/** Written by scripts/verify-snippets.mjs. A snippet counts as verified only if the code hash still matches. */
export interface VerificationFile {
  generatedAt: string;
  languages: Record<
    string,
    { runtime: string; verifiedOn: string; tasks: Partial<Record<TaskId, string>> }
  >;
}
