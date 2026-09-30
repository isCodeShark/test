/**
 * Slug rules are shared by the editor (zod), the database CHECK constraint
 * (see supabase/migrations) and the host resolver. Keep them in sync.
 *
 * A slug is a DNS label so it can later double as a subdomain:
 * lowercase letters, digits and hyphens, 3-63 chars, no leading/trailing hyphen.
 */

export const SLUG_MIN = 3;
export const SLUG_MAX = 63;

export const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/;

/** Path segments owned by the app itself; a site can never live there. */
export const RESERVED_SLUGS: readonly string[] = [
  "dashboard",
  "login",
  "auth",
  "api",
  "admin",
  "www",
  "app",
  "new",
  "sites",
  "assets",
  "static",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "manifest.json",
  "opengraph-image",
  "_next",
];

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug);
}

export function isValidSlug(slug: string): boolean {
  return SLUG_REGEX.test(slug) && !isReservedSlug(slug);
}

/**
 * Turn free text ("Rafid & Shanice") into a slug candidate ("rafid-shanice").
 * Strips diacritics, replaces runs of non-alphanumerics with a single hyphen.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX)
    .replace(/-+$/g, "");
}

/** Default slug for a new site, e.g. "rafid-and-shanice". */
export function suggestSlug(groomName: string, brideName: string): string {
  const names = [groomName, brideName].map(slugify).filter(Boolean);
  const base = names.join("-and-");
  if (base.length >= SLUG_MIN && !isReservedSlug(base)) return base;
  const padded = slugify(`${base} wedding`);
  return padded.length >= SLUG_MIN ? padded : "our-wedding";
}

/** Human-readable reason a slug is rejected, or null when valid. */
export function slugError(slug: string): string | null {
  if (slug.length < SLUG_MIN) return `Must be at least ${SLUG_MIN} characters.`;
  if (slug.length > SLUG_MAX) return `Must be at most ${SLUG_MAX} characters.`;
  if (!SLUG_REGEX.test(slug))
    return "Use lowercase letters, numbers and hyphens only (no leading or trailing hyphen).";
  if (isReservedSlug(slug)) return "That address is reserved.";
  return null;
}
