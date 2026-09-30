import type { NextRequest } from "next/server";
import { siteHost, siteUrl } from "@/lib/env";
import { siteIcs } from "@/lib/sites/event";
import { getPublicSite } from "@/lib/sites/queries";
import { parseConfig } from "@/lib/sites/schema";
import { isValidSlug } from "@/lib/sites/slug";

export async function GET(_req: NextRequest, ctx: RouteContext<"/[slug]/event.ics">) {
  const { slug } = await ctx.params;
  if (!isValidSlug(slug)) return new Response("Not found", { status: 404 });

  const site = await getPublicSite({ slug });
  if (!site) return new Response("Not found", { status: 404 });

  const config = parseConfig(site.config);
  let ics: string;
  try {
    ics = siteIcs({
      uid: `${site.id}@${siteHost()}`,
      config,
      url: `${siteUrl()}/${site.slug}`,
      dtstamp: new Date(site.updated_at),
    });
  } catch {
    return new Response("Event date is not set", { status: 422 });
  }

  return new Response(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${site.slug}.ics"`,
      "Cache-Control": site.published ? "public, max-age=300" : "no-store",
    },
  });
}
