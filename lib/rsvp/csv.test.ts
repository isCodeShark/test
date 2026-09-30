import { describe, expect, it } from "vitest";
import { csvEscape, csvLine, rsvpCsvRow, rsvpTotals } from "./csv";

describe("csvEscape", () => {
  it("leaves plain values alone", () => {
    expect(csvEscape("Aunt Farida")).toBe("Aunt Farida");
    expect(csvEscape(3)).toBe("3");
    expect(csvEscape(null)).toBe("");
  });
  it("quotes commas, quotes and newlines", () => {
    expect(csvEscape('Say "hi", please\nnow')).toBe('"Say ""hi"", please\nnow"');
  });
  it("defuses formula injection", () => {
    expect(csvEscape("=1+1")).toBe("'=1+1");
    expect(csvEscape("+cmd")).toBe("'+cmd");
    expect(csvEscape("-5")).toBe("'-5");
    expect(csvEscape("@x")).toBe("'@x");
  });
});

describe("csvLine / rsvpCsvRow", () => {
  it("joins with commas and CRLF", () => {
    expect(csvLine(["a", "b,c", 1])).toBe('a,"b,c",1\r\n');
  });
  it("formats an RSVP row in the event time zone", () => {
    const line = rsvpCsvRow(
      {
        id: "1",
        site_id: "s",
        name: "Aunt Farida",
        attending: true,
        guests: 3,
        dietary: "No nuts",
        message: "So happy, see you there!",
        created_at: "2026-03-01T13:05:00.000Z",
      },
      "Asia/Dhaka",
    );
    expect(line).toBe('Aunt Farida,Yes,3,No nuts,"So happy, see you there!",2026-03-01 19:05\r\n');
  });
});

describe("rsvpTotals", () => {
  it("counts responses, attending, declined and guests", () => {
    expect(
      rsvpTotals([
        { attending: true, guests: 2 },
        { attending: true, guests: 1 },
        { attending: false, guests: 0 },
      ]),
    ).toEqual({ responses: 3, attending: 2, declined: 1, guests: 3 });
  });
});
