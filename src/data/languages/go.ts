import type { LanguageEntry } from "../types";

const language = {
  slug: "go",
  name: "Go",
  kind: "language",
  precision: "ns",
  y2038: "no",
  negative: "no",
  runner: "go run main.go",
  facts: {
    y2038: {
      title: "No Year 2038 problem",
      body: "time.Time keeps seconds since year 1 in an int64, and Unix() returns an int64. The 32-bit limit does not apply.",
    },
    negative: {
      title: "Dates before 1970 work",
      body: "time.Unix(-1, 0).UTC() is 1969-12-31 23:59:59 UTC. Negative seconds are valid and format normally.",
    },
    precision: {
      title: "Pick the accessor that matches your unit",
      body: "time.Now().Unix() gives seconds, UnixMilli() (Go 1.17+) milliseconds, UnixMicro() microseconds and UnixNano() nanoseconds. UnixNano overflows int64 outside roughly the years 1678 to 2262.",
    },
    timezone: {
      title: "time.Unix returns Local time",
      body: "time.Unix(sec, nsec) gives a Time in the process's local zone. Call .UTC() before formatting for deterministic output. Format layouts use the reference time Mon Jan 2 15:04:05 MST 2006, not strftime codes.",
    },
    parsing: {
      title: "Layouts, not format codes",
      body: "time.Parse(time.RFC3339, s) requires a Z or numeric offset. Layouts are written as the reference date, so 2006-01-02 means year-month-day. time.Parse assumes UTC when the string has no zone; use ParseInLocation for any other zone.",
    },
  },
  tasks: {
    "get-current-timestamp": {
      code: String.raw`package main

import (
	"fmt"
	"time"
)

func main() {
	fmt.Println(time.Now().Unix())
}`,
    },
    "timestamp-to-date": {
      code: String.raw`package main

import (
	"fmt"
	"time"
)

func main() {
	t := time.Unix(1700000000, 0).UTC()
	fmt.Println(t.Format("2006-01-02 15:04:05"))
}`,
      notes: ["The layout string is the reference moment itself (2006-01-02 15:04:05). Writing YYYY-MM-DD compiles but prints those letters literally."],
    },
    "date-to-timestamp": {
      code: String.raw`package main

import (
	"fmt"
	"time"
)

func main() {
	t := time.Date(2023, time.November, 14, 22, 13, 20, 0, time.UTC)
	fmt.Println(t.Unix())
}`,
      notes: ["time.Date takes a time.Month constant, so the month is one-based and typo-proof. The last two arguments are nanoseconds and the location."],
    },
    "milliseconds-to-date": {
      code: String.raw`package main

import (
	"fmt"
	"time"
)

func main() {
	t := time.UnixMilli(1700000000123).UTC()
	fmt.Println(t.Format("2006-01-02 15:04:05.000"))
}`,
      notes: ["time.UnixMilli needs Go 1.17 or newer. On older versions use time.Unix(ms/1000, (ms%1000)*1e6). The .000 in the layout prints exactly three fractional digits."],
    },
    "iso-8601-format": {
      code: String.raw`package main

import (
	"fmt"
	"time"
)

func main() {
	t := time.Unix(1700000000, 0).UTC()
	fmt.Println(t.Format(time.RFC3339))
}`,
      notes: ["time.RFC3339 prints Z for UTC and a numeric offset otherwise. Use time.RFC3339Nano if fractional seconds must be kept."],
    },
    "iso-8601-parse": {
      code: String.raw`package main

import (
	"fmt"
	"time"
)

func main() {
	t, err := time.Parse(time.RFC3339, "2023-11-14T23:13:20+01:00")
	if err != nil {
		panic(err)
	}
	fmt.Println(t.Unix())
}`,
      notes: ["Always check the error: a malformed string returns the zero Time (year 1), whose Unix() is a large negative number."],
    },
  },
  docs: [{ label: "Go package time", url: "https://pkg.go.dev/time" }],
  related: ["rust", "java", "python", "csharp"],
} satisfies LanguageEntry;

export default language;
