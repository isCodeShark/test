import type { NextRequest } from "next/server";
import { CSV_BOM, CSV_HEADER, csvLine, rsvpCsvRow } from "@/lib/rsvp/csv";
import { getOwnedSite } from "@/lib/sites/queries";
import { parseConfig } from "@/lib/sites/schema";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 500;

/** Streams all RSVPs for one of the signed-in user's sites as UTF-8 CSV. */
export async function GET(_req: NextRequest, ctx: RouteContext<"/dashboard/sites/[id]/rsvps.csv">) {
  const { id } = await ctx.params;
  const site = await getOwnedSite(id);
  if (!site) return new Response("Not found", { status: 404 });

  const timeZone = parseConfig(site.config).event.timezone;
  const supabase = await createClient();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(encoder.encode(CSV_BOM + csvLine(CSV_HEADER)));
      try {
        for (let from = 0; ; from += PAGE_SIZE) {
          const { data, error } = await supabase
            .from("rsvps")
            .select("*")
            .eq("site_id", site.id)
            .order("created_at", { ascending: true })
            .range(from, from + PAGE_SIZE - 1);
          if (error) throw error;
          for (const row of data ?? []) {
            controller.enqueue(encoder.encode(rsvpCsvRow(row, timeZone)));
          }
          if (!data || data.length < PAGE_SIZE) break;
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${site.slug}-rsvps.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
