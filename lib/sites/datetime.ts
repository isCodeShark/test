import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

/**
 * Conversions between the stored ISO instant and the wall-clock value of an
 * <input type="datetime-local"> in the event's time zone.
 */

export function instantToLocalInput(iso: string | null | undefined, timeZone: string): string {
  if (!iso) return "";
  try {
    return formatInTimeZone(new Date(iso), timeZone, "yyyy-MM-dd'T'HH:mm");
  } catch {
    return "";
  }
}

export function localInputToInstant(local: string, timeZone: string): string | null {
  if (!local) return null;
  try {
    const d = fromZonedTime(local, timeZone);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  } catch {
    return null;
  }
}

const FALLBACK_ZONES = [
  "UTC",
  "Asia/Dhaka",
  "Asia/Kolkata",
  "Asia/Karachi",
  "Asia/Dubai",
  "Asia/Riyadh",
  "Asia/Kuala_Lumpur",
  "Asia/Singapore",
  "Asia/Jakarta",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Istanbul",
  "Africa/Cairo",
  "Africa/Lagos",
  "America/Toronto",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Vancouver",
  "America/Sao_Paulo",
];

export function timeZoneOptions(): string[] {
  const intl = Intl as unknown as { supportedValuesOf?: (k: string) => string[] };
  try {
    const list = intl.supportedValuesOf?.("timeZone");
    if (list && list.length) return list;
  } catch {
    // fall through
  }
  return FALLBACK_ZONES;
}

export function browserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
