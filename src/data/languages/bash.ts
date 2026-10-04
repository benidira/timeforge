import type { LanguageEntry } from "../types";

const language = {
  slug: "bash",
  name: "Bash",
  kind: "shell",
  precision: "ns",
  y2038: "platform",
  negative: "no",
  runner: "bash file.sh",
  facts: {
    y2038: {
      title: "Depends on the system's time_t",
      body: "date delegates to the C library. GNU coreutils on a 64-bit system handles dates far beyond 2038, while a 32-bit system with a 32-bit time_t overflows on 2038-01-19.",
    },
    negative: {
      title: "Dates before 1970 work with GNU date",
      body: "date -u -d @-86400 prints Wed Dec 31 00:00:00 UTC 1969. A negative value after @ is read as seconds before the epoch.",
    },
    precision: {
      title: "Seconds by default, nanoseconds on GNU date",
      body: "date +%s gives whole seconds. GNU date also supports %N, so date +%s%3N gives milliseconds. macOS and BSD date do not implement %N and print a literal N.",
    },
    timezone: {
      title: "Always pass -u for UTC",
      body: "date prints in the zone from the TZ variable (or the system default) unless you add -u or set TZ=UTC. Scripts that skip -u produce different output on different servers.",
    },
    parsing: {
      title: "GNU and BSD date parse differently",
      body: "GNU date -d is a very permissive parser: it accepts 'yesterday', '2 days ago' and ISO strings. macOS and BSD date has no -d for strings; it uses date -j -f 'format' 'string' with an explicit format, and -r for epoch seconds.",
    },
  },
  tasks: {
    "get-current-timestamp": {
      code: String.raw`date +%s`,
      notes: ["%s is a GNU and BSD extension to POSIX date, but every mainstream Linux, macOS and BusyBox build supports it."],
    },
    "timestamp-to-date": {
      code: String.raw`ts=1700000000
date -u -d "@$ts" "+%Y-%m-%d %H:%M:%S"`,
      notes: ["This is GNU date syntax. On macOS or BSD use date -u -r 1700000000 '+%Y-%m-%d %H:%M:%S'."],
    },
    "date-to-timestamp": {
      code: String.raw`date -u -d "2023-11-14 22:13:20" +%s`,
      notes: ["Without -u, GNU date reads the input as local time. On macOS use date -j -u -f '%Y-%m-%d %H:%M:%S' '2023-11-14 22:13:20' +%s."],
    },
    "milliseconds-to-date": {
      code: String.raw`ms=1700000000123
seconds=$((ms / 1000))
milli=$((ms % 1000))
printf '%s.%03d\n' "$(date -u -d "@$seconds" '+%Y-%m-%d %H:%M:%S')" "$milli"`,
      notes: ["Bash integer arithmetic truncates toward zero, so negative milliseconds need the same remainder fix as C. printf's %03d pads the fraction with zeros."],
    },
    "iso-8601-format": {
      code: String.raw`date -u -d "@1700000000" "+%Y-%m-%dT%H:%M:%SZ"`,
      notes: ["GNU date also has date -u -d @1700000000 --iso-8601=seconds, but it prints +00:00 rather than Z."],
    },
    "iso-8601-parse": {
      code: String.raw`date -d "2023-11-14T23:13:20+01:00" +%s`,
      notes: ["GNU date applies the +01:00 offset itself, so no -u is needed. BSD date needs -j -f '%Y-%m-%dT%H:%M:%S%z' and the offset written as +0100."],
    },
  },
  docs: [
    { label: "GNU coreutils: date invocation", url: "https://www.gnu.org/software/coreutils/manual/html_node/date-invocation.html" },
  ],
  related: ["perl", "python", "c", "ruby"],
} satisfies LanguageEntry;

export default language;
