import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { SiteRow } from "@/lib/supabase/database.types";

/** Sites owned by the signed-in user, newest first, with RSVP counts. */
export const listOwnedSites = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("sites")
    .select("id, slug, published, rsvp_enabled, config, updated_at, rsvps(count)")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const { rsvps, ...site } = row as typeof row & { rsvps: { count: number }[] | null };
    return { ...site, rsvpCount: rsvps?.[0]?.count ?? 0 };
  });
});

/** A site by id, only if the signed-in user owns it. */
export const getOwnedSite = cache(async (id: string): Promise<SiteRow | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("sites")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error) throw error;
  return data;
});

/**
 * A site for public rendering. RLS returns published sites to everyone and
 * unpublished ones only to their owner, so the caller can show a draft
 * ribbon when `published` is false.
 */
export const getPublicSite = cache(
  async (key: { slug: string } | { host: string }): Promise<SiteRow | null> => {
    const supabase = await createClient();
    const query = supabase.from("sites").select("*");
    const { data, error } =
      "slug" in key
        ? await query.eq("slug", key.slug).maybeSingle()
        : await query.eq("custom_domain", key.host).maybeSingle();
    if (error) throw error;
    return data;
  },
);
