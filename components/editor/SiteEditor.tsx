"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { deleteSite, saveSite } from "@/app/dashboard/sites/[id]/actions";
import { Invitation } from "@/components/invitation/Invitation";
import { Button, Field, Input, Section, Select, Textarea, cls } from "@/components/ui";
import { SiteConfigSchema, SiteFormSchema, type SiteConfig, type SiteFormValues } from "@/lib/sites/schema";
import { ColorField, DeadlineField, EventDateTimeField, SlugField, YouTubeField } from "./fields";
import { PreviewFrame } from "./PreviewFrame";

export type SiteEditorProps = {
  site: {
    id: string;
    slug: string;
    published: boolean;
    rsvpEnabled: boolean;
    rsvpDeadline: string | null;
    config: SiteConfig;
  };
  siteUrl: string;
};

export function SiteEditor({ site, siteUrl }: SiteEditorProps) {
  const form = useForm<SiteFormValues>({
    resolver: zodResolver(SiteFormSchema),
    defaultValues: {
      slug: site.slug,
      published: site.published,
      rsvpEnabled: site.rsvpEnabled,
      rsvpDeadline: site.rsvpDeadline,
      config: site.config,
    },
    mode: "onBlur",
  });
  const { register, control, handleSubmit, formState, setError, reset, getValues } = form;
  const { errors, isDirty } = formState;

  // Live preview: always render the last config that passed validation so a
  // half-typed field never breaks the envelope.
  const watched = useWatch({ control });
  const parsed = useMemo(() => SiteConfigSchema.safeParse(watched.config), [watched.config]);
  const [lastGood, setLastGood] = useState<SiteConfig>(site.config);
  // Derived state: remember the latest valid config during render (no effect needed).
  if (parsed.success && parsed.data !== lastGood) setLastGood(parsed.data);
  const previewConfig = parsed.success ? parsed.data : lastGood;

  const [previewOpen, setPreviewOpen] = useState(true);
  const [previewKey, setPreviewKey] = useState(0);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const published = watched.published ?? site.published;
  const slug = watched.slug ?? site.slug;
  const openerMode = watched.config?.opener?.mode ?? site.config.opener.mode;

  const onSubmit = handleSubmit((values) => {
    setStatus(null);
    startTransition(async () => {
      const result = await saveSite(site.id, values);
      if (result.ok) {
        reset(values);
        setStatus({ kind: "ok", text: "Saved." });
      } else {
        if (result.field) {
          setError(result.field as keyof SiteFormValues, { message: result.error });
        }
        setStatus({ kind: "error", text: result.error });
      }
    });
  });

  const onDelete = () => {
    if (!window.confirm("Delete this invitation and all its RSVPs? This cannot be undone.")) return;
    startTransition(async () => {
      await deleteSite(site.id);
    });
  };

  const err = (path: string): string | undefined => {
    // Walk the nested errors object by path.
    let node: unknown = errors;
    for (const part of path.split(".")) {
      if (!node || typeof node !== "object") return undefined;
      node = (node as Record<string, unknown>)[part];
    }
    return (node as { message?: string } | undefined)?.message;
  };

  return (
    <form onSubmit={onSubmit} className="pb-24">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/dashboard" className="text-sm text-stone-500 hover:text-stone-800">
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-semibold">Edit invitation</h1>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span
            className={cls(
              "rounded-full px-2.5 py-0.5 text-xs font-medium",
              site.published ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-700",
            )}
          >
            {site.published ? "Published" : "Draft"}
          </span>
          <Link
            href={`/dashboard/sites/${site.id}/rsvps`}
            className="rounded-md border border-stone-300 bg-white px-3 py-1.5 hover:bg-stone-50"
          >
            RSVPs
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <Section title="Names and wording">
            <Field label="Opening line" htmlFor="opener-mode">
              <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
                <Select id="opener-mode" {...register("config.opener.mode")}>
                  <option value="bismillah">Bismillah (﷽)</option>
                  <option value="custom">Custom text</option>
                  <option value="none">None</option>
                </Select>
                {openerMode === "custom" ? (
                  <Input
                    {...register("config.opener.text")}
                    placeholder="Together with their families"
                    aria-label="Custom opening text"
                  />
                ) : null}
              </div>
            </Field>
            <Field label="Header line" htmlFor="headerLine" error={err("config.headerLine")}>
              <Input id="headerLine" {...register("config.headerLine")} placeholder="Kindly join us for the wedding of" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Groom's name" htmlFor="groomName" error={err("config.groom.name")}>
                <Input id="groomName" {...register("config.groom.name")} />
              </Field>
              <Field label="Bride's name" htmlFor="brideName" error={err("config.bride.name")}>
                <Input id="brideName" {...register("config.bride.name")} />
              </Field>
              <Field label="Groom's parents line" htmlFor="groomParents" error={err("config.groom.parentsLine")}>
                <Input id="groomParents" {...register("config.groom.parentsLine")} placeholder="son of … & …" />
              </Field>
              <Field label="Bride's parents line" htmlFor="brideParents" error={err("config.bride.parentsLine")}>
                <Input id="brideParents" {...register("config.bride.parentsLine")} placeholder="daughter of … & …" />
              </Field>
            </div>
          </Section>

          <Section
            title="Date and time"
            description="Guests can tap the date on the invitation to add it to their calendar."
          >
            <EventDateTimeField control={control} />
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Duration (minutes)" htmlFor="duration" error={err("config.event.durationMinutes")}>
                <Input
                  id="duration"
                  type="number"
                  min={15}
                  max={1440}
                  step={15}
                  {...register("config.event.durationMinutes", { valueAsNumber: true })}
                />
              </Field>
              <Field
                label="Date text (optional)"
                htmlFor="dateText"
                hint="Overrides the automatic wording."
                error={err("config.event.dateText")}
              >
                <Input id="dateText" {...register("config.event.dateText")} placeholder="Friday, April 3rd, 2026" />
              </Field>
              <Field label="Time text (optional)" htmlFor="timeText" error={err("config.event.timeText")}>
                <Input id="timeText" {...register("config.event.timeText")} placeholder="7 PM" />
              </Field>
            </div>
          </Section>

          <Section title="Venue" description="Tapping the venue on the invitation opens it in maps.">
            <Field label="Venue name" htmlFor="venueName" error={err("config.venue.name")}>
              <Input id="venueName" {...register("config.venue.name")} placeholder="Dhaka Regency Hotel" />
            </Field>
            <Field label="Address" htmlFor="venueAddress" error={err("config.venue.address")}>
              <Input id="venueAddress" {...register("config.venue.address")} placeholder="Airport Road, Nikunjo 2, Dhaka" />
            </Field>
            <Field
              label="Map link (optional)"
              htmlFor="mapUrl"
              hint="Leave empty to search Google Maps for the name and address."
              error={err("config.venue.mapUrl")}
            >
              <Input id="mapUrl" {...register("config.venue.mapUrl")} placeholder="https://maps.app.goo.gl/…" inputMode="url" />
            </Field>
          </Section>

          <Section title="Music">
            <YouTubeField control={control} />
            <Field label="Volume" htmlFor="volume">
              <input
                id="volume"
                type="range"
                min={0}
                max={100}
                className="w-full accent-rose-900"
                {...register("config.music.volume", { valueAsNumber: true })}
              />
            </Field>
          </Section>

          <Section title="Colors">
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField control={control} name="config.theme.accent" label="Accent (text and names)" />
              <ColorField control={control} name="config.theme.gold" label="Gold (pattern and details)" />
              <ColorField control={control} name="config.theme.bg" label="Card background" />
              <ColorField control={control} name="config.theme.text" label="Body text" />
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                form.setValue(
                  "config.theme",
                  { bg: "#FAF9F6", accent: "#800000", gold: "#d4af37", text: "#800000" },
                  { shouldDirty: true },
                )
              }
            >
              Reset to maroon and gold
            </Button>
          </Section>

          <Section title="RSVP">
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-rose-900" {...register("rsvpEnabled")} />
              Let guests RSVP on the invitation
            </label>
            <DeadlineField control={control} />
            <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
              <Field label="Dietary question label" htmlFor="dietaryPrompt" error={err("config.rsvp.dietaryPrompt")}>
                <Input id="dietaryPrompt" {...register("config.rsvp.dietaryPrompt")} />
              </Field>
              <Field label="Max guests per RSVP" htmlFor="maxGuests" error={err("config.rsvp.maxGuests")}>
                <Input id="maxGuests" type="number" min={1} max={20} {...register("config.rsvp.maxGuests", { valueAsNumber: true })} />
              </Field>
            </div>
          </Section>

          <Section title="Sharing" description="How the link looks in WhatsApp and messages.">
            <SlugField control={control} siteUrl={siteUrl} published={site.published} />
            <Field label="Link title (optional)" htmlFor="ogTitle" error={err("config.og.title")}>
              <Input id="ogTitle" {...register("config.og.title")} placeholder="Rafid & Shanice - Wedding Invitation" />
            </Field>
            <Field label="Link description (optional)" htmlFor="ogDescription" error={err("config.og.description")}>
              <Textarea id="ogDescription" {...register("config.og.description")} placeholder="Kindly join us for …" />
            </Field>
            <label className="flex items-start gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3 text-sm">
              <input type="checkbox" className="mt-0.5 h-4 w-4 accent-rose-900" {...register("published")} />
              <span>
                <span className="font-medium">Published</span>
                <span className="block text-stone-600">
                  When on, anyone with the link can open the invitation. When off, only you can see it.
                </span>
              </span>
            </label>
          </Section>

          <Section title="Danger zone">
            <Button type="button" variant="danger" onClick={onDelete} disabled={pending}>
              Delete invitation
            </Button>
          </Section>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-700">Live preview</h2>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                className="px-3 py-1 text-xs"
                onClick={() => {
                  setPreviewOpen(false);
                  setPreviewKey((k) => k + 1);
                }}
              >
                Replay opening
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="px-3 py-1 text-xs"
                onClick={() => {
                  setPreviewOpen(true);
                  setPreviewKey((k) => k + 1);
                }}
              >
                Show open
              </Button>
            </div>
          </div>
          <PreviewFrame maxHeight={720}>
            <Invitation
              key={previewKey}
              config={previewConfig}
              slug={slug}
              mode="preview"
              defaultOpen={previewOpen}
              siteUrl={siteUrl}
            />
          </PreviewFrame>
          {!parsed.success ? (
            <p className="mt-2 text-xs text-amber-700">
              Preview shows the last valid values; fix the highlighted fields to update it.
            </p>
          ) : null}
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="text-sm">
            {status ? (
              <span className={status.kind === "ok" ? "text-emerald-700" : "text-red-700"}>{status.text}</span>
            ) : isDirty ? (
              <span className="text-stone-600">Unsaved changes</span>
            ) : (
              <span className="text-stone-400">All changes saved</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {site.published ? (
              <a
                href={`/${getValues("slug") || site.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50"
              >
                Open live
              </a>
            ) : null}
            <Button type="submit" disabled={pending || !isDirty}>
              {pending ? "Saving…" : published && !site.published ? "Save and publish" : "Save changes"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
