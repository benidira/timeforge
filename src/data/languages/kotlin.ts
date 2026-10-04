import type { LanguageEntry } from "../types";

const language = {
  slug: "kotlin",
  name: "Kotlin",
  kind: "language",
  precision: "ns",
  y2038: "no",
  negative: "no",
  runner: "kotlinc file.kt -include-runtime -d out.jar && java -jar out.jar",
  facts: {
    y2038: {
      title: "No Year 2038 problem on the JVM",
      body: "Kotlin/JVM uses java.time, whose Instant covers -1000000000-01-01 to +1000000000-12-31 with 64-bit seconds. The 32-bit overflow does not apply.",
    },
    negative: {
      title: "Dates before 1970 work",
      body: "Instant.ofEpochSecond(-1) is 1969-12-31T23:59:59Z. Negative seconds are normalised by java.time.",
    },
    precision: {
      title: "Milliseconds from System, finer from Instant",
      body: "System.currentTimeMillis() returns milliseconds. Instant.now() can be microsecond-accurate on JDK 9+, and getEpochSecond / toEpochMilli give the common units.",
    },
    timezone: {
      title: "Use java.time, not java.util.Date",
      body: "Instant is a UTC point on the timeline, while java.util.Date and SimpleDateFormat use the JVM default zone. For Kotlin Multiplatform code kotlinx-datetime offers a similar Instant API.",
    },
    parsing: {
      title: "Instant.parse and offsets depend on the JDK",
      body: "Older JDKs (11 and below) accept only the Z form in Instant.parse and throw for +01:00. OffsetDateTime.parse works everywhere.",
    },
  },
  tasks: {
    "get-current-timestamp": {
      code: String.raw`import java.time.Instant

fun main() {
    println(Instant.now().epochSecond)
}`,
      notes: ["epochSecond is Kotlin's property syntax for getEpochSecond()."],
    },
    "timestamp-to-date": {
      code: String.raw`import java.time.Instant
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter

fun main() {
    val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss").withZone(ZoneOffset.UTC)
    println(formatter.format(Instant.ofEpochSecond(1700000000)))
}`,
      notes: ["Formatting an Instant requires withZone(...) or the formatter throws UnsupportedTemporalTypeException."],
    },
    "date-to-timestamp": {
      code: String.raw`import java.time.LocalDateTime
import java.time.ZoneOffset

fun main() {
    val date = LocalDateTime.of(2023, 11, 14, 22, 13, 20)
    println(date.toEpochSecond(ZoneOffset.UTC))
}`,
      notes: ["The ZoneOffset.UTC argument declares the local fields to be UTC. Months are one-based."],
    },
    "milliseconds-to-date": {
      code: String.raw`import java.time.Instant
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter

fun main() {
    val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS").withZone(ZoneOffset.UTC)
    println(formatter.format(Instant.ofEpochMilli(1700000000123)))
}`,
      notes: ["Kotlin infers 1700000000123 as a Long because it exceeds the Int range, so no L suffix is needed."],
    },
    "iso-8601-format": {
      code: String.raw`import java.time.Instant

fun main() {
    println(Instant.ofEpochSecond(1700000000).toString())
}`,
      notes: ["Instant.toString() is ISO 8601 in UTC with a Z suffix and omits the fraction when it is zero."],
    },
    "iso-8601-parse": {
      code: String.raw`import java.time.OffsetDateTime

fun main() {
    println(OffsetDateTime.parse("2023-11-14T23:13:20+01:00").toEpochSecond())
}`,
      notes: ["toEpochSecond() is exposed to Kotlin as a method call, while Instant's epochSecond is a property."],
    },
  },
  docs: [{ label: "Kotlin docs", url: "https://kotlinlang.org/docs/home.html" }],
  related: ["java", "swift", "csharp", "javascript"],
} satisfies LanguageEntry;

export default language;
