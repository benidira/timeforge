import { MAX_MS, MESSAGES, MIN_MS } from "./core";
import { parseTimestamp, type Unit, type UnitChoice } from "./timestamp";

export const TIMESTAMP_LIMITS = {
  minSeconds: MIN_MS / 1000,
  maxSeconds: Math.floor(MAX_MS / 1000),
  minMilliseconds: MIN_MS,
  maxMilliseconds: MAX_MS,
} as const;

export type ValidationProblem = "empty" | "characters" | "scientific" | "tooManyDigits" | "range";

export type TimestampValidation =
  | { valid: true; ms: number; unit: Unit; detected: boolean; digits: number; message: string; notes: string[] }
  | { valid: false; problem: ValidationProblem; message: string };

function excerpt(s: string): string {
  return s.length > 24 ? `${s.slice(0, 24)}\u2026` : s;
}

/** Explains exactly why a value is or is not a usable Unix timestamp. */
export function validateTimestamp(raw: string, choice: UnitChoice = "auto"): TimestampValidation {
  const trimmed = raw.trim();
  if (!trimmed) return { valid: false, problem: "empty", message: "Enter a value to validate, for example 1790000000." };

  const cleaned = trimmed.replace(/[\s,_]/g, "");
  if (/^[+-]?\d+(\.\d+)?[eE][+-]?\d+$/.test(cleaned)) {
    return {
      valid: false,
      problem: "scientific",
      message: `Scientific notation (${excerpt(trimmed)}) is not accepted. Write the full number, for example 1790000000.`,
    };
  }
  if (!/^[+-]?\d+(\.\d+)?$/.test(cleaned)) {
    return {
      valid: false,
      problem: "characters",
      message: `"${excerpt(trimmed)}" is not a Unix timestamp. A timestamp contains only digits, with an optional minus sign and an optional decimal point.`,
    };
  }

  const digits = cleaned.replace(/^[+-]/, "").split(".")[0].replace(/^0+(?=\d)/, "").length;
  const parsed = parseTimestamp(trimmed, choice);
  if (!parsed.ok) {
    const problem: ValidationProblem = parsed.error === MESSAGES.tooManyDigits ? "tooManyDigits" : "range";
    const unitWord = choice === "auto" ? "seconds or milliseconds" : choice;
    return {
      valid: false,
      problem,
      message:
        problem === "range"
          ? `This is a valid number, but as ${unitWord} it is outside the supported range (years 1 to 9999). ${
              choice === "seconds" ? "If the value is in milliseconds, switch the unit." : ""
            }`.trim()
          : parsed.error,
    };
  }

  const { ms, unit, detected } = parsed.value;
  const notes: string[] = [];
  if (detected) notes.push(`The unit was detected from the digit count (${digits} digits).`);
  if (cleaned.includes(".")) notes.push("The fractional part is kept and rounded to the nearest millisecond.");
  if (cleaned.startsWith("-")) notes.push("Negative timestamps are moments before 1 January 1970.");
  if (unit === "seconds" && digits === 13) notes.push("A 13-digit value is usually milliseconds. Check the unit if the date looks wrong.");
  if (unit === "milliseconds" && digits === 10) notes.push("A 10-digit value is usually seconds. Check the unit if the date looks wrong.");

  return {
    valid: true,
    ms,
    unit,
    detected,
    digits,
    message: `Valid Unix timestamp in ${unit}.`,
    notes,
  };
}
