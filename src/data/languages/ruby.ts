import type { LanguageEntry } from "../types";

const language = {
  slug: "ruby",
  name: "Ruby",
  kind: "language",
  precision: "ns",
  y2038: "no",
  negative: "no",
  runner: "ruby file.rb",
  facts: {
    y2038: {
      title: "No Year 2038 problem",
      body: "Ruby's Time class stores its value as an arbitrary-precision rational number internally, so it is not limited to a 32-bit range. Time.at(2**40) works and prints a date thousands of years from now.",
    },
    negative: {
      title: "Dates before 1970 work",
      body: "Time.at(-1).utc is 1969-12-31 23:59:59 UTC. Negative epoch values are fully supported.",
    },
    precision: {
      title: "Nanosecond clock, integer or float on request",
      body: "Time.now carries nanosecond resolution where the OS provides it. #to_i truncates to whole seconds, #to_f returns float seconds, and strftime('%L') prints milliseconds.",
    },
    timezone: {
      title: "Time.at returns local time by default",
      body: "Time.at(ts) builds a Time in the system's local zone. Call .utc (or .getutc) before formatting, otherwise the output changes with the server's TZ setting.",
    },
    parsing: {
      title: "Time.iso8601 is strict, Time.parse is permissive",
      body: "After require 'time', Time.iso8601 raises ArgumentError on anything that is not valid ISO 8601, while Time.parse accepts many ambiguous formats and guesses. Prefer iso8601 for data that comes from APIs.",
    },
  },
  tasks: {
    "get-current-timestamp": {
      code: String.raw`puts Time.now.to_i`,
      notes: ["Time.now.to_i truncates. Time.now.to_f gives seconds with a fractional part, and Time.now.strftime('%s%L') gives milliseconds as digits."],
    },
    "timestamp-to-date": {
      code: String.raw`ts = 1700000000
puts Time.at(ts).utc.strftime("%Y-%m-%d %H:%M:%S")`,
      notes: ["Time.at(ts) alone formats in the server's local zone. The .utc call is what makes the output deterministic."],
    },
    "date-to-timestamp": {
      code: String.raw`puts Time.utc(2023, 11, 14, 22, 13, 20).to_i`,
      notes: ["Unlike JavaScript, Ruby's Time.utc takes a one-based month (11 = November). Time.new(...) and Time.local(...) without a zone would use the local zone."],
    },
    "milliseconds-to-date": {
      code: String.raw`ms = 1700000000123
time = Time.at(ms, :millisecond).utc
puts time.strftime("%Y-%m-%d %H:%M:%S.%L")`,
      notes: ["The unit argument to Time.at (:millisecond, :usec, :nsec) exists since Ruby 2.5 and avoids float rounding. %L prints three-digit milliseconds."],
    },
    "iso-8601-format": {
      code: String.raw`require "time"

puts Time.at(1700000000).utc.iso8601`,
      notes: ["Time#iso8601 comes from the time library, so require 'time' is needed. For a UTC Time it prints the Z suffix automatically."],
    },
    "iso-8601-parse": {
      code: String.raw`require "time"

puts Time.iso8601("2023-11-14T23:13:20+01:00").to_i`,
      notes: ["Time.iso8601 raises ArgumentError for malformed input, which is usually what you want when validating API data."],
    },
  },
  docs: [
    { label: "Ruby docs: Time", url: "https://docs.ruby-lang.org/en/master/Time.html" },
  ],
  related: ["python", "javascript", "perl", "java"],
} satisfies LanguageEntry;

export default language;
