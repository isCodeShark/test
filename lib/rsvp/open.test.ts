import { describe, expect, it } from "vitest";
import { rsvpOpen } from "./open";

const now = Date.parse("2026-03-01T00:00:00Z");

describe("rsvpOpen", () => {
  it("is open for a published, enabled site with no deadline", () => {
    expect(rsvpOpen({ published: true, rsvp_enabled: true, rsvp_deadline: null }, now)).toBe(true);
  });
  it("closes for drafts and disabled sites", () => {
    expect(rsvpOpen({ published: false, rsvp_enabled: true, rsvp_deadline: null }, now)).toBe(false);
    expect(rsvpOpen({ published: true, rsvp_enabled: false, rsvp_deadline: null }, now)).toBe(false);
  });
  it("respects the deadline", () => {
    expect(rsvpOpen({ published: true, rsvp_enabled: true, rsvp_deadline: "2026-03-02T00:00:00Z" }, now)).toBe(true);
    expect(rsvpOpen({ published: true, rsvp_enabled: true, rsvp_deadline: "2026-02-28T00:00:00Z" }, now)).toBe(false);
    expect(rsvpOpen({ published: true, rsvp_enabled: true, rsvp_deadline: "2026-03-01T00:00:00Z" }, now)).toBe(false);
  });
});
