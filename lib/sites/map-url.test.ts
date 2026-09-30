import { describe, expect, it } from "vitest";
import { buildMapUrl } from "./map-url";

describe("buildMapUrl", () => {
  it("prefers a custom URL", () => {
    expect(buildMapUrl({ name: "X", address: "Y", mapUrl: "https://maps.app.goo.gl/abc" })).toBe(
      "https://maps.app.goo.gl/abc",
    );
  });
  it("builds a Google Maps search from name and address", () => {
    expect(buildMapUrl({ name: "Dhaka Regency Hotel", address: "Airport Road, Dhaka", mapUrl: "" })).toBe(
      "https://www.google.com/maps/search/?api=1&query=Dhaka%20Regency%20Hotel%2C%20Airport%20Road%2C%20Dhaka",
    );
  });
  it("returns empty when nothing is known", () => {
    expect(buildMapUrl({ name: " ", address: "", mapUrl: "" })).toBe("");
  });
});
