import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RsvpTable, RsvpTotals } from "@/components/dashboard/RsvpTable";
import { coupleNames } from "@/lib/sites/display";
import { getOwnedSite } from "@/lib/sites/queries";
import { parseConfig } from "@/lib/sites/schema";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "RSVPs" };

export default async function RsvpsPage({ params }: PageProps<"/dashboard/sites/[id]/rsvps">) {
  const { id } = await params;
  const site = await getOwnedSite(id);
  if (!site) notFound();

  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("rsvps")
    .select("*")
    .eq("site_id", site.id)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const config = parseConfig(site.config);

  return (
    <div>
      <Link href={`/dashboard/sites/${site.id}`} className="text-sm text-stone-500 hover:text-stone-800">
        ← Back to editor
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">RSVPs</h1>
          <p className="text-sm text-stone-600">{coupleNames(config)}</p>
        </div>
        <a
          href={`/dashboard/sites/${site.id}/rsvps.csv`}
          download={`${site.slug}-rsvps.csv`}
          className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50"
        >
          Export CSV
        </a>
      </div>

      <div className="mt-6">
        <RsvpTotals rows={rows ?? []} />
      </div>

      <div className="mt-6">
        <RsvpTable rows={rows ?? []} timeZone={config.event.timezone} />
      </div>
    </div>
  );
}
