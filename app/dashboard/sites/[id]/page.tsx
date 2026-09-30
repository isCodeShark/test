import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteEditor } from "@/components/editor/SiteEditor";
import { siteUrl } from "@/lib/env";
import { getOwnedSite } from "@/lib/sites/queries";
import { parseConfig } from "@/lib/sites/schema";

export const metadata: Metadata = { title: "Edit invitation" };

export default async function EditSitePage({ params }: PageProps<"/dashboard/sites/[id]">) {
  const { id } = await params;
  const site = await getOwnedSite(id);
  if (!site) notFound();

  return (
    <SiteEditor
      site={{
        id: site.id,
        slug: site.slug,
        published: site.published,
        rsvpEnabled: site.rsvp_enabled,
        rsvpDeadline: site.rsvp_deadline,
        config: parseConfig(site.config),
      }}
      siteUrl={siteUrl()}
    />
  );
}
