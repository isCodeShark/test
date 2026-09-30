/**
 * Minimal RFC 5545 iCalendar builder for a single event.
 * Times are emitted in UTC (`...Z`), which every calendar app handles and
 * avoids shipping VTIMEZONE definitions.
 */

export type IcsEvent = {
  /** Globally unique, stable per event (e.g. `${siteId}@host`). */
  uid: string;
  title: string;
  description?: string;
  location?: string;
  url?: string;
  /** ISO instant or Date. */
  startsAt: string | Date;
  durationMinutes: number;
  /** Defaults to now; injectable for deterministic tests. */
  dtstamp?: Date;
};

const CRLF = "\r\n";
const MAX_LINE_BYTES = 75;

export function formatUtc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

/** RFC 5545 §3.3.11 TEXT escaping. */
export function escapeText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

/**
 * Fold a content line to at most 75 octets per physical line, continuing
 * with CRLF + a single space. Never splits a multi-byte character.
 */
export function foldLine(line: string): string {
  const encoder = new TextEncoder();
  const out: string[] = [];
  let current = "";
  let currentBytes = 0;
  let limit = MAX_LINE_BYTES;
  for (const ch of line) {
    const size = encoder.encode(ch).length;
    if (currentBytes + size > limit) {
      out.push(current);
      current = " ";
      currentBytes = 1;
      limit = MAX_LINE_BYTES;
    }
    current += ch;
    currentBytes += size;
  }
  out.push(current);
  return out.join(CRLF);
}

export function buildIcs(event: IcsEvent): string {
  const start = typeof event.startsAt === "string" ? new Date(event.startsAt) : event.startsAt;
  if (Number.isNaN(start.getTime())) throw new Error("Invalid start date");
  const end = new Date(start.getTime() + event.durationMinutes * 60_000);
  const stamp = event.dtstamp ?? new Date();

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding Invites//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${escapeText(event.uid)}`,
    `DTSTAMP:${formatUtc(stamp)}`,
    `DTSTART:${formatUtc(start)}`,
    `DTEND:${formatUtc(end)}`,
    `SUMMARY:${escapeText(event.title)}`,
  ];
  if (event.location) lines.push(`LOCATION:${escapeText(event.location)}`);
  if (event.description) lines.push(`DESCRIPTION:${escapeText(event.description)}`);
  if (event.url) lines.push(`URL:${event.url}`);
  lines.push("END:VEVENT", "END:VCALENDAR");

  return lines.map(foldLine).join(CRLF) + CRLF;
}

/** Inline download link usable without a server round-trip (editor preview). */
export function icsDataUrl(ics: string): string {
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}
