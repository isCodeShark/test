import { describe, expect, it } from "vitest";
import { safeNext } from "./safe-next";

describe("safeNext", () => {
  it("keeps relative paths", () => {
    expect(safeNext("/dashboard/sites/1")).toBe("/dashboard/sites/1");
    expect(safeNext("/dashboard?x=1")).toBe("/dashboard?x=1");
  });
  it("falls back for missing or unsafe values", () => {
    expect(safeNext(null)).toBe("/dashboard");
    expect(safeNext("")).toBe("/dashboard");
    expect(safeNext("https://evil.com")).toBe("/dashboard");
    expect(safeNext("//evil.com")).toBe("/dashboard");
    expect(safeNext("/\\evil.com")).toBe("/dashboard");
    expect(safeNext("/a\r\nSet-Cookie: x")).toBe("/dashboard");
  });
  it("honours a custom fallback", () => {
    expect(safeNext(null, "/")).toBe("/");
  });
});
