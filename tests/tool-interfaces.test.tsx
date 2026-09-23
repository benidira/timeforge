// @vitest-environment jsdom
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CurrentTimestampTool } from "@/components/tools/current-timestamp-tool";
import { DateToTimestampTool } from "@/components/tools/date-to-timestamp-tool";
import { IsoToUnixTool } from "@/components/tools/iso-to-unix-tool";
import { TimestampDifferenceTool } from "@/components/tools/timestamp-difference-tool";
import { TimestampTool } from "@/components/tools/timestamp-tool";
import { TimezoneConverterTool } from "@/components/tools/timezone-converter-tool";
import { MESSAGES } from "@/lib/time";

afterEach(() => {
  vi.useRealTimers();
  Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
});

/** Value shown next to a label inside the result list. */
function resultValue(label: string): string {
  const dt = screen.getAllByText(label, { selector: "dt" })[0];
  return dt.parentElement!.querySelector("dd")!.textContent ?? "";
}

const type = (label: RegExp | string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const click = (name: RegExp | string) => fireEvent.click(screen.getByRole("button", { name }));

describe("Unix Timestamp Converter", () => {
  it("converts seconds and shows UTC, local time and ISO 8601", () => {
    render(<TimestampTool variant="unix" />);
    type("Unix timestamp", "1790000000");
    click("Convert");
    expect(resultValue("ISO 8601")).toBe("2026-09-21T14:13:20.000Z");
    expect(resultValue("UTC")).toContain("Monday, September 21, 2026");
    expect(resultValue("Local Time (America/New_York)")).toContain("10:13:20 AM");
    expect(screen.getByText("Detected unit: seconds")).toBeInTheDocument();
  });

  it("detects milliseconds automatically", () => {
    render(<TimestampTool variant="unix" />);
    type("Unix timestamp", "1790000000123");
    click("Convert");
    expect(resultValue("ISO 8601")).toBe("2026-09-21T14:13:20.123Z");
    expect(screen.getByText("Detected unit: milliseconds")).toBeInTheDocument();
  });

  it("honours the unit select", () => {
    render(<TimestampTool variant="unix" />);
    type("Unix timestamp", "1790000000");
    fireEvent.change(screen.getByLabelText("Unit"), { target: { value: "milliseconds" } });
    click("Convert");
    expect(resultValue("ISO 8601")).toBe("1970-01-21T17:13:20.000Z");
    expect(screen.getByText("Unit: milliseconds")).toBeInTheDocument();
  });

  it("handles negative timestamps", () => {
    render(<TimestampTool variant="unix" />);
    type("Unix timestamp", "-86400");
    click("Convert");
    expect(resultValue("ISO 8601")).toBe("1969-12-31T00:00:00.000Z");
  });

  it("submits with the Enter key (form submit)", async () => {
    const user = userEvent.setup();
    render(<TimestampTool variant="unix" />);
    await user.type(screen.getByLabelText("Unix timestamp"), "0{Enter}");
    expect(resultValue("ISO 8601")).toBe("1970-01-01T00:00:00.000Z");
  });

  it.each([
    ["abc", MESSAGES.timestamp],
    ["", MESSAGES.timestamp],
    ["1e9", MESSAGES.timestamp],
    ["300000000000000", MESSAGES.range],
    ["1790000000000000000", MESSAGES.tooManyDigits],
  ])("shows a friendly error for %j", (value, message) => {
    render(<TimestampTool variant="unix" />);
    type("Unix timestamp", value);
    click("Convert");
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(message);
    expect(screen.getByLabelText("Unix timestamp")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Unix timestamp")).toHaveAccessibleDescription(message);
    expect(document.body.textContent).not.toMatch(/NaN|Invalid Date|TypeError/);
  });

  it("clears the error after a valid conversion", () => {
    render(<TimestampTool variant="unix" />);
    type("Unix timestamp", "abc");
    click("Convert");
    expect(screen.getByRole("alert")).toBeInTheDocument();
    type("Unix timestamp", "0");
    click("Convert");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("fills in the current timestamp", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-20T12:30:00Z"));
    render(<TimestampTool variant="unix" />);
    click("Current Timestamp");
    expect(screen.getByLabelText("Unix timestamp")).toHaveValue("1789907400");
    expect(resultValue("ISO 8601")).toBe("2026-09-20T12:30:00.000Z");
    expect(resultValue("Relative to now")).toBe("now");
  });

  it("fills in the current timestamp in milliseconds when that unit is chosen", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-20T12:30:00.123Z"));
    render(<TimestampTool variant="unix" />);
    fireEvent.change(screen.getByLabelText("Unit"), { target: { value: "milliseconds" } });
    click("Current Timestamp");
    expect(screen.getByLabelText("Unix timestamp")).toHaveValue("1789907400123");
  });

  it("clears input, unit and results", () => {
    render(<TimestampTool variant="unix" />);
    type("Unix timestamp", "1790000000");
    fireEvent.change(screen.getByLabelText("Unit"), { target: { value: "seconds" } });
    click("Convert");
    click("Clear");
    expect(screen.getByLabelText("Unix timestamp")).toHaveValue("");
    expect(screen.getByLabelText("Unit")).toHaveValue("auto");
    expect(screen.queryByText("Result")).toBeNull();
    expect(screen.getByLabelText("Unix timestamp")).toHaveFocus();
  });

  it("copies a result value", async () => {
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(<TimestampTool variant="unix" />);
    type("Unix timestamp", "1790000000");
    click("Convert");
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy ISO 8601" }));
    });
    expect(writeText).toHaveBeenCalledWith("2026-09-21T14:13:20.000Z");
  });
});

describe("Epoch, Timestamp to Date, Milliseconds and Unix to ISO variants", () => {
  it("epoch shows seconds and milliseconds", () => {
    render(<TimestampTool variant="epoch" />);
    type("Epoch time", "1790000000123");
    click("Convert");
    expect(resultValue("Epoch Seconds")).toBe("1790000000.123");
    expect(resultValue("Epoch Milliseconds")).toBe("1790000000123");
    expect(screen.getByRole("button", { name: "Current Time" })).toBeInTheDocument();
  });

  it("timestamp-to-date shows calendar details", () => {
    render(<TimestampTool variant="toDate" />);
    type("Unix timestamp", String(Date.UTC(2024, 1, 29) / 1000));
    click("Convert to date");
    expect(resultValue("Day of week")).toBe("Thursday");
    expect(resultValue("Day of year")).toBe("60");
    expect(resultValue("Leap year")).toBe("Yes");
    expect(resultValue("ISO week")).toBe("2024-W09");
    expect(screen.getByRole("heading", { name: "Calendar details (UTC date)" })).toBeInTheDocument();
  });

  it("milliseconds-to-date always reads milliseconds and has no unit select", () => {
    render(<TimestampTool variant="ms" />);
    expect(screen.queryByLabelText("Unit")).toBeNull();
    type("Unix timestamp in milliseconds", "999");
    click("Convert");
    expect(resultValue("UTC")).toBe("1970-01-01 00:00:00.999 UTC");
    expect(resultValue("ISO 8601")).toBe("1970-01-01T00:00:00.999Z");
    expect(resultValue("Local Time (America/New_York)")).toBe("1969-12-31 19:00:00.999 (America/New_York)");
    expect(resultValue("Readable Date")).toContain(":00.999");
  });

  it("unix-to-iso-8601 shows UTC and local offset forms", () => {
    render(<TimestampTool variant="toIso" />);
    type("Unix timestamp", "1790000000");
    click("Convert to ISO 8601");
    expect(resultValue("ISO 8601 (UTC)")).toBe("2026-09-21T14:13:20.000Z");
    expect(resultValue("ISO 8601 (America/New_York, with UTC offset)")).toBe("2026-09-21T10:13:20.000-04:00");
  });
});

describe("Date to Timestamp", () => {
  function fill(date: string, time: string, zone: string) {
    type("Date", date);
    type("Time", time);
    fireEvent.change(screen.getByLabelText("Time zone"), { target: { value: zone } });
  }

  it("converts a UTC date", () => {
    render(<DateToTimestampTool />);
    fill("2026-09-20", "12:30:00", "UTC");
    click("Convert to timestamp");
    expect(resultValue("Unix Timestamp (seconds)")).toBe("1789907400");
    expect(resultValue("Unix Timestamp (milliseconds)")).toBe("1789907400000");
    expect(resultValue("ISO 8601 (UTC)")).toBe("2026-09-20T12:30:00.000Z");
  });

  it("uses the local time zone by default and other zones on request", () => {
    render(<DateToTimestampTool />);
    expect(screen.getByLabelText("Time zone")).toHaveValue("local");
    type("Date", "2026-09-20");
    type("Time", "12:00:00");
    click("Convert to timestamp");
    expect(resultValue("Unix Timestamp (seconds)")).toBe("1789920000");
    fillZone("Asia/Tokyo");
    click("Convert to timestamp");
    expect(resultValue("Unix Timestamp (seconds)")).toBe(String(Date.UTC(2026, 8, 20, 3) / 1000));
  });

  function fillZone(zone: string) {
    fireEvent.change(screen.getByLabelText("Time zone"), { target: { value: zone } });
  }

  it("accepts times without seconds", () => {
    render(<DateToTimestampTool />);
    fill("2026-09-20", "12:30", "UTC");
    click("Convert to timestamp");
    expect(resultValue("Unix Timestamp (seconds)")).toBe("1789907400");
  });

  it("explains daylight saving gaps and overlaps", () => {
    render(<DateToTimestampTool />);
    fill("2026-03-08", "02:30:00", "America/New_York");
    click("Convert to timestamp");
    expect(screen.getByRole("alert")).toHaveTextContent(MESSAGES.nonexistent);

    fill("2026-11-01", "01:30:00", "America/New_York");
    click("Convert to timestamp");
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByText(/happens twice/)).toBeInTheDocument();
    expect(resultValue("Unix Timestamp (seconds)")).toBe(String(Date.UTC(2026, 10, 1, 5, 30) / 1000));
  });

  it("rejects missing or impossible dates and times", () => {
    render(<DateToTimestampTool />);
    click("Convert to timestamp");
    expect(screen.getByRole("alert")).toHaveTextContent(MESSAGES.dateTime);
    fill("2023-02-29", "12:00:00", "UTC");
    click("Convert to timestamp");
    expect(screen.getByRole("alert")).toHaveTextContent(MESSAGES.dateTime);
    fill("2026-09-20", "", "UTC");
    click("Convert to timestamp");
    expect(screen.getByRole("alert")).toHaveTextContent(MESSAGES.dateTime);
  });

  it("handles a leap day", () => {
    render(<DateToTimestampTool />);
    fill("2024-02-29", "00:00:00", "UTC");
    click("Convert to timestamp");
    expect(resultValue("ISO 8601 (UTC)")).toBe("2024-02-29T00:00:00.000Z");
  });

  it("uses the current time in the selected zone and clears", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-20T23:30:15Z"));
    render(<DateToTimestampTool />);
    fireEvent.change(screen.getByLabelText("Time zone"), { target: { value: "Asia/Tokyo" } });
    click("Use current time");
    expect(screen.getByLabelText("Date")).toHaveValue("2026-09-21");
    expect(screen.getByLabelText("Time")).toHaveValue("08:30:15");
    expect(resultValue("Unix Timestamp (seconds)")).toBe(String(Date.UTC(2026, 8, 20, 23, 30, 15) / 1000));
    click("Clear");
    expect(screen.getByLabelText("Date")).toHaveValue("");
    expect(screen.queryByText("Result")).toBeNull();
  });
});

describe("Current Unix Timestamp", () => {
  const T0 = new Date("2026-09-20T12:30:00.000Z");

  it("ticks every second, and can pause, resume and refresh", () => {
    vi.useFakeTimers();
    vi.setSystemTime(T0);
    render(<CurrentTimestampTool />);
    expect(screen.getByTestId("clock-Seconds")).toHaveTextContent("\u2014");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByTestId("clock-Seconds")).toHaveTextContent("1789907400");
    expect(screen.getByTestId("clock-Milliseconds")).toHaveTextContent("1789907400000");
    expect(resultValue("ISO 8601")).toBe("2026-09-20T12:30:00.000Z");
    expect(resultValue("UTC")).toContain("September 20, 2026");

    act(() => {
      vi.advanceTimersByTime(1005);
    });
    expect(screen.getByTestId("clock-Seconds")).toHaveTextContent("1789907401");

    click("Pause");
    expect(screen.getByRole("button", { name: "Resume" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Paused. The values are frozen.")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByTestId("clock-Seconds")).toHaveTextContent("1789907401");

    click("Resume");
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByTestId("clock-Seconds")).toHaveTextContent("1789907406");

    // Refresh reads the clock right away.
    vi.setSystemTime(new Date("2026-09-20T12:31:00.000Z"));
    click("Refresh");
    expect(screen.getByTestId("clock-Seconds")).toHaveTextContent("1789907460");
  });

  it("copies seconds and milliseconds", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(T0);
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(<CurrentTimestampTool />);
    expect(screen.getByRole("button", { name: "Copy Seconds" })).toBeDisabled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy Seconds" }));
    });
    expect(writeText).toHaveBeenLastCalledWith("1789907400");
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy Milliseconds" }));
    });
    expect(writeText).toHaveBeenLastCalledWith("1789907400000");
  });

  it("stops its timer when unmounted", () => {
    vi.useFakeTimers();
    vi.setSystemTime(T0);
    const { unmount } = render(<CurrentTimestampTool />);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("ISO 8601 to Unix", () => {
  it("converts UTC and offset strings to the same instant", () => {
    render(<IsoToUnixTool />);
    type("ISO 8601 date and time", "2026-09-20T12:30:00Z");
    click("Convert to Unix");
    expect(resultValue("Unix Seconds")).toBe("1789907400");
    expect(resultValue("Unix Milliseconds")).toBe("1789907400000");
    expect(resultValue("UTC")).toContain("Sunday, September 20, 2026");
    type("ISO 8601 date and time", "2026-09-20T14:30:00+02:00");
    click("Convert to Unix");
    expect(resultValue("Unix Seconds")).toBe("1789907400");
    expect(screen.getByText(/own UTC offset \(\+02:00\)/)).toBeInTheDocument();
  });

  it("keeps fractional seconds", () => {
    render(<IsoToUnixTool />);
    type("ISO 8601 date and time", "2026-09-20T12:30:00.250Z");
    click("Convert to Unix");
    expect(resultValue("Unix Milliseconds")).toBe("1789907400250");
    expect(resultValue("Unix Seconds")).toBe("1789907400");
  });

  it("uses the chosen zone for strings without an offset", () => {
    render(<IsoToUnixTool />);
    type("ISO 8601 date and time", "2026-09-20T12:30:00");
    click("Convert to Unix");
    expect(resultValue("Unix Seconds")).toBe("1789907400");
    expect(screen.getByText(/read as UTC/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Time zone to assume/), { target: { value: "America/New_York" } });
    click("Convert to Unix");
    expect(resultValue("Unix Seconds")).toBe("1789921800");
    expect(screen.getByText(/read as America\/New_York/)).toBeInTheDocument();
  });

  it("treats a date without a time as midnight", () => {
    render(<IsoToUnixTool />);
    type("ISO 8601 date and time", "2026-09-20");
    click("Convert to Unix");
    expect(resultValue("Unix Seconds")).toBe(String(Date.UTC(2026, 8, 20) / 1000));
    expect(screen.getByText(/00:00:00/)).toBeInTheDocument();
  });

  it("uses the example and clears", () => {
    render(<IsoToUnixTool />);
    click("Use example");
    expect(screen.getByLabelText("ISO 8601 date and time")).toHaveValue("2026-09-20T12:30:00Z");
    expect(resultValue("Unix Seconds")).toBe("1789907400");
    click("Clear");
    expect(screen.getByLabelText("ISO 8601 date and time")).toHaveValue("");
    expect(screen.queryByText("Result")).toBeNull();
  });

  it.each(["hello", "", "2026-02-30", "2026-09-20T25:00:00Z", "1790000000"])("rejects %j politely", (value) => {
    render(<IsoToUnixTool />);
    type("ISO 8601 date and time", value);
    click("Convert to Unix");
    expect(screen.getByRole("alert")).toHaveTextContent(MESSAGES.iso);
  });
});

describe("Timezone Converter", () => {
  function convert(date: string, time: string) {
    type("Date", date);
    type("Time", time);
    click("Convert");
  }

  it("converts UTC to New York and shows offsets", () => {
    render(<TimezoneConverterTool />);
    convert("2026-09-20", "12:00:00");
    expect(resultValue("Date and time (24-hour)")).toBe("2026-09-20 08:00:00");
    expect(resultValue("UTC offset")).toBe("UTC-04:00 (EDT)");
    expect(resultValue("Difference between zones")).toBe("New York is 4 hours behind UTC at this moment.");
    expect(resultValue("Unix timestamp (seconds)")).toBe("1789905600");
  });

  it("handles half-hour zones and day rollover", () => {
    render(<TimezoneConverterTool />);
    fireEvent.change(screen.getByLabelText("To"), { target: { value: "Asia/Kolkata" } });
    convert("2026-09-20", "20:00:00");
    expect(resultValue("Date and time (24-hour)")).toBe("2026-09-21 01:30:00");
    expect(resultValue("Difference between zones")).toBe("Kolkata is 5 hours 30 minutes ahead of UTC at this moment.");
  });

  it("uses the daylight saving rules of the chosen date", () => {
    render(<TimezoneConverterTool />);
    convert("2026-01-15", "12:00:00");
    expect(resultValue("Date and time (24-hour)")).toBe("2026-01-15 07:00:00");
    expect(resultValue("UTC offset")).toBe("UTC-05:00 (EST)");
  });

  it("reports the same offset", () => {
    render(<TimezoneConverterTool />);
    fireEvent.change(screen.getByLabelText("To"), { target: { value: "UTC" } });
    convert("2026-09-20", "12:00:00");
    expect(resultValue("Difference between zones")).toMatch(/same UTC offset/);
  });

  it("compares the default cities and lets you add and remove zones", () => {
    render(<TimezoneConverterTool />);
    convert("2026-09-20", "12:00:00");
    const table = screen.getByRole("table");
    const rows = () => within(table).getAllByRole("row").slice(1);
    expect(rows().map((r) => within(r).getAllByRole("rowheader")[0].textContent)).toEqual([
      "UTCUTC",
      "New YorkAmerica/New_York",
      "LondonEurope/London",
      "ParisEurope/Paris",
      "DubaiAsia/Dubai",
      "TokyoAsia/Tokyo",
      "AlgiersAfrica/Algiers",
    ]);
    const cells = (name: string) => within(rows().find((r) => r.textContent!.includes(name))!).getAllByRole("cell").map((c) => c.textContent);
    expect(cells("Tokyo")[0]).toBe("2026-09-20 21:00:00");
    expect(cells("Tokyo")[1]).toBe("UTC+09:00");
    expect(cells("Algiers")[0]).toBe("2026-09-20 13:00:00");
    expect(cells("London")[0]).toBe("2026-09-20 13:00:00");
    expect(cells("Dubai")[1]).toBe("UTC+04:00");

    fireEvent.click(screen.getByRole("button", { name: "Remove Tokyo" }));
    expect(rows()).toHaveLength(6);

    fireEvent.change(screen.getByLabelText("Add a time zone"), { target: { value: "Asia/Kolkata" } });
    click("Add zone");
    expect(rows()).toHaveLength(7);
    expect(cells("Kolkata")[0]).toBe("2026-09-20 17:30:00");
    click("Add zone"); // adding twice does not duplicate
    expect(rows()).toHaveLength(7);
  });

  it("swaps zones and keeps the same moment", () => {
    render(<TimezoneConverterTool />);
    convert("2026-09-20", "12:00:00");
    click("Swap zones");
    expect(screen.getByLabelText("From")).toHaveValue("America/New_York");
    expect(screen.getByLabelText("To")).toHaveValue("UTC");
    expect(screen.getByLabelText("Date")).toHaveValue("2026-09-20");
    expect(screen.getByLabelText("Time")).toHaveValue("08:00:00");
    expect(resultValue("Date and time (24-hour)")).toBe("2026-09-20 12:00:00");
  });

  it("reports daylight saving gaps, overlaps and bad input", () => {
    render(<TimezoneConverterTool />);
    fireEvent.change(screen.getByLabelText("From"), { target: { value: "America/New_York" } });
    convert("2026-03-08", "02:30:00");
    expect(screen.getByRole("alert")).toHaveTextContent(MESSAGES.nonexistent);
    expect(screen.queryByRole("table")).toBeNull();

    convert("2026-11-01", "01:30:00");
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByText(/happens twice/)).toBeInTheDocument();

    convert("", "12:00:00");
    expect(screen.getByRole("alert")).toHaveTextContent(MESSAGES.dateTime);
  });

  it("uses the current time and clears", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-20T12:00:05Z"));
    render(<TimezoneConverterTool />);
    click("Use current time");
    expect(screen.getByLabelText("Date")).toHaveValue("2026-09-20");
    expect(screen.getByLabelText("Time")).toHaveValue("12:00:05");
    expect(resultValue("Date and time (24-hour)")).toBe("2026-09-20 08:00:05");
    click("Clear");
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.getByLabelText("To")).toHaveValue("America/New_York");
  });
});

describe("Timestamp Difference", () => {
  const fillBoth = (a: string, b: string) => {
    type("Timestamp A", a);
    type("Timestamp B", b);
  };

  it("calculates the documented example", () => {
    render(<TimestampDifferenceTool />);
    fillBoth("1790000000", "1790187950");
    click("Calculate difference");
    expect(resultValue("Human-readable duration")).toBe("2 days 4 hours 12 minutes 30 seconds");
    expect(resultValue("Milliseconds")).toBe("187950000");
    expect(resultValue("Seconds")).toBe("187950");
    expect(resultValue("Minutes")).toBe("3132.5");
    expect(resultValue("Hours")).toBe("52.208333");
    expect(resultValue("Days")).toBe("2.175347");
    expect(screen.getByText("Timestamp B is 2 days 4 hours 12 minutes 30 seconds after Timestamp A.")).toBeInTheDocument();
  });

  it("swaps A and B and updates the direction", () => {
    render(<TimestampDifferenceTool />);
    fillBoth("1790000000", "1790187950");
    click("Calculate difference");
    click("Swap A and B");
    expect(screen.getByLabelText("Timestamp A")).toHaveValue("1790187950");
    expect(screen.getByText(/before Timestamp A/)).toBeInTheDocument();
    expect(resultValue("Signed difference, B minus A (milliseconds)")).toBe("-187950000");
    expect(resultValue("Milliseconds")).toBe("187950000");
  });

  it("mixes seconds and milliseconds", () => {
    render(<TimestampDifferenceTool />);
    fillBoth("1790000000", "1790000000500");
    click("Calculate difference");
    expect(resultValue("Human-readable duration")).toBe("500 milliseconds");
  });

  it("handles equal and negative timestamps", () => {
    render(<TimestampDifferenceTool />);
    fillBoth("-86400", "86400");
    click("Calculate difference");
    expect(resultValue("Human-readable duration")).toBe("2 days");
    fillBoth("5", "5");
    click("Calculate difference");
    expect(screen.getByText("Both timestamps are the same moment.")).toBeInTheDocument();
  });

  it("validates each field separately", () => {
    render(<TimestampDifferenceTool />);
    fillBoth("abc", "1790000000");
    click("Calculate difference");
    const alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toHaveTextContent(`Timestamp A: ${MESSAGES.timestamp}`);
    expect(screen.getByLabelText("Timestamp A")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Timestamp B")).toHaveAttribute("aria-invalid", "false");
    fillBoth("", "");
    click("Calculate difference");
    expect(screen.getAllByRole("alert")).toHaveLength(2);
  });

  it("fills in the current time and clears", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-20T12:30:00Z"));
    render(<TimestampDifferenceTool />);
    fireEvent.click(screen.getByRole("button", { name: "Use current time for Timestamp B" }));
    expect(screen.getByLabelText("Timestamp B")).toHaveValue("1789907400");
    click("Clear");
    expect(screen.getByLabelText("Timestamp B")).toHaveValue("");
  });
});
