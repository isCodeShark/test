import { describe, expect, it } from "vitest";
import {
  isValidSlug,
  slugError,
  slugify,
  suggestSlug,
} from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Rafid & Shanice")).toBe("rafid-and-shanice");
  });
  it("strips diacritics and punctuation", () => {
    expect(slugify("Zoë + Émile's Wedding!")).toBe("zoe-emile-s-wedding");
  });
  it("collapses runs and trims hyphens", () => {
    expect(slugify("--a   b--")).toBe("a-b");
  });
  it("caps at 63 chars without a trailing hyphen", () => {
    const long = slugify("a ".repeat(60));
    expect(long.length).toBeLessThanOrEqual(63);
    expect(long.endsWith("-")).toBe(false);
  });
});

describe("suggestSlug", () => {
  it("joins names with 'and'", () => {
    expect(suggestSlug("Rafid", "Shanice")).toBe("rafid-and-shanice");
  });
  it("falls back when names are empty", () => {
    expect(suggestSlug("", "")).toBe("wedding");
    expect(suggestSlug("A", "")).toBe("a-wedding");
    expect(suggestSlug("Ali", "")).toBe("ali");
  });
});

describe("isValidSlug / slugError", () => {
  it("accepts a normal slug", () => {
    expect(isValidSlug("rafid-and-shanice")).toBe(true);
    expect(slugError("rafid-and-shanice")).toBeNull();
  });
  it("rejects reserved words", () => {
    expect(isValidSlug("dashboard")).toBe(false);
    expect(slugError("login")).toMatch(/reserved/);
  });
  it("rejects bad characters and short slugs", () => {
    expect(isValidSlug("Ab")).toBe(false);
    expect(isValidSlug("-abc")).toBe(false);
    expect(isValidSlug("abc-")).toBe(false);
    expect(isValidSlug("a b c")).toBe(false);
    expect(slugError("ab")).toMatch(/at least/);
  });
});
