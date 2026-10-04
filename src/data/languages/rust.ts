import type { LanguageEntry } from "../types";

const language = {
  slug: "rust",
  name: "Rust",
  kind: "language",
  precision: "ns",
  y2038: "platform",
  negative: "platform",
  runner: "cargo run (with chrono)",
  facts: {
    y2038: {
      title: "std follows the platform, chrono uses i64",
      body: "std::time::SystemTime wraps the operating system's timespec, so a target with a 32-bit time_t inherits the 2038 limit. The chrono crate stores seconds as an i64 on every target.",
    },
    negative: {
      title: "duration_since(UNIX_EPOCH) fails before 1970",
      body: "SystemTime::duration_since(UNIX_EPOCH) returns Err(SystemTimeError) for times before the epoch because Duration cannot be negative. chrono's timestamp() returns a signed i64 and handles them.",
    },
    precision: {
      title: "Duration has separate accessors for each unit",
      body: "as_secs() returns u64 seconds, as_millis() returns u128 milliseconds and as_nanos() returns u128 nanoseconds. Cast carefully when you need an i64 for a database column.",
    },
    timezone: {
      title: "The standard library has no time zone support",
      body: "std only knows about SystemTime. chrono provides Utc and FixedOffset, chrono-tz adds IANA zones, and the time and jiff crates are alternatives with their own APIs.",
    },
    parsing: {
      title: "Parsers are strict about the format",
      body: "chrono::DateTime::parse_from_rfc3339 accepts only RFC 3339 and returns Result. NaiveDateTime::parse_from_str takes a strftime-style format but produces a value with no zone that you must attach yourself.",
    },
  },
  tasks: {
    "get-current-timestamp": {
      code: String.raw`use std::time::{SystemTime, UNIX_EPOCH};

fn main() {
    let secs = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
    println!("{}", secs);
}`,
      notes: ["unwrap() panics only if the system clock is set before 1970, which is a configuration error worth surfacing."],
    },
    "timestamp-to-date": {
      code: String.raw`use chrono::DateTime;

fn main() {
    let dt = DateTime::from_timestamp(1700000000, 0).unwrap();
    println!("{}", dt.format("%Y-%m-%d %H:%M:%S"));
}`,
      needs: ['chrono = "0.4"'],
      notes: ["DateTime::from_timestamp returns an Option, and None means the value is out of chrono's supported range. It is available from chrono 0.4.31; older versions use NaiveDateTime::from_timestamp_opt."],
    },
    "date-to-timestamp": {
      code: String.raw`use chrono::NaiveDate;

fn main() {
    let ts = NaiveDate::from_ymd_opt(2023, 11, 14)
        .unwrap()
        .and_hms_opt(22, 13, 20)
        .unwrap()
        .and_utc()
        .timestamp();
    println!("{}", ts);
}`,
      needs: ['chrono = "0.4"'],
      notes: ["Every constructor returns an Option because invalid dates such as February 30 are rejected. and_utc() (chrono 0.4.31+) is what declares the naive fields to be UTC."],
    },
    "milliseconds-to-date": {
      code: String.raw`use chrono::DateTime;

fn main() {
    let dt = DateTime::from_timestamp_millis(1700000000123).unwrap();
    println!("{}", dt.format("%Y-%m-%d %H:%M:%S%.3f"));
}`,
      needs: ['chrono = "0.4"'],
      notes: ["%.3f prints exactly three fractional digits, including the leading dot."],
    },
    "iso-8601-format": {
      code: String.raw`use chrono::{DateTime, SecondsFormat};

fn main() {
    let dt = DateTime::from_timestamp(1700000000, 0).unwrap();
    println!("{}", dt.to_rfc3339_opts(SecondsFormat::Secs, true));
}`,
      needs: ['chrono = "0.4"'],
      notes: ["The second argument (true) chooses Z instead of +00:00 for UTC. to_rfc3339() alone would print +00:00."],
    },
    "iso-8601-parse": {
      code: String.raw`use chrono::DateTime;

fn main() {
    let dt = DateTime::parse_from_rfc3339("2023-11-14T23:13:20+01:00").unwrap();
    println!("{}", dt.timestamp());
}`,
      needs: ['chrono = "0.4"'],
      notes: ["parse_from_rfc3339 keeps the original offset in the returned DateTime<FixedOffset>, and timestamp() is always the UTC-based epoch value."],
    },
  },
  docs: [
    { label: "std::time", url: "https://doc.rust-lang.org/std/time/index.html" },
    { label: "chrono crate", url: "https://docs.rs/chrono" },
  ],
  related: ["go", "cpp", "c", "java"],
} satisfies LanguageEntry;

export default language;
