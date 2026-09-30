import { formatInTimeZone } from "date-fns-tz";
import type { SiteConfig } from "./schema";

/** "Friday, April 3rd, 2026" in the event's time zone, unless overridden. */
export function dateText(config: SiteConfig): string {
  if (config.event.dateText.trim()) return config.event.dateText.trim();
  try {
    return formatInTimeZone(new Date(config.event.startsAt), config.event.timezone, "EEEE, MMMM do, yyyy");
  } catch {
    return "";
  }
}

/** "7 PM" or "7:30 PM" in the event's time zone, unless overridden. */
export function timeText(config: SiteConfig): string {
  if (config.event.timeText.trim()) return config.event.timeText.trim();
  try {
    const d = new Date(config.event.startsAt);
    const minutes = Number(formatInTimeZone(d, config.event.timezone, "m"));
    return formatInTimeZone(d, config.event.timezone, minutes === 0 ? "h a" : "h:mm a");
  } catch {
    return "";
  }
}

export function coupleNames(config: SiteConfig): string {
  return `${config.groom.name.trim()} & ${config.bride.name.trim()}`;
}

/** Browser-tab / Open Graph title. */
export function siteTitle(config: SiteConfig): string {
  return config.og.title.trim() || `${coupleNames(config)} - Wedding Invitation`;
}

function sentenceCase(s: string): string {
  const t = s.trim();
  if (!t) return t;
  const lower = t === t.toUpperCase() ? t.toLowerCase() : t;
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/** Open Graph description, e.g. for WhatsApp link previews. */
export function siteDescription(config: SiteConfig): string {
  if (config.og.description.trim()) return config.og.description.trim();
  const header = sentenceCase(config.headerLine) || "Kindly join us for the wedding of";
  const when = [dateText(config), timeText(config)].filter(Boolean).join(" at ");
  const where = config.venue.name.trim();
  let out = `${header} ${coupleNames(config)}`;
  if (when) out += ` on ${when}`;
  if (where) out += `, ${where}`;
  return `${out}.`;
}
