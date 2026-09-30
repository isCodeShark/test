import { describe, expect, it } from "vitest";
import {
  DEFAULT_CONFIG,
  deepMerge,
  isIanaTimeZone,
  parseConfig,
  SiteConfigSchema,
  SiteFormSchema,
} from "./schema";

describe("SiteConfigSchema", () => {
  it("accepts the default config", () => {
    expect(SiteConfigSchema.safeParse(DEFAULT_CONFIG).success).toBe(true);
  });
  it("rejects an empty groom name", () => {
    const bad = { ...DEFAULT_CONFIG, groom: { ...DEFAULT_CONFIG.groom, name: " " } };
    expect(SiteConfigSchema.safeParse(bad).success).toBe(false);
  });
  it("rejects bad colors and youtube ids", () => {
    expect(
      SiteConfigSchema.safeParse({ ...DEFAULT_CONFIG, theme: { ...DEFAULT_CONFIG.theme, gold: "gold" } })
        .success,
    ).toBe(false);
    expect(
      SiteConfigSchema.safeParse({ ...DEFAULT_CONFIG, music: { youtubeId: "nope", volume: 30 } })
        .success,
    ).toBe(false);
    expect(
      SiteConfigSchema.safeParse({ ...DEFAULT_CONFIG, music: { youtubeId: "dQw4w9WgXcQ", volume: 30 } })
        .success,
    ).toBe(true);
  });
});

describe("isIanaTimeZone", () => {
  it("recognises valid and invalid zones", () => {
    expect(isIanaTimeZone("Asia/Dhaka")).toBe(true);
    expect(isIanaTimeZone("UTC")).toBe(true);
    expect(isIanaTimeZone("Mars/Olympus")).toBe(false);
  });
});

describe("deepMerge", () => {
  it("fills missing nested keys and ignores unknown ones", () => {
    const out = deepMerge({ a: { b: 1, c: 2 }, d: 3 }, { a: { b: 9 }, zzz: 1 });
    expect(out).toEqual({ a: { b: 9, c: 2 }, d: 3 });
  });
});

describe("parseConfig", () => {
  it("returns defaults for an empty object", () => {
    expect(parseConfig({})).toEqual(DEFAULT_CONFIG);
  });
  it("keeps valid overrides", () => {
    const out = parseConfig({ groom: { name: "Ali" } });
    expect(out.groom.name).toBe("Ali");
    expect(out.groom.parentsLine).toBe(DEFAULT_CONFIG.groom.parentsLine);
  });
  it("repairs an invalid section instead of throwing", () => {
    const out = parseConfig({ theme: { accent: "not-a-color" }, bride: { name: "Sara" } });
    expect(out.theme).toEqual(DEFAULT_CONFIG.theme);
    expect(out.bride.name).toBe("Sara");
  });
  it("survives garbage", () => {
    expect(parseConfig(null)).toEqual(DEFAULT_CONFIG);
    expect(parseConfig("nope")).toEqual(DEFAULT_CONFIG);
  });
});

describe("SiteFormSchema", () => {
  it("validates slug and deadline", () => {
    const ok = SiteFormSchema.safeParse({
      slug: "rafid-and-shanice",
      published: true,
      rsvpEnabled: true,
      rsvpDeadline: null,
      config: DEFAULT_CONFIG,
    });
    expect(ok.success).toBe(true);
    const bad = SiteFormSchema.safeParse({
      slug: "dashboard",
      published: true,
      rsvpEnabled: true,
      rsvpDeadline: "tomorrow",
      config: DEFAULT_CONFIG,
    });
    expect(bad.success).toBe(false);
  });
});
