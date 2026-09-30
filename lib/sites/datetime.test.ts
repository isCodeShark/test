import { describe, expect, it } from "vitest";
import { instantToLocalInput, localInputToInstant, timeZoneOptions } from "./datetime";

describe("datetime conversions", () => {
  it("round-trips a Dhaka wall-clock time", () => {
    const iso = localInputToInstant("2026-04-03T19:00", "Asia/Dhaka");
    expect(iso).toBe("2026-04-03T13:00:00.000Z");
    expect(instantToLocalInput(iso, "Asia/Dhaka")).toBe("2026-04-03T19:00");
  });

  it("handles DST zones", () => {
    // Toronto is UTC-4 in July
    expect(localInputToInstant("2026-07-04T18:30", "America/Toronto")).toBe("2026-07-04T22:30:00.000Z");
    // and UTC-5 in January
    expect(localInputToInstant("2026-01-04T18:30", "America/Toronto")).toBe("2026-01-04T23:30:00.000Z");
  });

  it("returns null / empty for bad input", () => {
    expect(localInputToInstant("", "UTC")).toBeNull();
    expect(localInputToInstant("garbage", "UTC")).toBeNull();
    expect(instantToLocalInput(null, "UTC")).toBe("");
  });

  it("lists time zones", () => {
    const zones = timeZoneOptions();
    expect(zones).toContain("Asia/Dhaka");
    expect(zones.length).toBeGreaterThan(20);
  });
});
