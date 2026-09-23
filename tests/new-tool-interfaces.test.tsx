// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AddTimeCalculator, SubtractTimeCalculator } from "./helpers/shift-time-wrappers";
import { BatchConverterTool } from "@/components/tools/batch-converter-tool";
import { BusinessHoursTool } from "@/components/tools/business-hours-tool";
import { CronGeneratorTool } from "@/components/tools/cron-generator-tool";
import { DateDifferenceTool } from "@/components/tools/date-difference-tool";
import { DateFormatConverterTool } from "@/components/tools/date-format-converter-tool";
import { Iso8601ConverterTool } from "@/components/tools/iso8601-converter-tool";
import { Rfc3339Tool } from "@/components/tools/rfc3339-tool";
import { TimeDurationTool } from "@/components/tools/time-duration-tool";
import { TimezoneOffsetTool } from "@/components/tools/timezone-offset-tool";
import { UnixValidatorTool } from "@/components/tools/unix-validator-tool";
import { UtcConverterTool } from "@/components/tools/utc-converter-tool";
import { WorldClockTool } from "@/components/tools/world-clock-tool";

afterEach(() => {
  vi.useRealTimers();
});

const type = (label: RegExp | string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const click = (name: RegExp | string) => fireEvent.click(screen.getByRole("button", { name }));

function resultValue(label: string): string {
  const dt = screen.getAllByText(label, { selector: "dt" })[0];
  return dt.parentElement!.querySelector("dd")!.textContent ?? "";
}

describe("Date Difference Calculator", () => {
  it("is zero for the same date", () => {
    render(<DateDifferenceTool />);
    type("Start date and time date", "2026-09-21");
    type("End date and time date", "2026-09-21");
    click("Calculate difference");
    expect(resultValue("Total days")).toBe("0");
    expect(resultValue("Breakdown")).toBe("0 seconds");
  });

  it("handles a leap year crossing", () => {
    render(<DateDifferenceTool />);
    type("Start date and time date", "2024-02-28");
    type("End date and time date", "2024-03-01");
    click("Calculate difference");
    expect(resultValue("Total days")).toBe("2");
  });

  it("crosses a month boundary", () => {
    render(<DateDifferenceTool />);
    type("Start date and time date", "2026-01-31");
    type("End date and time date", "2026-03-01");
    click("Calculate difference");
    expect(resultValue("Total days")).toBe("29");
  });

  it("crosses a year boundary", () => {
    render(<DateDifferenceTool />);
    type("Start date and time date", "2025-12-31");
    type("End date and time date", "2026-01-01");
    click("Calculate difference");
    expect(resultValue("Total days")).toBe("1");
  });

  it("swaps a negative order and says so", () => {
    render(<DateDifferenceTool />);
    type("Start date and time date", "2026-09-21");
    type("End date and time date", "2026-01-01");
    click("Calculate difference");
    expect(screen.getByText(/swapped/)).toBeInTheDocument();
    expect(resultValue("Total days")).toBe("263");
  });
});

describe("Time Duration Calculator", () => {
  it("computes a same-day duration", () => {
    render(<TimeDurationTool />);
    type("Start time", "09:00:00");
    type("End time", "17:00:00");
    click("Calculate");
    expect(screen.getByText("8 hours")).toBeInTheDocument();
  });

  it("crosses midnight: 23:30 to 01:15 is 1 hour 45 minutes", () => {
    render(<TimeDurationTool />);
    type("Start time", "23:30:00");
    type("End time", "01:15:00");
    click("Calculate");
    expect(screen.getByText("1 hour 45 minutes")).toBeInTheDocument();
    expect(screen.getByText(/next day/)).toBeInTheDocument();
  });

  it("gives exactly 24 hours for equal times with 1 extra day", () => {
    render(<TimeDurationTool />);
    type("Start time", "09:00:00");
    type("End time", "09:00:00");
    fireEvent.change(screen.getByLabelText("Extra whole days"), { target: { value: "1" } });
    click("Calculate");
    expect(resultValue("Hours")).toBe("24");
  });

  it("supports multiple days", () => {
    render(<TimeDurationTool />);
    type("Start time", "22:00:00");
    type("End time", "06:00:00");
    fireEvent.change(screen.getByLabelText("Extra whole days"), { target: { value: "2" } });
    click("Calculate");
    expect(resultValue("Hours")).toBe("56");
  });
});

describe("Add / Subtract Time Calculator", () => {
  it("adds a week, keeping the clock time", () => {
    render(<AddTimeCalculator />);
    type("Date", "2026-09-21");
    type("Time", "12:00:00");
    fireEvent.change(screen.getByLabelText("Time zone"), { target: { value: "UTC" } });
    fireEvent.change(screen.getByLabelText("Amount to add"), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("Unit"), { target: { value: "weeks" } });
    click("Add time");
    expect(resultValue("UTC")).toContain("September 28, 2026");
  });

  it("subtracts 90 days across a year boundary", () => {
    render(<SubtractTimeCalculator />);
    type("Date", "2026-01-15");
    type("Time", "00:00:00");
    fireEvent.change(screen.getByLabelText("Time zone"), { target: { value: "UTC" } });
    fireEvent.change(screen.getByLabelText("Amount to subtract"), { target: { value: "90" } });
    fireEvent.change(screen.getByLabelText("Unit"), { target: { value: "days" } });
    click("Subtract time");
    expect(resultValue("ISO 8601")).toBe("2025-10-17T00:00:00.000Z");
  });

  it("rejects a negative amount", () => {
    render(<AddTimeCalculator />);
    type("Date", "2026-09-21");
    fireEvent.change(screen.getByLabelText("Amount to add"), { target: { value: "-5" } });
    click("Add time");
    expect(screen.getByRole("alert")).toHaveTextContent(/positive duration/);
  });
});

describe("Unix Timestamp Validator", () => {
  it("accepts a valid seconds timestamp", () => {
    render(<UnixValidatorTool />);
    type("Value to check", "1790000000");
    click("Validate");
    expect(screen.getByText("Valid")).toBeInTheDocument();
  });

  it("accepts a valid milliseconds timestamp", () => {
    render(<UnixValidatorTool />);
    type("Value to check", "1790000000123");
    click("Validate");
    expect(screen.getByText("Valid")).toBeInTheDocument();
    expect(screen.getByText("milliseconds")).toBeInTheDocument();
  });

  it("rejects non-numeric text with a specific reason", () => {
    render(<UnixValidatorTool />);
    type("Value to check", "not a timestamp");
    click("Validate");
    expect(screen.getByText("Invalid")).toBeInTheDocument();
    expect(screen.getByText(/is not a Unix timestamp/)).toBeInTheDocument();
  });

  it("accepts a negative timestamp with a note", () => {
    render(<UnixValidatorTool />);
    fireEvent.change(screen.getByLabelText("Value to check"), { target: { value: "-86400" } });
    fireEvent.change(screen.getByLabelText("Unit"), { target: { value: "seconds" } });
    click("Validate");
    expect(screen.getByText("Valid")).toBeInTheDocument();
    expect(screen.getByText(/before 1 January 1970/)).toBeInTheDocument();
  });

  it("flags an out-of-range boundary value", () => {
    render(<UnixValidatorTool />);
    fireEvent.change(screen.getByLabelText("Value to check"), { target: { value: "999999999999" } });
    fireEvent.change(screen.getByLabelText("Unit"), { target: { value: "seconds" } });
    click("Validate");
    expect(screen.getByText("Invalid")).toBeInTheDocument();
  });
});

describe("Unix Timestamp Batch Converter", () => {
  it("converts multiple values and skips blank lines", () => {
    render(<BatchConverterTool />);
    fireEvent.change(screen.getByLabelText("Timestamps, one per line"), {
      target: { value: "0\n\n86400\n   \n1790000000" },
    });
    fireEvent.change(screen.getByLabelText("Unit"), { target: { value: "seconds" } });
    click("Convert all");
    expect(screen.getByText(/3 valid/)).toBeInTheDocument();
  });

  it("reports invalid lines without dropping the valid ones", () => {
    render(<BatchConverterTool />);
    fireEvent.change(screen.getByLabelText("Timestamps, one per line"), {
      target: { value: "0\nnot-a-number\n86400" },
    });
    fireEvent.change(screen.getByLabelText("Unit"), { target: { value: "seconds" } });
    click("Convert all");
    expect(screen.getByText(/2 valid, 1 invalid/)).toBeInTheDocument();
  });

  it("auto-detects mixed units per line", () => {
    render(<BatchConverterTool />);
    fireEvent.change(screen.getByLabelText("Timestamps, one per line"), {
      target: { value: "1790000000\n1790000000000" },
    });
    click("Convert all");
    expect(screen.getByText(/2 valid/)).toBeInTheDocument();
  });
});

describe("Cron Expression Generator", () => {
  it("builds common presets", () => {
    render(<CronGeneratorTool />);
    click("Every minute");
    expect(screen.getByText("* * * * *")).toBeInTheDocument();
    expect(screen.getAllByText("Every minute").length).toBeGreaterThanOrEqual(2); // preset button + description
  });

  it("shows a clear error for an invalid custom expression", () => {
    render(<CronGeneratorTool />);
    click("Custom");
    fireEvent.change(screen.getByLabelText("Cron expression"), { target: { value: "60 * * * *" } });
    expect(screen.getByRole("alert")).toHaveTextContent(/out of range/);
  });

  it("generates a weekly expression from selected weekdays", () => {
    render(<CronGeneratorTool />);
    click("Weekly");
    fireEvent.click(screen.getByRole("button", { name: "Wed" }));
    expect(screen.getByText("0 9 * * 1,3")).toBeInTheDocument();
  });
});

describe("UTC Converter", () => {
  it("converts a positive-offset local time to UTC", () => {
    render(<UtcConverterTool />);
    type("Time zone of the date and time below", "Asia/Kolkata");
    type("Date", "2026-09-21");
    type("Time", "18:00:00");
    click("Convert to UTC");
    expect(resultValue("UTC")).toContain("12:30:00 PM");
  });

  it("converts a negative-offset local time to UTC", () => {
    render(<UtcConverterTool />);
    type("Time zone of the date and time below", "America/New_York");
    type("Date", "2026-09-21");
    type("Time", "08:00:00");
    click("Convert to UTC");
    expect(resultValue("UTC")).toContain("12:00:00 PM");
  });

  it("leaves UTC input unchanged", () => {
    render(<UtcConverterTool />);
    type("Time zone of the date and time below", "UTC");
    type("Date", "2026-09-21");
    type("Time", "12:00:00");
    click("Convert to UTC");
    expect(resultValue("UTC")).toContain("12:00:00 PM");
  });

  it("applies daylight saving time for the date entered", () => {
    render(<UtcConverterTool />);
    type("Time zone of the date and time below", "America/New_York");
    // Winter: EST is UTC-5
    type("Date", "2026-01-15");
    type("Time", "08:00:00");
    click("Convert to UTC");
    expect(resultValue("UTC")).toContain("1:00:00 PM");
  });
});

describe("RFC 3339 Converter", () => {
  it("parses an RFC 3339 timestamp to Unix time", () => {
    render(<Rfc3339Tool />);
    type("RFC 3339 timestamp", "2026-09-20T12:30:00Z");
    click("Convert to Unix");
    expect(resultValue("Unix seconds")).toBe("1789907400");
  });

  it("builds RFC 3339 from a Unix timestamp", () => {
    render(<Rfc3339Tool />);
    type("Unix timestamp", "1789907400");
    click("Convert to RFC 3339");
    expect(resultValue("RFC 3339 (UTC)")).toBe("2026-09-20T12:30:00Z");
  });
});

describe("ISO 8601 Converter", () => {
  it("exposes both conversion directions", () => {
    render(<Iso8601ConverterTool />);
    expect(screen.getByLabelText("ISO 8601 date and time")).toBeInTheDocument();
    expect(screen.getByLabelText("Unix timestamp")).toBeInTheDocument();
  });
});

describe("Date Format Converter", () => {
  it("detects an RFC 2822 date and shows every other format", () => {
    render(<DateFormatConverterTool />);
    type("Date, in any supported format", "Mon, 21 Sep 2026 14:13:20 +0000");
    click("Detect and convert");
    expect(screen.getByText(/Detected as RFC 2822/)).toBeInTheDocument();
    expect(resultValue("ISO 8601")).toBe("2026-09-21T14:13:20.000Z");
    expect(resultValue("Unix seconds")).toBe("1790000000");
  });
});

describe("Time Zone Offset Calculator", () => {
  it("shows both offsets and the difference between them", () => {
    render(<TimezoneOffsetTool />);
    const selects = screen.getAllByLabelText(/^Time zone [AB]$/);
    fireEvent.change(selects[0], { target: { value: "UTC" } });
    fireEvent.change(selects[1], { target: { value: "Asia/Kolkata" } });
    type("Date", "2026-09-21");
    click("Compare");
    expect(resultValue("UTC offset")).toBe("UTC");
    expect(resultValue("Kolkata offset")).toBe("UTC+05:30");
  });
});

describe("World Clock", () => {
  it("shows the default cities as live cards", async () => {
    render(<WorldClockTool />);
    const cards = await screen.findAllByTestId("world-clock-card");
    expect(cards.length).toBeGreaterThanOrEqual(9);
    expect(screen.getByText("New York")).toBeInTheDocument();
  });

  it("adds and removes a city", async () => {
    render(<WorldClockTool />);
    const before = (await screen.findAllByTestId("world-clock-card")).length;
    click("Add city");
    expect(screen.getAllByTestId("world-clock-card").length).toBe(before + 1);
    fireEvent.click(screen.getAllByRole("button", { name: "Remove" })[0]);
    expect(screen.getAllByTestId("world-clock-card").length).toBe(before);
  });
});

describe("Business Hours Converter", () => {
  it("finds the overlap between two teams' hours", () => {
    render(<BusinessHoursTool />);
    type("Date to compare on", "2026-09-21");
    click("Compare hours");
    expect(screen.getByText(/Overlap:/)).toBeInTheDocument();
  });

  it("reports no overlap when hours never coincide", () => {
    render(<BusinessHoursTool />);
    const zoneSelects = screen.getAllByLabelText("Time zone");
    fireEvent.change(zoneSelects[0], { target: { value: "America/Los_Angeles" } });
    fireEvent.change(zoneSelects[1], { target: { value: "Asia/Tokyo" } });
    const startInputs = screen.getAllByLabelText("Start");
    const endInputs = screen.getAllByLabelText("End");
    fireEvent.change(startInputs[0], { target: { value: "09:00" } });
    fireEvent.change(endInputs[0], { target: { value: "12:00" } });
    fireEvent.change(startInputs[1], { target: { value: "09:00" } });
    fireEvent.change(endInputs[1], { target: { value: "12:00" } });
    type("Date to compare on", "2026-09-21");
    click("Compare hours");
    expect(screen.getByText(/No overlap/)).toBeInTheDocument();
  });
});
