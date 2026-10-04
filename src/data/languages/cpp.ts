import type { LanguageEntry } from "../types";

const language = {
  slug: "cpp",
  name: "C++",
  kind: "language",
  precision: "ns",
  y2038: "platform",
  negative: "platform",
  runner: "g++ -std=c++17 file.cpp && ./a.out",
  facts: {
    y2038: {
      title: "time_t limits plus the chrono tick range",
      body: "Code that goes through std::time_t inherits the C limits: a 32-bit time_t overflows on 2038-01-19. std::chrono::system_clock is separate: libstdc++ on Linux counts nanoseconds in a 64-bit integer, which ends around the year 2262.",
    },
    negative: {
      title: "Pre-1970 conversion is implementation-defined",
      body: "std::gmtime and gmtime_r handle negative time_t on glibc and macOS, but the standard does not guarantee it. Check for a null result, and prefer C++20 sys_seconds arithmetic where your compiler supports it.",
    },
    precision: {
      title: "system_clock resolution is chosen by the library",
      body: "system_clock::now() ticks in nanoseconds on libstdc++ (Linux), microseconds on libc++ and 100-nanosecond units on MSVC. duration_cast<seconds> or duration_cast<milliseconds> normalises the result.",
    },
    timezone: {
      title: "UTC formatting is easy, other zones are version-dependent",
      body: "gmtime_r (POSIX) or gmtime_s (MSVC) plus std::put_time gives UTC output. Named zones need C++20 std::chrono::zoned_time, which requires a recent standard library (GCC 14, MSVC 2019 16.10+), or Howard Hinnant's date library on older compilers.",
    },
    parsing: {
      title: "std::get_time cannot read UTC offsets",
      body: "std::get_time does not reliably support %z. strptime (POSIX) works with glibc, and C++20 std::chrono::parse handles %z where it is implemented (recent libstdc++ and MSVC).",
    },
  },
  tasks: {
    "get-current-timestamp": {
      code: String.raw`#include <chrono>
#include <iostream>

int main() {
    using namespace std::chrono;
    auto now = system_clock::now().time_since_epoch();
    std::cout << duration_cast<seconds>(now).count() << "\n";
    return 0;
}`,
      notes: ["duration_cast<seconds> truncates toward zero, which matches the C time() behaviour for times after 1970."],
    },
    "timestamp-to-date": {
      code: String.raw`#include <ctime>
#include <iomanip>
#include <iostream>

int main() {
    std::time_t ts = 1700000000;
    std::tm utc{};
    gmtime_r(&ts, &utc); // POSIX; use gmtime_s(&utc, &ts) on MSVC
    std::cout << std::put_time(&utc, "%Y-%m-%d %H:%M:%S") << "\n";
    return 0;
}`,
      notes: ["gmtime_r writes into your own struct, so it is thread-safe, unlike std::gmtime. The argument order differs on MSVC: gmtime_s(&tm, &time)."],
    },
    "date-to-timestamp": {
      code: String.raw`#include <ctime>
#include <iostream>

int main() {
    std::tm tm{};
    tm.tm_year = 2023 - 1900;
    tm.tm_mon = 11 - 1;
    tm.tm_mday = 14;
    tm.tm_hour = 22;
    tm.tm_min = 13;
    tm.tm_sec = 20;
    std::cout << static_cast<long long>(timegm(&tm)) << "\n";
    return 0;
}`,
      notes: [
        "std::mktime would treat these fields as local time. timegm is a BSD/GNU extension that g++ on glibc exposes by default; MSVC provides _mkgmtime instead.",
        "In C++20 the portable alternative is sys_days{2023y/11/14} + 22h + 13min + 20s, converted with time_since_epoch().",
      ],
    },
    "milliseconds-to-date": {
      code: String.raw`#include <chrono>
#include <ctime>
#include <iomanip>
#include <iostream>

int main() {
    using namespace std::chrono;
    milliseconds ms{1700000000123LL};
    auto secs = duration_cast<seconds>(ms);
    long long milli = (ms - secs).count();
    std::time_t t = static_cast<std::time_t>(secs.count());
    std::tm utc{};
    gmtime_r(&t, &utc);
    std::cout << std::put_time(&utc, "%Y-%m-%d %H:%M:%S") << "." << std::setw(3) << std::setfill('0') << milli << "\n";
    return 0;
}`,
      notes: [
        "Subtracting the truncated seconds from the original duration yields the 0-999 remainder with the same sign convention as the input, so negative inputs need the same normalisation as in C.",
        "std::setw(3) with setfill('0') zero-pads the fraction; without it 5 ms would print as .5.",
      ],
    },
    "iso-8601-format": {
      code: String.raw`#include <ctime>
#include <iomanip>
#include <iostream>

int main() {
    std::time_t ts = 1700000000;
    std::tm utc{};
    gmtime_r(&ts, &utc);
    std::cout << std::put_time(&utc, "%Y-%m-%dT%H:%M:%SZ") << "\n";
    return 0;
}`,
      notes: ["%FT%TZ is an equivalent shorthand for the same pattern on glibc and libc++, but the spelled-out form is more portable."],
    },
    "iso-8601-parse": {
      code: String.raw`#include <ctime>
#include <iostream>

int main() {
    std::tm tm{};
    if (strptime("2023-11-14T23:13:20+01:00", "%Y-%m-%dT%H:%M:%S%z", &tm) == nullptr) {
        std::cerr << "parse error\n";
        return 1;
    }
    long long ts = static_cast<long long>(timegm(&tm)) - tm.tm_gmtoff;
    std::cout << ts << "\n";
    return 0;
}`,
      notes: [
        "This is the same glibc-specific approach as in C. strptime and tm_gmtoff are not available on MSVC.",
        "With a C++20 library that implements it, std::chrono::parse(\"%FT%T%z\", tp) is the portable replacement.",
      ],
    },
  },
  docs: [
    { label: "cppreference: std::chrono", url: "https://en.cppreference.com/w/cpp/chrono" },
    { label: "cppreference: std::put_time", url: "https://en.cppreference.com/w/cpp/io/manip/put_time" },
  ],
  related: ["c", "rust", "java", "csharp"],
} satisfies LanguageEntry;

export default language;
