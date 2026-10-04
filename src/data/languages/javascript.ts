import type { LanguageEntry } from "../types";

const language = {
  slug: "javascript",
  name: "JavaScript",
  kind: "language",
  precision: "ms",
  y2038: "no",
  negative: "no",
  runner: "node file.js",
  facts: {
    y2038: {
      title: "No Year 2038 problem",
      body: "A JavaScript Date stores milliseconds since the epoch as a 64-bit floating-point number, valid for roughly 275,760 years either side of 1970 (maximum 8.64e15 ms). The 32-bit overflow on 2038-01-19 does not apply.",
    },
    negative: {
      title: "Dates before 1970 work",
      body: "new Date(-1000) is 1969-12-31T23:59:59.000Z. Negative millisecond values are valid and format normally.",
    },
    precision: {
      title: "Date.now() is in milliseconds, not seconds",
      body: "Date.now() returns integer milliseconds. Divide by 1000 and floor to get Unix seconds. performance.now() is a monotonic timer relative to page load, not a wall-clock time, so never store it as a timestamp.",
    },
    timezone: {
      title: "Date is an absolute instant; the methods decide the zone",
      body: "A Date holds one instant. toISOString() and the getUTC* methods read it in UTC, while toString(), getHours() and friends use the host time zone. Intl.DateTimeFormat with a timeZone option converts to any IANA zone.",
    },
    parsing: {
      title: "Offset-less strings are parsed inconsistently",
      body: "Date.parse accepts ISO 8601 strings with Z or an offset. Per the ECMAScript spec a date-time string without an offset is read as local time, but a date-only string such as 2023-11-14 is read as UTC.",
    },
  },
  tasks: {
    "get-current-timestamp": {
      code: String.raw`console.log(Math.floor(Date.now() / 1000));`,
      notes: ["Use Math.floor, not Math.round: rounding up can return a second that has not happened yet."],
    },
    "timestamp-to-date": {
      code: String.raw`const ts = 1700000000;
const date = new Date(ts * 1000); // the Date constructor wants milliseconds
console.log(date.toISOString().slice(0, 19).replace("T", " "));`,
      notes: [
        "Multiply by 1000: passing seconds directly gives a date in January 1970.",
        "toISOString() always prints UTC, so the result does not depend on the machine's time zone.",
      ],
    },
    "date-to-timestamp": {
      code: String.raw`// Date.UTC takes a ZERO-based month: 10 is November
const ms = Date.UTC(2023, 10, 14, 22, 13, 20);
console.log(ms / 1000);`,
      notes: [
        "Months are zero-based (0 = January) but days are one-based; this off-by-one is the most common bug with Date.UTC and new Date(y, m, d).",
        "new Date(2023, 10, 14, ...) without UTC would use the local time zone and give a different number on different servers.",
      ],
    },
    "milliseconds-to-date": {
      code: String.raw`const ms = 1700000000123;
console.log(new Date(ms).toISOString().slice(0, 23).replace("T", " "));`,
      notes: ["The Date constructor takes milliseconds natively, so no splitting is needed. The first 23 characters of the ISO string end exactly after the .123."],
    },
    "iso-8601-format": {
      code: String.raw`const date = new Date(1700000000 * 1000);
console.log(date.toISOString().replace(/\.\d{3}Z$/, "Z"));`,
      notes: ["toISOString() always includes milliseconds (2023-11-14T22:13:20.000Z). The replace removes them; both forms are valid ISO 8601."],
    },
    "iso-8601-parse": {
      code: String.raw`const ms = Date.parse("2023-11-14T23:13:20+01:00");
console.log(ms / 1000);`,
      notes: ["Date.parse returns NaN for strings it cannot read, rather than throwing. Check Number.isNaN before using the result."],
    },
  },
  docs: [
    { label: "MDN: Date", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date" },
    { label: "MDN: Intl.DateTimeFormat", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat" },
  ],
  related: ["python", "java", "ruby", "go"],
} satisfies LanguageEntry;

export default language;
