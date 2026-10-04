import type { LanguageEntry } from "../types";

const language = {
  slug: "csharp",
  name: "C#",
  kind: "language",
  precision: "ns",
  y2038: "no",
  negative: "no",
  runner: "dotnet run",
  facts: {
    y2038: {
      title: "No Year 2038 problem",
      body: "DateTime counts 100-nanosecond ticks since 0001-01-01 in a 64-bit integer and is valid through 9999-12-31. ToUnixTimeSeconds() returns a long.",
    },
    negative: {
      title: "Dates before 1970 work",
      body: "DateTimeOffset.FromUnixTimeSeconds(-1) is 1969-12-31 23:59:59 +00:00. The accepted range is -62135596800 to 253402300799 seconds.",
    },
    precision: {
      title: "100-nanosecond ticks, seconds and milliseconds helpers",
      body: "DateTimeOffset.UtcNow has 100 ns tick resolution. ToUnixTimeSeconds() and ToUnixTimeMilliseconds() (.NET 4.6+) return long values and truncate toward zero.",
    },
    timezone: {
      title: "Prefer DateTimeOffset over DateTime",
      body: "DateTime carries a Kind (Utc, Local or Unspecified) that changes how conversions behave and is a frequent source of bugs. DateTimeOffset stores an explicit offset. TimeZoneInfo.FindSystemTimeZoneById accepts IANA ids on Linux and macOS, and on Windows since .NET 6.",
    },
    parsing: {
      title: "Always pass CultureInfo.InvariantCulture",
      body: "Parse and ToString use the current culture by default, which can change separators and calendars. Use CultureInfo.InvariantCulture or ParseExact for machine formats.",
    },
  },
  tasks: {
    "get-current-timestamp": {
      code: String.raw`using System;

Console.WriteLine(DateTimeOffset.UtcNow.ToUnixTimeSeconds());`,
      notes: ["This uses C# 9 top-level statements, so no Main method or class is required."],
    },
    "timestamp-to-date": {
      code: String.raw`using System;
using System.Globalization;

var date = DateTimeOffset.FromUnixTimeSeconds(1700000000);
Console.WriteLine(date.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture));`,
      notes: ["FromUnixTimeSeconds returns an offset of zero, so the formatted text is UTC. Without InvariantCulture the : in the pattern can print as a different time separator in some cultures."],
    },
    "date-to-timestamp": {
      code: String.raw`using System;

var date = new DateTimeOffset(2023, 11, 14, 22, 13, 20, TimeSpan.Zero);
Console.WriteLine(date.ToUnixTimeSeconds());`,
      notes: ["TimeSpan.Zero is the UTC offset. A DateTime built with DateTimeKind.Unspecified would be assumed local when converted."],
    },
    "milliseconds-to-date": {
      code: String.raw`using System;
using System.Globalization;

var date = DateTimeOffset.FromUnixTimeMilliseconds(1700000000123);
Console.WriteLine(date.ToString("yyyy-MM-dd HH:mm:ss.fff", CultureInfo.InvariantCulture));`,
      notes: ["fff prints exactly three fractional digits; lowercase ff and F variants trim or drop trailing zeros differently."],
    },
    "iso-8601-format": {
      code: String.raw`using System;
using System.Globalization;

var date = DateTimeOffset.FromUnixTimeSeconds(1700000000);
Console.WriteLine(date.ToString("yyyy-MM-dd'T'HH:mm:ss'Z'", CultureInfo.InvariantCulture));`,
      notes: ["Quote the T and Z so they are treated as literals. date.ToString(\"o\") prints the round-trip form with seven fractional digits and +00:00 instead."],
    },
    "iso-8601-parse": {
      code: String.raw`using System;
using System.Globalization;

var date = DateTimeOffset.Parse("2023-11-14T23:13:20+01:00", CultureInfo.InvariantCulture);
Console.WriteLine(date.ToUnixTimeSeconds());`,
      notes: ["Use DateTimeOffset.TryParse when the input is untrusted, since Parse throws FormatException on bad input."],
    },
  },
  docs: [{ label: ".NET docs: DateTimeOffset", url: "https://learn.microsoft.com/en-us/dotnet/api/system.datetimeoffset" }],
  related: ["java", "kotlin", "go", "javascript"],
} satisfies LanguageEntry;

export default language;
