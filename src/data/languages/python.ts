import type { LanguageEntry } from "../types";

const language = {
  slug: "python",
  name: "Python",
  kind: "language",
  precision: "us",
  y2038: "no",
  negative: "platform",
  runner: "python3 file.py",
  facts: {
    y2038: {
      title: "No Year 2038 problem on 64-bit Python",
      body: "datetime supports years 1 to 9999 and time.time() returns a float, so the 32-bit overflow does not apply. Values beyond year 9999 raise ValueError or OverflowError instead of wrapping around.",
    },
    negative: {
      title: "Negative timestamps are platform-dependent for naive datetimes",
      body: "datetime.fromtimestamp(-1, tz=timezone.utc) works on Linux and macOS, but fromtimestamp with negative values can raise OSError on Windows. The portable form is datetime(1970, 1, 1, tzinfo=timezone.utc) + timedelta(seconds=ts).",
    },
    precision: {
      title: "time.time() is a float; time.time_ns() is exact",
      body: "time.time() returns float seconds. A 64-bit float near today's epoch resolves about 0.24 microseconds, so sub-microsecond digits are noise. time.time_ns() (Python 3.7+) returns an exact integer count of nanoseconds.",
    },
    timezone: {
      title: "Always attach tzinfo",
      body: "A naive datetime has no time zone, and .timestamp() interprets it as local time. Pass tz=timezone.utc (or a zoneinfo.ZoneInfo on 3.9+). datetime.utcfromtimestamp() is deprecated since Python 3.12 because it returns a naive datetime.",
    },
    parsing: {
      title: "fromisoformat and the Z suffix",
      body: "datetime.fromisoformat() reads numeric offsets such as +01:00 since Python 3.7, but only accepts the trailing Z from Python 3.11. On older versions replace Z with +00:00 first.",
    },
  },
  tasks: {
    "get-current-timestamp": {
      code: String.raw`import time

print(int(time.time()))`,
      notes: ["int() truncates the float toward zero, which is what you want for a Unix timestamp in seconds."],
    },
    "timestamp-to-date": {
      code: String.raw`from datetime import datetime, timezone

ts = 1700000000
dt = datetime.fromtimestamp(ts, tz=timezone.utc)
print(dt.strftime("%Y-%m-%d %H:%M:%S"))`,
      notes: [
        "Omitting tz=timezone.utc returns local time and gives a different string on a server in another zone.",
        "datetime.utcfromtimestamp(ts) produces the same text but is deprecated since 3.12 and returns a naive object.",
      ],
    },
    "date-to-timestamp": {
      code: String.raw`from datetime import datetime, timezone

dt = datetime(2023, 11, 14, 22, 13, 20, tzinfo=timezone.utc)
print(int(dt.timestamp()))`,
      notes: ["Without tzinfo=timezone.utc, .timestamp() assumes the machine's local zone, so the same code returns different numbers on different servers."],
    },
    "milliseconds-to-date": {
      code: String.raw`from datetime import datetime, timezone

ms = 1700000000123
seconds, milli = divmod(ms, 1000)
dt = datetime.fromtimestamp(seconds, tz=timezone.utc)
print(dt.strftime("%Y-%m-%d %H:%M:%S") + "." + str(milli).zfill(3))`,
      notes: [
        "divmod keeps the arithmetic in integers. Dividing by 1000.0 and passing a float can land one millisecond off because of binary rounding.",
        "For negative milliseconds divmod floors correctly (the remainder stays 0-999), unlike C-style truncating division.",
      ],
    },
    "iso-8601-format": {
      code: String.raw`from datetime import datetime, timezone

dt = datetime.fromtimestamp(1700000000, tz=timezone.utc)
print(dt.isoformat().replace("+00:00", "Z"))`,
      notes: ["isoformat() writes +00:00 for UTC. Replacing it with Z gives the RFC 3339 shorthand most APIs expect. Add timespec='seconds' if microseconds might be non-zero."],
    },
    "iso-8601-parse": {
      code: String.raw`from datetime import datetime

dt = datetime.fromisoformat("2023-11-14T23:13:20+01:00")
print(int(dt.timestamp()))`,
      notes: ["The +01:00 offset makes the result timezone-aware, so .timestamp() is correct on any machine. A string ending in Z fails here on Python before 3.11."],
    },
  },
  docs: [
    { label: "Python docs: datetime", url: "https://docs.python.org/3/library/datetime.html" },
    { label: "Python docs: time", url: "https://docs.python.org/3/library/time.html" },
  ],
  related: ["javascript", "ruby", "java", "go"],
} satisfies LanguageEntry;

export default language;
