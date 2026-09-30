import { describe, expect, it } from "vitest";
import { buildIcs, escapeText, foldLine, formatUtc } from "./build-ics";

describe("formatUtc", () => {
  it("formats as basic ISO in UTC", () => {
    expect(formatUtc(new Date("2026-04-03T13:00:00.000Z"))).toBe("20260403T130000Z");
  });
});

describe("escapeText", () => {
  it("escapes backslash, semicolon, comma and newlines", () => {
    expect(escapeText("a\\b;c,d\ne\r\nf")).toBe("a\\\\b\\;c\\,d\\ne\\nf");
  });
});

describe("foldLine", () => {
  it("leaves short lines alone", () => {
    expect(foldLine("SUMMARY:Hi")).toBe("SUMMARY:Hi");
  });
  it("folds at 75 octets with a leading space", () => {
    const long = "DESCRIPTION:" + "x".repeat(200);
    const folded = foldLine(long);
    const physical = folded.split("\r\n");
    expect(physical.length).toBe(3);
    expect(physical[0].length).toBe(75);
    expect(physical[1].startsWith(" ")).toBe(true);
    expect(physical[1].length).toBe(75);
    expect(physical.join("").replace(/\r\n /g, "")).toBe(long.slice(0, 75) + " " + long.slice(75, 149) + " " + long.slice(149));
  });
  it("never splits a multi-byte character", () => {
    const line = "SUMMARY:" + "﷽".repeat(40); // 3 bytes each
    const folded = foldLine(line);
    for (const physical of folded.split("\r\n")) {
      expect(new TextEncoder().encode(physical).length).toBeLessThanOrEqual(75);
    }
    expect(folded.replace(/\r\n /g, "")).toBe(line);
  });
});

describe("buildIcs", () => {
  it("produces a complete VCALENDAR with CRLF endings", () => {
    const ics = buildIcs({
      uid: "site-1@invites.example.com",
      title: "Akhd of Rafid & Shanice",
      description: "Kindly join us, with love.\nSee you there",
      location: "Dhaka Regency Hotel, Airport Road | Nikunjo 2, Dhaka",
      url: "https://invites.example.com/rafid-and-shanice",
      startsAt: "2026-04-03T13:00:00.000Z",
      durationMinutes: 180,
      dtstamp: new Date("2026-01-01T00:00:00.000Z"),
    });
    expect(ics).toBe(
      [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Wedding Invites//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        "UID:site-1@invites.example.com",
        "DTSTAMP:20260101T000000Z",
        "DTSTART:20260403T130000Z",
        "DTEND:20260403T160000Z",
        "SUMMARY:Akhd of Rafid & Shanice",
        "LOCATION:Dhaka Regency Hotel\\, Airport Road | Nikunjo 2\\, Dhaka",
        "DESCRIPTION:Kindly join us\\, with love.\\nSee you there",
        "URL:https://invites.example.com/rafid-and-shanice",
        "END:VEVENT",
        "END:VCALENDAR",
        "",
      ].join("\r\n"),
    );
  });

  it("handles a DST-crossing duration in UTC without drift", () => {
    const ics = buildIcs({
      uid: "u",
      title: "t",
      startsAt: "2026-03-29T00:30:00.000Z", // EU DST switch day
      durationMinutes: 120,
      dtstamp: new Date(0),
    });
    expect(ics).toContain("DTSTART:20260329T003000Z");
    expect(ics).toContain("DTEND:20260329T023000Z");
  });

  it("rejects an invalid date", () => {
    expect(() => buildIcs({ uid: "u", title: "t", startsAt: "nope", durationMinutes: 60 })).toThrow();
  });
});
