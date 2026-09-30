import { describe, expect, it } from "vitest";
import { extractYouTubeId } from "./youtube";

describe("extractYouTubeId", () => {
  const id = "dQw4w9WgXcQ";
  it.each([
    [id, id],
    [`https://www.youtube.com/watch?v=${id}`, id],
    [`https://www.youtube.com/watch?v=${id}&t=42s&list=PL123`, id],
    [`https://youtu.be/${id}?si=abc`, id],
    [`https://youtube.com/embed/${id}`, id],
    [`https://www.youtube.com/shorts/${id}`, id],
    [`https://m.youtube.com/watch?v=${id}`, id],
    [`https://music.youtube.com/watch?v=${id}`, id],
    [`youtube.com/watch?v=${id}`, id],
    [`https://www.youtube-nocookie.com/embed/${id}`, id],
  ])("parses %s", (input, expected) => {
    expect(extractYouTubeId(input)).toBe(expected);
  });

  it("returns empty for junk", () => {
    expect(extractYouTubeId("")).toBe("");
    expect(extractYouTubeId("not a url")).toBe("");
    expect(extractYouTubeId("https://vimeo.com/12345")).toBe("");
    expect(extractYouTubeId("https://www.youtube.com/watch?v=short")).toBe("");
  });
});
