import { MESSAGES, MAX_MS, MIN_MS, fail, normalizeZero, ok, type Result } from "./core";

export type Unit = "seconds" | "milliseconds";
export type UnitChoice = Unit | "auto";

export interface ParsedTimestamp {
  /** Instant as milliseconds since the Unix epoch. */
  ms: number;
  /** The unit that was used to interpret the input. */
  unit: Unit;
  /** True when the unit was guessed (auto-detect). */
  detected: boolean;
}

/**
 * Auto-detection rule: values with 12 or more integer digits (|n| >= 1e11) are treated
 * as milliseconds, everything else as seconds. 1e11 seconds is the year 5138 and
 * 1e11 milliseconds is March 1973, so real-world values are almost never ambiguous.
 */
export function detectUnit(n: number): Unit {
  return Math.abs(n) >= 1e11 ? "milliseconds" : "seconds";
}

/** Plain digits, or digits grouped in threes with commas, underscores or spaces. */
const NUMERIC = /^[+-]?(\d+|\d{1,3}(?:[,_ ]\d{3})+)(\.\d+)?$/;

export function parseTimestamp(raw: string, choice: UnitChoice = "auto"): Result<ParsedTimestamp> {
  const trimmed = raw.trim();
  if (!trimmed || !NUMERIC.test(trimmed)) return fail(MESSAGES.timestamp);
  const cleaned = trimmed.replace(/[,_ ]/g, "");

  const integerDigits = cleaned.replace(/^[+-]/, "").split(".")[0].replace(/^0+(?=\d)/, "").length;
  if (integerDigits >= 16) return fail(MESSAGES.tooManyDigits);

  const n = Number(cleaned);
  if (!Number.isFinite(n)) return fail(MESSAGES.timestamp);

  const unit: Unit = choice === "auto" ? detectUnit(n) : choice;
  const ms = normalizeZero(Math.round(unit === "seconds" ? n * 1000 : n));
  if (ms < MIN_MS || ms > MAX_MS) return fail(MESSAGES.range);

  return ok({ ms, unit, detected: choice === "auto" });
}
