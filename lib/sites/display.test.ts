import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG } from "./schema";
import { dateText, siteDescription, siteTitle, timeText } from "./display";

describe("display helpers", () => {
  it("derives date and time in the event time zone", () => {
    expect(dateText(DEFAULT_CONFIG)).toBe("Friday, April 3rd, 2026");
    expect(timeText(DEFAULT_CONFIG)).toBe("7 PM");
  });

  it("shows minutes when not on the hour", () => {
    const cfg = { ...DEFAULT_CONFIG, event: { ...DEFAULT_CONFIG.event, startsAt: "2026-04-03T13:30:00.000Z" } };
    expect(timeText(cfg)).toBe("7:30 PM");
  });

  it("honours overrides", () => {
    const cfg = {
      ...DEFAULT_CONFIG,
      event: { ...DEFAULT_CONFIG.event, dateText: "Next Friday", timeText: "After Maghrib" },
    };
    expect(dateText(cfg)).toBe("Next Friday");
    expect(timeText(cfg)).toBe("After Maghrib");
  });

  it("builds a title and description", () => {
    expect(siteTitle(DEFAULT_CONFIG)).toBe("Rafid & Shanice - Wedding Invitation");
    expect(siteDescription(DEFAULT_CONFIG)).toBe(
      "Kindly join us for the Akhd of Rafid & Shanice on Friday, April 3rd, 2026 at 7 PM, Dhaka Regency Hotel.",
    );
  });

  it("sentence-cases an all-caps header line", () => {
    const cfg = { ...DEFAULT_CONFIG, headerLine: "KINDLY JOIN US FOR THE AKHD OF", venue: { ...DEFAULT_CONFIG.venue, name: "" } };
    expect(siteDescription(cfg)).toMatch(/^Kindly join us for the akhd of Rafid & Shanice on/);
  });
});
