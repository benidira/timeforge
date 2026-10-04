import type { ContentBlock, PageType } from "./types";
import { createHash } from "node:crypto";

export function buildFingerprint(parts: (string | number | boolean | null | undefined)[]): string {
  const joined = parts
    .map((p) => (p === null || p === undefined ? "" : String(p)))
    .join("|");
  return createHash("sha256").update(joined).digest("hex").slice(0, 16);
}

export function scoreBlocks(blocks: ContentBlock[]): number {
  let total = 0;
  for (const block of blocks) {
    total += block.facts;
  }
  return total;
}

const PAGE_TYPE_THRESHOLDS: Record<PageType, number> = {
  convert: 8,
  timezone: 10,
  code: 12,
  cron: 10,
};

export function isIndexable(type: PageType, uniqueFacts: number): boolean {
  const threshold = PAGE_TYPE_THRESHOLDS[type] ?? 10;
  return uniqueFacts >= threshold;
}
