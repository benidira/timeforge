import type { LanguageEntry } from "../types";

const language = {
  slug: "java",
  name: "Java",
  kind: "language",
  precision: "ns",
  y2038: "no",
  negative: "no",
  runner: "java Main.java",
  facts: {
    y2038: {
      title: "No Year 2038 problem",
      body: "System.currentTimeMillis() and java.time.Instant use 64-bit values. Instant covers -1000000000-01-01 to +1000000000-12-31, far beyond 2038.",
    },
    negative: {
      title: "Dates before 1970 work",
      body: "Instant.ofEpochSecond(-1) is 1969-12-31T23:59:59Z. Negative seconds and the nanosecond adjustment are normalised for you.",
    },
    precision: {
      title: "Instant has nanosecond fields, the clock decides the resolution",
      body: "Instant stores seconds plus nanoseconds. Instant.now() resolution depends on the JDK and OS: typically microseconds on JDK 9+ and milliseconds on JDK 8. getEpochSecond() and toEpochMilli() give the common units.",
    },
    timezone: {
      title: "Prefer java.time over java.util.Date",
      body: "Instant is a point on the UTC timeline. The legacy java.util.Date and SimpleDateFormat use the JVM default zone and SimpleDateFormat is not thread-safe. With java.time always pass an explicit ZoneOffset or ZoneId.",
    },
    parsing: {
      title: "Instant.parse and offsets depend on the Java version",
      body: "On Java 11 Instant.parse only accepts the Z form and throws DateTimeParseException for +01:00. Java 12+ accepts offsets. OffsetDateTime.parse works on every version since Java 8.",
    },
  },
  tasks: {
    "get-current-timestamp": {
      code: String.raw`import java.time.Instant;

public class Main {
    public static void main(String[] args) {
        System.out.println(Instant.now().getEpochSecond());
    }
}`,
      notes: ["System.currentTimeMillis() / 1000 gives the same value; Instant is clearer about units."],
    },
    "timestamp-to-date": {
      code: String.raw`import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

public class Main {
    public static void main(String[] args) {
        Instant instant = Instant.ofEpochSecond(1700000000L);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss").withZone(ZoneOffset.UTC);
        System.out.println(fmt.format(instant));
    }
}`,
      notes: [
        "A DateTimeFormatter cannot format an Instant without a zone; withZone(ZoneOffset.UTC) is required or it throws UnsupportedTemporalTypeException.",
        "Use the long literal 1700000000L; values past 2147483647 do not fit an int.",
      ],
    },
    "date-to-timestamp": {
      code: String.raw`import java.time.LocalDateTime;
import java.time.ZoneOffset;

public class Main {
    public static void main(String[] args) {
        LocalDateTime date = LocalDateTime.of(2023, 11, 14, 22, 13, 20);
        System.out.println(date.toEpochSecond(ZoneOffset.UTC));
    }
}`,
      notes: ["LocalDateTime has no zone, so the toEpochSecond(ZoneOffset) argument is what declares the fields to be UTC. Months are one-based here."],
    },
    "milliseconds-to-date": {
      code: String.raw`import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

public class Main {
    public static void main(String[] args) {
        Instant instant = Instant.ofEpochMilli(1700000000123L);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS").withZone(ZoneOffset.UTC);
        System.out.println(fmt.format(instant));
    }
}`,
      notes: ["Instant.ofEpochMilli takes a long and handles negative values correctly. In the pattern, SSS is fraction-of-second, while lowercase sss would be invalid."],
    },
    "iso-8601-format": {
      code: String.raw`import java.time.Instant;

public class Main {
    public static void main(String[] args) {
        System.out.println(Instant.ofEpochSecond(1700000000L).toString());
    }
}`,
      notes: ["Instant.toString() is already ISO 8601 in UTC with a Z suffix. It prints fractional seconds only when they are non-zero."],
    },
    "iso-8601-parse": {
      code: String.raw`import java.time.OffsetDateTime;

public class Main {
    public static void main(String[] args) {
        OffsetDateTime odt = OffsetDateTime.parse("2023-11-14T23:13:20+01:00");
        System.out.println(odt.toEpochSecond());
    }
}`,
      notes: ["OffsetDateTime.parse works on every Java version since 8. Instant.parse with this exact string fails on Java 11."],
    },
  },
  docs: [
    { label: "Java SE: java.time package", url: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/time/package-summary.html" },
  ],
  related: ["kotlin", "csharp", "javascript", "python"],
} satisfies LanguageEntry;

export default language;
