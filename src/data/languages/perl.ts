import type { LanguageEntry } from "../types";

const language = {
  slug: "perl",
  name: "Perl",
  kind: "language",
  precision: "s",
  y2038: "platform",
  negative: "no",
  runner: "perl file.pl",
  facts: {
    y2038: {
      title: "Safe on 64-bit perl, limited on 32-bit builds",
      body: "time() returns a native integer, and since perl 5.12 gmtime() and localtime() accept 64-bit values on 64-bit builds. A perl compiled with 32-bit integers still wraps in 2038.",
    },
    negative: {
      title: "Dates before 1970 work",
      body: "gmtime(-1) returns the fields for 1969-12-31 23:59:59. Time::Local::timegm also accepts dates before the epoch and returns a negative number.",
    },
    precision: {
      title: "time returns whole seconds",
      body: "The built-in time gives integer seconds. Time::HiRes (core) provides time() as a float and gettimeofday() as a (seconds, microseconds) pair.",
    },
    timezone: {
      title: "gmtime is UTC, localtime follows TZ",
      body: "In list context gmtime(ts) returns (sec, min, hour, mday, mon, year, ...) in UTC. The month is zero-based and the year is offset from 1900, but POSIX::strftime accepts those raw values directly.",
    },
    parsing: {
      title: "Time::Piece wants offsets without a colon",
      body: "Core Time::Piece->strptime reads %z as +HHMM, so +01:00 has to be rewritten to +0100 first. Time::Local::timegm takes numeric fields and expects a four-digit year.",
    },
  },
  tasks: {
    "get-current-timestamp": {
      code: String.raw`print time, "\n";`,
      notes: ["time is a built-in function, not a module call, and returns an integer."],
    },
    "timestamp-to-date": {
      code: String.raw`use POSIX qw(strftime);

my $ts = 1700000000;
print strftime("%Y-%m-%d %H:%M:%S", gmtime($ts)), "\n";`,
      notes: ["Passing localtime($ts) instead of gmtime($ts) is the classic bug: the output then shifts with the server's time zone."],
    },
    "date-to-timestamp": {
      code: String.raw`use Time::Local qw(timegm);

# timegm(sec, min, hour, mday, mon, year); the month is zero-based
print timegm(20, 13, 22, 14, 10, 2023), "\n";`,
      notes: ["Argument order is smallest unit first, which is the reverse of most languages. Pass the full year 2023; two-digit years are guessed with a rolling century window."],
    },
    "milliseconds-to-date": {
      code: String.raw`use POSIX qw(strftime floor);

my $ms = 1700000000123;
my $seconds = floor($ms / 1000);
my $milli = $ms - $seconds * 1000;
printf "%s.%03d\n", strftime("%Y-%m-%d %H:%M:%S", gmtime($seconds)), $milli;`,
      notes: ["floor() keeps negative inputs correct, because the remainder $ms - $seconds * 1000 then stays in 0-999. The % operator on negatives follows the sign of the right operand in Perl, but computing the remainder explicitly is clearer."],
    },
    "iso-8601-format": {
      code: String.raw`use POSIX qw(strftime);

print strftime("%Y-%m-%dT%H:%M:%SZ", gmtime(1700000000)), "\n";`,
      notes: ["The trailing Z is a literal in the format string and is correct only because gmtime produced UTC fields."],
    },
    "iso-8601-parse": {
      code: String.raw`use Time::Piece;

my $text = "2023-11-14T23:13:20+01:00";
$text =~ s/([+-]\d\d):(\d\d)$/$1$2/; # Time::Piece reads +0100, not +01:00
my $t = Time::Piece->strptime($text, "%Y-%m-%dT%H:%M:%S%z");
print $t->epoch, "\n";`,
      notes: ["Time::Piece ships with perl since 5.10, so this needs no CPAN install. For stricter ISO 8601 handling the DateTime::Format::ISO8601 module is the usual choice."],
    },
  },
  docs: [
    { label: "perldoc: Time::Local", url: "https://perldoc.perl.org/Time::Local" },
    { label: "perldoc: Time::Piece", url: "https://perldoc.perl.org/Time::Piece" },
  ],
  related: ["ruby", "python", "c", "bash"],
} satisfies LanguageEntry;

export default language;
