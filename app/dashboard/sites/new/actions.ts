"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { localInputToInstant } from "@/lib/sites/datetime";
import { DEFAULT_CONFIG, isIanaTimeZone, SlugSchema, type SiteConfig } from "@/lib/sites/schema";
import { createClient } from "@/lib/supabase/server";

export type NewSiteState = {
  error?: string;
  fieldErrors?: Partial<Record<"groomName" | "brideName" | "slug" | "date" | "timezone", string>>;
};

const NewSiteInput = z.object({
  groomName: z.string().trim().min(1, "Enter a name").max(80),
  brideName: z.string().trim().min(1, "Enter a name").max(80),
  slug: SlugSchema,
  date: z.string().min(1, "Choose the date and time"),
  timezone: z.string().refine(isIanaTimeZone, "Unknown time zone"),
});

/** Starting config for a fresh site: reference styling, the couple's own details blank. */
export function newSiteConfig(input: {
  groomName: string;
  brideName: string;
  startsAt: string;
  timezone: string;
}): SiteConfig {
  return {
    ...DEFAULT_CONFIG,
    groom: { name: input.groomName, parentsLine: "" },
    bride: { name: input.brideName, parentsLine: "" },
    event: { ...DEFAULT_CONFIG.event, startsAt: input.startsAt, timezone: input.timezone },
    venue: { name: "", address: "", mapUrl: "" },
  };
}

export async function createSite(_prev: NewSiteState, formData: FormData): Promise<NewSiteState> {
  const parsed = NewSiteInput.safeParse({
    groomName: formData.get("groomName"),
    brideName: formData.get("brideName"),
    slug: formData.get("slug"),
    date: formData.get("date"),
    timezone: formData.get("timezone"),
  });
  if (!parsed.success) {
    const fieldErrors: NewSiteState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<NewSiteState["fieldErrors"]>;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { fieldErrors };
  }

  const startsAt = localInputToInstant(parsed.data.date, parsed.data.timezone);
  if (!startsAt) return { fieldErrors: { date: "Enter a valid date and time" } };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in again." };

  const config = newSiteConfig({
    groomName: parsed.data.groomName,
    brideName: parsed.data.brideName,
    startsAt,
    timezone: parsed.data.timezone,
  });

  const { data, error } = await supabase
    .from("sites")
    .insert({ owner_id: user.id, slug: parsed.data.slug, config })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { fieldErrors: { slug: "That address is already taken. Try another." } };
    }
    return { error: error.message };
  }

  redirect(`/dashboard/sites/${data.id}`);
}
