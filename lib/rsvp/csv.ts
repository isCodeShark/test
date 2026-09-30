import { formatInTimeZone } from "date-fns-tz";
import type { RsvpRow } from "@/lib/supabase/database.types";

/** Byte-order mark so Excel opens the file as UTF-8. */
export const CSV_BOM = "﻿";

export const CSV_HEADER = ["Name", "Attending", "Guests", "Dietary", "Message", "Submitted at"];

/**
 * Quote a value for CSV. Also neutralises spreadsheet formula injection
 * (cells starting with = + - @ or a tab/CR) by prefixing a single quote.
 */
export function csvEscape(raw: string | number | null | undefined): string {
  let value = raw == null ? "" : String(raw);
  if (/^[=+\-@\t\r]/.test(value)) value = `'${value}`;
  if (/[",\r\n]/.test(value)) value = `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function csvLine(fields: Array<string | number | null | undefined>): string {
  return fields.map(csvEscape).join(",") + "\r\n";
}

export function rsvpCsvRow(row: RsvpRow, timeZone: string): string {
  let submitted = row.created_at;
  try {
    submitted = formatInTimeZone(new Date(row.created_at), timeZone, "yyyy-MM-dd HH:mm");
  } catch {
    // keep the ISO string
  }
  return csvLine([
    row.name,
    row.attending ? "Yes" : "No",
    row.guests,
    row.dietary,
    row.message,
    submitted,
  ]);
}

export type RsvpTotals = {
  responses: number;
  attending: number;
  declined: number;
  guests: number;
};

export function rsvpTotals(rows: Pick<RsvpRow, "attending" | "guests">[]): RsvpTotals {
  const totals: RsvpTotals = { responses: rows.length, attending: 0, declined: 0, guests: 0 };
  for (const r of rows) {
    if (r.attending) {
      totals.attending += 1;
      totals.guests += r.guests;
    } else {
      totals.declined += 1;
    }
  }
  return totals;
}
