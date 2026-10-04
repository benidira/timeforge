import type { TaskDef, TaskId } from "./types";

/**
 * The six conversions every language page covers. All snippets use the same fixed instant so that
 * outputs are comparable across languages and can be verified by execution:
 *   1700000000  =  2023-11-14T22:13:20Z
 */
export const TASKS: TaskDef[] = [
  {
    id: "get-current-timestamp",
    title: "Get the Current Unix Timestamp in {lang}",
    question: "How do you get the current Unix timestamp (whole seconds since 1970-01-01 00:00:00 UTC) in {lang}?",
    input: "none (reads the system clock)",
    output: "1700000000",
    dynamic: "now-seconds",
    topics: ["precision", "y2038"],
    toolSlug: "current-unix-timestamp",
    summary: "Reads the system clock and prints the integer number of seconds since the Unix epoch.",
    steps: [
      "Read the wall clock in UTC-based epoch time.",
      "Truncate to whole seconds if the API returns milliseconds or fractions.",
      "Print or store the integer.",
    ],
  },
  {
    id: "timestamp-to-date",
    title: "Convert a Unix Timestamp to a Date in {lang}",
    question: "How do you convert a Unix timestamp in seconds to a readable UTC date in {lang}?",
    input: "1700000000",
    output: "2023-11-14 22:13:20",
    topics: ["timezone", "negative", "y2038"],
    toolSlug: "timestamp-to-date",
    summary: "Turns the seconds value into a UTC calendar date and time formatted as YYYY-MM-DD HH:MM:SS.",
    steps: [
      "Create a date/time value from the epoch seconds, explicitly in UTC.",
      "Format it with a fixed pattern so the output does not depend on locale or server time zone.",
    ],
  },
  {
    id: "date-to-timestamp",
    title: "Convert a Date to a Unix Timestamp in {lang}",
    question: "How do you convert a UTC calendar date and time to a Unix timestamp in {lang}?",
    input: "2023-11-14 22:13:20 (UTC)",
    output: "1700000000",
    topics: ["timezone", "parsing", "y2038"],
    toolSlug: "date-to-timestamp",
    summary: "Builds a UTC date from its calendar fields and prints the seconds since the epoch.",
    steps: [
      "Build the date from year, month, day, hour, minute and second, declaring that the fields are UTC.",
      "Convert it to epoch seconds.",
    ],
  },
  {
    id: "milliseconds-to-date",
    title: "Convert Milliseconds to a Date in {lang}",
    question: "How do you convert a Unix timestamp in milliseconds to a UTC date with milliseconds in {lang}?",
    input: "1700000000123",
    output: "2023-11-14 22:13:20.123",
    topics: ["precision", "negative"],
    toolSlug: "milliseconds-to-date",
    summary: "Splits the milliseconds value into whole seconds and a 0-999 remainder, then formats both in UTC.",
    steps: [
      "Split the value into seconds and milliseconds (or use an API that accepts milliseconds directly).",
      "Format the date and append the three-digit millisecond part.",
    ],
  },
  {
    id: "iso-8601-format",
    title: "Format a Unix Timestamp as ISO 8601 in {lang}",
    question: "How do you turn a Unix timestamp into an ISO 8601 / RFC 3339 UTC string such as 2023-11-14T22:13:20Z in {lang}?",
    input: "1700000000",
    output: "2023-11-14T22:13:20Z",
    topics: ["timezone", "parsing"],
    toolSlug: "unix-to-iso-8601",
    summary: "Formats the instant as an ISO 8601 UTC string ending in Z, without fractional seconds.",
    steps: [
      "Create the date/time from the epoch seconds in UTC.",
      "Format with the ISO 8601 date-time pattern and the literal Z suffix for UTC.",
    ],
  },
  {
    id: "iso-8601-parse",
    title: "Parse an ISO 8601 String to a Unix Timestamp in {lang}",
    question: "How do you parse an ISO 8601 string that has a UTC offset, such as 2023-11-14T23:13:20+01:00, into a Unix timestamp in {lang}?",
    input: "2023-11-14T23:13:20+01:00",
    output: "1700000000",
    topics: ["parsing", "timezone"],
    toolSlug: "iso-8601-to-unix",
    summary: "Parses a string with an explicit +01:00 offset, applies the offset, and prints the epoch seconds in UTC.",
    steps: [
      "Parse the string with a parser that understands the numeric offset.",
      "The offset is subtracted automatically: 23:13:20+01:00 is 22:13:20 UTC.",
      "Convert the resulting instant to epoch seconds.",
    ],
  },
];

export const TASK_IDS = TASKS.map((t) => t.id);
const byId = new Map<string, TaskDef>(TASKS.map((t) => [t.id, t]));
export const getTask = (id: string): TaskDef | undefined => byId.get(id);
export const taskTitle = (task: TaskDef, langName: string) => task.title.replace("{lang}", langName);
export type { TaskId };
