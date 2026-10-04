import type { LanguageEntry } from "../types";

const language = {
  slug: "swift",
  name: "Swift",
  kind: "language",
  precision: "us",
  y2038: "no",
  negative: "no",
  runner: "swift file.swift",
  facts: {
    y2038: {
      title: "No Year 2038 problem",
      body: "Date stores a Double count of seconds since the 2001-01-01 reference date. A 64-bit double covers centuries on either side of today, so the 32-bit epoch limit does not apply.",
    },
    negative: {
      title: "Dates before 1970 work",
      body: "Date(timeIntervalSince1970: -1) is 1969-12-31 23:59:59 UTC. Negative intervals are valid.",
    },
    precision: {
      title: "Double seconds, truncated with Int()",
      body: "timeIntervalSince1970 is a Double with sub-microsecond resolution near today's date. Int(...) truncates toward zero, which is the usual way to get Unix seconds.",
    },
    timezone: {
      title: "DateFormatter defaults to the user's locale and zone",
      body: "Date is an absolute instant. A DateFormatter uses the device's time zone and locale unless told otherwise, so set locale = en_US_POSIX and timeZone explicitly for fixed formats, or the user's 12/24-hour setting can change the output.",
    },
    parsing: {
      title: "ISO8601DateFormatter and fractional seconds",
      body: "ISO8601DateFormatter's default options accept strings like 2023-11-14T23:13:20+01:00 but reject fractional seconds. Add .withFractionalSeconds (iOS 11 / macOS 10.13+) when the input contains them.",
    },
  },
  tasks: {
    "get-current-timestamp": {
      code: String.raw`import Foundation

print(Int(Date().timeIntervalSince1970))`,
    },
    "timestamp-to-date": {
      code: String.raw`import Foundation

let date = Date(timeIntervalSince1970: 1700000000)
let formatter = DateFormatter()
formatter.locale = Locale(identifier: "en_US_POSIX")
formatter.timeZone = TimeZone(identifier: "UTC")
formatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
print(formatter.string(from: date))`,
      notes: ["Skipping the en_US_POSIX locale is a well-known bug source: with a 12-hour device setting the output can come back as 10:13:20 PM."],
    },
    "date-to-timestamp": {
      code: String.raw`import Foundation

var calendar = Calendar(identifier: .gregorian)
calendar.timeZone = TimeZone(identifier: "UTC")!
let components = DateComponents(year: 2023, month: 11, day: 14, hour: 22, minute: 13, second: 20)
let date = calendar.date(from: components)!
print(Int(date.timeIntervalSince1970))`,
      notes: ["The calendar's timeZone is what declares the components to be UTC. date(from:) returns nil for invalid components, so avoid the force unwrap in production code."],
    },
    "milliseconds-to-date": {
      code: String.raw`import Foundation

let ms = 1700000000123
let seconds = ms / 1000
let milli = ms % 1000
let formatter = DateFormatter()
formatter.locale = Locale(identifier: "en_US_POSIX")
formatter.timeZone = TimeZone(identifier: "UTC")
formatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
let text = formatter.string(from: Date(timeIntervalSince1970: TimeInterval(seconds)))
print(text + "." + String(format: "%03d", milli))`,
      notes: ["Splitting the integer milliseconds avoids Double rounding, where dividing by 1000.0 can print .122 instead of .123."],
    },
    "iso-8601-format": {
      code: String.raw`import Foundation

let date = Date(timeIntervalSince1970: 1700000000)
print(ISO8601DateFormatter().string(from: date))`,
      notes: ["ISO8601DateFormatter defaults to UTC and prints the Z suffix. Set formatOptions to .withFractionalSeconds to include milliseconds."],
    },
    "iso-8601-parse": {
      code: String.raw`import Foundation

let date = ISO8601DateFormatter().date(from: "2023-11-14T23:13:20+01:00")!
print(Int(date.timeIntervalSince1970))`,
      notes: ["date(from:) returns nil on invalid input. Handle that case instead of force-unwrapping when the string comes from outside your app."],
    },
  },
  docs: [{ label: "Apple: Date", url: "https://developer.apple.com/documentation/foundation/date" }],
  related: ["kotlin", "csharp", "java", "javascript"],
} satisfies LanguageEntry;

export default language;
