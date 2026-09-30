import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DraftRibbon } from "@/components/invitation/DraftRibbon";
import { Invitation } from "@/components/invitation/Invitation";
import { siteUrl } from "@/lib/env";
import { siteDescription, siteTitle } from "@/lib/sites/display";
import { getPublicSite } from "@/lib/sites/queries";
import { parseConfig } from "@/lib/sites/schema";
import { isValidSlug } from "@/lib/sites/slug";

// Always render on request: RLS decides per viewer whether a draft is visible.
export const dynamic = "force-dynamic";

async function loadSite(slug: string) {
  if (!isValidSlug(slug)) return null;
  return getPublicSite({ slug });
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const site = await loadSite(slug);
  if (!site) return { title: "Invitation not found", robots: { index: false } };

  const config = parseConfig(site.config);
  const title = siteTitle(config);
  const description = siteDescription(config);
  const url = `${siteUrl()}/${site.slug}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "Wedding Invites",
    },
    twitter: { card: "summary", title, description },
    robots: site.published ? { index: true, follow: false } : { index: false, follow: false },
  };
}

export default async function SitePage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const site = await loadSite(slug);
  if (!site) notFound();

  const config = parseConfig(site.config);

  return (
    <>
      {!site.published ? <DraftRibbon siteId={site.id} /> : null}
      <Invitation config={config} slug={site.slug} mode="live" siteUrl={siteUrl()} />
    </>
  );
}
