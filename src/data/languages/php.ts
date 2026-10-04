import type { LanguageEntry } from "../types";

const language = {
  slug: "php",
  name: "PHP",
  kind: "language",
  precision: "us",
  y2038: "platform",
  negative: "no",
  runner: "php file.php",
  facts: {
    y2038: {
      title: "Safe on 64-bit PHP, not on 32-bit builds",
      body: "time() returns a PHP integer. On a 64-bit build that is 64 bits wide; on a 32-bit build (PHP_INT_SIZE is 4) timestamps overflow on 2038-01-19. Check PHP_INT_SIZE if you deploy to unusual hosts.",
    },
    negative: {
      title: "Dates before 1970 work",
      body: "gmdate('Y-m-d H:i:s', -1) returns 1969-12-31 23:59:59, and DateTimeImmutable handles dates far before the epoch.",
    },
    precision: {
      title: "time() is seconds; microtime(true) is a float",
      body: "time() returns an integer count of seconds. microtime(true) returns float seconds with microsecond resolution, and hrtime() gives a monotonic nanosecond counter that is not a wall-clock time.",
    },
    timezone: {
      title: "date() uses the configured zone; gmdate() is always UTC",
      body: "date() and mktime() follow date_default_timezone_get(). gmdate() and gmmktime() always use UTC. With the DateTime classes, pass an explicit DateTimeZone instead of relying on the ini setting.",
    },
    parsing: {
      title: "DateTime constructors accept free text",
      body: "new DateTimeImmutable('next thursday') parses relative phrases, which is convenient for people and too loose for APIs. Use DateTimeImmutable::createFromFormat with an explicit format and check DateTimeImmutable::getLastErrors() for strict input.",
    },
  },
  tasks: {
    "get-current-timestamp": {
      code: String.raw`<?php
echo time(), PHP_EOL;`,
    },
    "timestamp-to-date": {
      code: String.raw`<?php
$ts = 1700000000;
echo gmdate("Y-m-d H:i:s", $ts), PHP_EOL;`,
      notes: ["date() would format in the configured default zone; gmdate() is the UTC variant. PHP uses its own letters (Y m d H i s), not strftime codes."],
    },
    "date-to-timestamp": {
      code: String.raw`<?php
$date = new DateTimeImmutable("2023-11-14 22:13:20", new DateTimeZone("UTC"));
echo $date->getTimestamp(), PHP_EOL;`,
      notes: ["The DateTimeZone argument matters: without it the string is read in the default time zone. gmmktime(22, 13, 20, 11, 14, 2023) is the procedural equivalent, with a one-based month."],
    },
    "milliseconds-to-date": {
      code: String.raw`<?php
$ms = 1700000000123;
$date = DateTimeImmutable::createFromFormat("U.v", sprintf("%d.%03d", intdiv($ms, 1000), $ms % 1000));
echo $date->format("Y-m-d H:i:s.v"), PHP_EOL;`,
      notes: ["The U.v format reads seconds and milliseconds. The resulting object's zone is +00:00, so format() prints UTC. Negative milliseconds need the remainder normalised first."],
    },
    "iso-8601-format": {
      code: String.raw`<?php
echo gmdate("Y-m-d\TH:i:s\Z", 1700000000), PHP_EOL;`,
      notes: ["The T and Z are escaped with a backslash so PHP prints them literally; an unescaped Z would insert the zone offset in seconds."],
    },
    "iso-8601-parse": {
      code: String.raw`<?php
$date = new DateTimeImmutable("2023-11-14T23:13:20+01:00");
echo $date->getTimestamp(), PHP_EOL;`,
      notes: ["The constructor throws an Exception on invalid strings, so wrap untrusted input in try/catch."],
    },
  },
  docs: [{ label: "PHP manual: DateTimeImmutable", url: "https://www.php.net/manual/en/class.datetimeimmutable.php" }],
  related: ["javascript", "python", "ruby", "java"],
} satisfies LanguageEntry;

export default language;
