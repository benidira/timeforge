import type { LanguageEntry } from "../types";

const language = {
  slug: "c",
  name: "C",
  kind: "language",
  precision: "s",
  y2038: "platform",
  negative: "platform",
  runner: "gcc file.c && ./a.out",
  facts: {
    y2038: {
      title: "Year 2038 depends on the size of time_t",
      body: "time_t is 64-bit on modern 64-bit Linux, macOS and Windows (MSVC since Visual Studio 2005), but a signed 32-bit integer on many 32-bit and embedded targets, which overflows at 2038-01-19 03:14:07 UTC. glibc 2.34+ lets 32-bit builds opt in to 64-bit time with -D_TIME_BITS=64 -D_FILE_OFFSET_BITS=64.",
    },
    negative: {
      title: "Pre-1970 behaviour is implementation-defined",
      body: "glibc and macOS gmtime() accept negative time_t values, but the C standard does not require it and some embedded libraries return NULL. Always check the pointer returned by gmtime() before using it.",
    },
    precision: {
      title: "time() has one-second resolution",
      body: "time(NULL) returns whole seconds. For sub-second values use clock_gettime(CLOCK_REALTIME, &ts) (POSIX, nanosecond fields) or timespec_get() from C11.",
    },
    timezone: {
      title: "gmtime is UTC but not thread-safe",
      body: "gmtime() returns UTC fields in a static buffer shared by all callers. Use gmtime_r() (POSIX) or gmtime_s() (Windows / C11 Annex K) in threaded code. localtime() depends on the TZ environment variable instead.",
    },
    parsing: {
      title: "No portable date parser or UTC mktime",
      body: "Standard C has no ISO 8601 parser. strptime() is POSIX and missing from MSVC, and timegm() is a BSD/GNU extension (_mkgmtime on Windows). mktime() interprets its fields as local time, so it is wrong for UTC input.",
    },
  },
  tasks: {
    "get-current-timestamp": {
      code: String.raw`#include <stdio.h>
#include <time.h>

int main(void) {
    time_t now = time(NULL);
    printf("%lld\n", (long long)now);
    return 0;
}`,
      notes: ["Cast to long long before printing: time_t may be 32 or 64 bits wide, and %lld with a mismatched type is undefined behaviour."],
    },
    "timestamp-to-date": {
      code: String.raw`#include <stdio.h>
#include <time.h>

int main(void) {
    time_t ts = 1700000000;
    struct tm *utc = gmtime(&ts);
    char buf[32];
    strftime(buf, sizeof buf, "%Y-%m-%d %H:%M:%S", utc);
    puts(buf);
    return 0;
}`,
      notes: ["gmtime() returns a pointer to static storage that the next call overwrites. Copy the struct or use gmtime_r() when threads are involved."],
    },
    "date-to-timestamp": {
      code: String.raw`#define _DEFAULT_SOURCE
#include <stdio.h>
#include <string.h>
#include <time.h>

int main(void) {
    struct tm tm;
    memset(&tm, 0, sizeof tm);
    tm.tm_year = 2023 - 1900; /* years since 1900 */
    tm.tm_mon = 11 - 1;       /* zero-based month */
    tm.tm_mday = 14;
    tm.tm_hour = 22;
    tm.tm_min = 13;
    tm.tm_sec = 20;
    printf("%lld\n", (long long)timegm(&tm));
    return 0;
}`,
      notes: [
        "struct tm counts years from 1900 and months from 0. Forgetting either produces a date 1900 years or one month off.",
        "timegm() is not in the C standard. On Windows use _mkgmtime(), and never use mktime() here because it reads the fields as local time.",
      ],
    },
    "milliseconds-to-date": {
      code: String.raw`#include <stdio.h>
#include <time.h>

int main(void) {
    long long ms = 1700000000123LL;
    time_t seconds = (time_t)(ms / 1000);
    int milli = (int)(ms % 1000);
    struct tm *utc = gmtime(&seconds);
    char buf[32];
    strftime(buf, sizeof buf, "%Y-%m-%d %H:%M:%S", utc);
    printf("%s.%03d\n", buf, milli);
    return 0;
}`,
      notes: [
        "C division truncates toward zero, so for negative milliseconds ms % 1000 is negative and the output is wrong. Normalise with if (milli < 0) { milli += 1000; seconds -= 1; } before formatting.",
        "Use the LL suffix on the literal: 1700000000123 does not fit in a 32-bit long.",
      ],
    },
    "iso-8601-format": {
      code: String.raw`#include <stdio.h>
#include <time.h>

int main(void) {
    time_t ts = 1700000000;
    struct tm *utc = gmtime(&ts);
    char buf[32];
    strftime(buf, sizeof buf, "%Y-%m-%dT%H:%M:%SZ", utc);
    puts(buf);
    return 0;
}`,
      notes: ["The Z is a literal character in the format string, not a strftime conversion. It is correct only because gmtime() produced UTC fields."],
    },
    "iso-8601-parse": {
      code: String.raw`#define _GNU_SOURCE
#include <stdio.h>
#include <string.h>
#include <time.h>

int main(void) {
    struct tm tm;
    memset(&tm, 0, sizeof tm);
    if (strptime("2023-11-14T23:13:20+01:00", "%Y-%m-%dT%H:%M:%S%z", &tm) == NULL) {
        fputs("parse error\n", stderr);
        return 1;
    }
    long long ts = (long long)timegm(&tm) - tm.tm_gmtoff;
    printf("%lld\n", ts);
    return 0;
}`,
      notes: [
        "glibc's strptime stores the offset in tm_gmtoff but does not apply it, so you subtract it from the timegm() result yourself.",
        "This relies on glibc: strptime is POSIX, tm_gmtoff is a BSD/GNU extension, and neither exists in MSVC.",
      ],
    },
  },
  docs: [
    { label: "glibc manual: Calendar Time", url: "https://www.gnu.org/software/libc/manual/html_node/Calendar-Time.html" },
    { label: "cppreference: time.h", url: "https://en.cppreference.com/w/c/chrono" },
  ],
  related: ["cpp", "perl", "rust", "go"],
} satisfies LanguageEntry;

export default language;
