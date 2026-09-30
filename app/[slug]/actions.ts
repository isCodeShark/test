"use server";

import { getPublicSite } from "@/lib/sites/queries";
import { parseConfig } from "@/lib/sites/schema";
import { isValidSlug } from "@/lib/sites/slug";
import { rsvpOpen } from "@/lib/rsvp/open";
import { RsvpInputSchema, type RsvpState } from "@/lib/rsvp/schema";
import { createClient } from "@/lib/supabase/server";

export async function submitRsvp(
  slug: string,
  _prev: RsvpState,
  formData: FormData,
): Promise<RsvpState> {
  const raw = {
    name: formData.get("name"),
    attending: formData.get("attending"),
    guests: formData.get("guests") ?? "1",
    dietary: formData.get("dietary") ?? "",
    message: formData.get("message") ?? "",
    website: formData.get("website") ?? "",
  };

  // Bots fill the hidden field; pretend it worked and store nothing.
  if (typeof raw.website === "string" && raw.website.length > 0) {
    return { status: "ok", name: String(raw.name ?? ""), attending: raw.attending === "yes" };
  }

  const parsed = RsvpInputSchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { status: "error", message: issue?.message ?? "Please check the form.", field: String(issue?.path[0] ?? "") };
  }

  if (!isValidSlug(slug)) return { status: "error", message: "This invitation is no longer available." };

  try {
    const site = await getPublicSite({ slug });
    if (!site) return { status: "error", message: "This invitation is no longer available." };
    if (!rsvpOpen(site)) return { status: "closed" };

    const config = parseConfig(site.config);
    const attending = parsed.data.attending === "yes";
    const guests = attending ? Math.min(Math.max(parsed.data.guests, 1), config.rsvp.maxGuests) : 0;

    const supabase = await createClient();
    const { error } = await supabase.from("rsvps").insert({
      site_id: site.id,
      name: parsed.data.name,
      attending,
      guests,
      dietary: parsed.data.dietary || null,
      message: parsed.data.message || null,
    });

    if (error) {
      // Row-level security refuses inserts once RSVPs close.
      if (error.code === "42501") return { status: "closed" };
      console.error("RSVP insert failed", error);
      return { status: "error", message: "Something went wrong. Please try again." };
    }

    return { status: "ok", name: parsed.data.name, attending };
  } catch (err) {
    console.error("RSVP failed", err);
    return { status: "error", message: "We couldn't send your RSVP. Please try again in a moment." };
  }
}
