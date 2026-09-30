import { z } from "zod";
import { isReservedSlug, SLUG_MAX, SLUG_MIN, SLUG_REGEX } from "./slug";

/**
 * The invitation configuration stored in `sites.config` (jsonb).
 * Shared by the editor form, the renderer, server actions and the .ics route.
 */

export const HexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color like #800000");

export const OpenerMode = z.enum(["bismillah", "custom", "none"]);
export type OpenerMode = z.infer<typeof OpenerMode>;

export function isIanaTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export const YOUTUBE_ID_REGEX = /^[A-Za-z0-9_-]{11}$/;

export const SiteConfigSchema = z.object({
  opener: z.object({
    mode: OpenerMode,
    /** Used when mode === "custom". */
    text: z.string().max(200),
  }),
  headerLine: z.string().max(120),
  groom: z.object({
    name: z.string().trim().min(1, "Enter a name").max(80),
    parentsLine: z.string().max(200),
  }),
  bride: z.object({
    name: z.string().trim().min(1, "Enter a name").max(80),
    parentsLine: z.string().max(200),
  }),
  event: z.object({
    /** ISO instant (stored in UTC). */
    startsAt: z.iso.datetime({ offset: true, message: "Enter the event date and time" }),
    /** IANA zone the couple entered the time in, e.g. "Asia/Dhaka". */
    timezone: z.string().refine(isIanaTimeZone, "Unknown time zone"),
    durationMinutes: z.number().int().min(15).max(1440),
    /** Display override; empty means "derive from startsAt". */
    dateText: z.string().max(80),
    timeText: z.string().max(40),
  }),
  venue: z.object({
    name: z.string().max(120),
    address: z.string().max(240),
    /** Empty means "build a Google Maps search link from name + address". */
    mapUrl: z.union([z.literal(""), z.url({ message: "Enter a full URL" })]),
  }),
  music: z.object({
    youtubeId: z.union([z.literal(""), z.string().regex(YOUTUBE_ID_REGEX)]),
    volume: z.number().int().min(0).max(100),
  }),
  theme: z.object({
    bg: HexColor,
    accent: HexColor,
    gold: HexColor,
    text: HexColor,
  }),
  og: z.object({
    title: z.string().max(120),
    description: z.string().max(300),
  }),
  rsvp: z.object({
    dietaryPrompt: z.string().max(120),
    maxGuests: z.number().int().min(1).max(20),
  }),
});

export type SiteConfig = z.infer<typeof SiteConfigSchema>;

export const SlugSchema = z
  .string()
  .trim()
  .min(SLUG_MIN, `At least ${SLUG_MIN} characters`)
  .max(SLUG_MAX, `At most ${SLUG_MAX} characters`)
  .regex(SLUG_REGEX, "Lowercase letters, numbers and hyphens only")
  .refine((s) => !isReservedSlug(s), "That address is reserved");

/** What the editor form edits and saveSite() persists (columns + config). */
export const SiteFormSchema = z.object({
  slug: SlugSchema,
  published: z.boolean(),
  rsvpEnabled: z.boolean(),
  /** ISO instant or null for "no deadline". */
  rsvpDeadline: z.union([z.iso.datetime({ offset: true }), z.null()]),
  config: SiteConfigSchema,
});

export type SiteFormValues = z.infer<typeof SiteFormSchema>;

/** The reference invitation, used as the starting point for new sites. */
export const DEFAULT_CONFIG: SiteConfig = {
  opener: { mode: "bismillah", text: "" },
  headerLine: "Kindly join us for the Akhd of",
  groom: { name: "Rafid", parentsLine: "son of Khurshid Alam & Ayesha Akter Alpona" },
  bride: { name: "Shanice", parentsLine: "daughter of Manock Keosayavong & Khamsay Khouvilay" },
  event: {
    // 7 PM in Dhaka (UTC+6) on 3 April 2026
    startsAt: "2026-04-03T13:00:00.000Z",
    timezone: "Asia/Dhaka",
    durationMinutes: 180,
    dateText: "",
    timeText: "",
  },
  venue: {
    name: "Dhaka Regency Hotel",
    address: "Airport Road | Nikunjo 2, Dhaka",
    mapUrl: "",
  },
  music: { youtubeId: "", volume: 30 },
  theme: { bg: "#FAF9F6", accent: "#800000", gold: "#d4af37", text: "#800000" },
  og: { title: "", description: "" },
  rsvp: { dietaryPrompt: "Dietary requirements or meal preference", maxGuests: 5 },
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Deep-merge `patch` over `base`, only descending into plain objects. */
export function deepMerge<T>(base: T, patch: unknown): T {
  if (!isPlainObject(base)) {
    return (patch === undefined ? base : patch) as T;
  }
  if (!isPlainObject(patch)) {
    return base;
  }
  const out: Record<string, unknown> = { ...base };
  for (const key of Object.keys(base)) {
    if (key in patch) out[key] = deepMerge(base[key], patch[key]);
  }
  return out as T;
}

/**
 * Parse a stored config, filling gaps from the defaults so rows written by
 * an older version of the schema still render.
 */
export function parseConfig(raw: unknown): SiteConfig {
  const merged = deepMerge(DEFAULT_CONFIG, raw);
  const result = SiteConfigSchema.safeParse(merged);
  if (result.success) return result.data;
  // Last resort: keep whatever is valid at the top level, default the rest.
  const repaired: Record<string, unknown> = { ...DEFAULT_CONFIG };
  for (const key of Object.keys(DEFAULT_CONFIG) as (keyof SiteConfig)[]) {
    const section = SiteConfigSchema.shape[key].safeParse(merged[key]);
    repaired[key] = section.success ? section.data : DEFAULT_CONFIG[key];
  }
  return repaired as SiteConfig;
}
