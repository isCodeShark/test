import { YOUTUBE_ID_REGEX } from "./schema";

/**
 * Pull an 11-character video id out of anything a user might paste:
 * a bare id, watch?v=, youtu.be/, /embed/, /shorts/, /live/ or music.youtube.com.
 * Returns "" when nothing usable is found.
 */
export function extractYouTubeId(input: string): string {
  const raw = input.trim();
  if (!raw) return "";
  if (YOUTUBE_ID_REGEX.test(raw)) return raw;

  let url: URL;
  try {
    url = new URL(raw.includes("://") ? raw : `https://${raw}`);
  } catch {
    return "";
  }

  const host = url.hostname.replace(/^www\.|^m\.|^music\./, "");
  if (host === "youtu.be") {
    return check(url.pathname.split("/")[1]);
  }
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const v = url.searchParams.get("v");
    if (v) return check(v);
    const parts = url.pathname.split("/").filter(Boolean);
    const idx = parts.findIndex((p) => ["embed", "shorts", "live", "v"].includes(p));
    if (idx >= 0) return check(parts[idx + 1]);
  }
  return "";
}

function check(candidate: string | undefined): string {
  return candidate && YOUTUBE_ID_REGEX.test(candidate) ? candidate : "";
}

export function youtubeThumbnail(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
