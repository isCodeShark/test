"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SiteFormSchema, type SiteFormValues } from "@/lib/sites/schema";
import { createClient } from "@/lib/supabase/server";

export type SaveResult =
  | { ok: true; slug: string }
  | { ok: false; error: string; field?: string };

export async function saveSite(id: string, values: SiteFormValues): Promise<SaveResult> {
  const parsed = SiteFormSchema.safeParse(values);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: issue?.message ?? "Invalid input", field: issue?.path.join(".") };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You need to sign in again." };

  const { data: before } = await supabase
    .from("sites")
    .select("slug")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!before) return { ok: false, error: "Site not found." };

  const { error } = await supabase
    .from("sites")
    .update({
      slug: parsed.data.slug,
      published: parsed.data.published,
      rsvp_enabled: parsed.data.rsvpEnabled,
      rsvp_deadline: parsed.data.rsvpDeadline,
      config: parsed.data.config,
    })
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "That address is already taken.", field: "slug" };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath(`/${parsed.data.slug}`);
  if (before.slug !== parsed.data.slug) revalidatePath(`/${before.slug}`);
  revalidatePath("/dashboard");
  return { ok: true, slug: parsed.data.slug };
}

export async function deleteSite(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("sites").delete().eq("id", id).eq("owner_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
