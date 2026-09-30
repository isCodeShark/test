"use client";

import { useEffect, useMemo, useState } from "react";
import { useController, useWatch, type Control } from "react-hook-form";
import { Button, Field, Input, Select, cls } from "@/components/ui";
import { instantToLocalInput, localInputToInstant, timeZoneOptions } from "@/lib/sites/datetime";
import type { SiteFormValues } from "@/lib/sites/schema";
import { slugify } from "@/lib/sites/slug";
import { extractYouTubeId, youtubeThumbnail } from "@/lib/sites/youtube";

type Ctl = Control<SiteFormValues>;

/** Date + time entered as wall-clock in the chosen zone; stored as an ISO instant. */
export function EventDateTimeField({ control }: { control: Ctl }) {
  const startsAt = useController({ control, name: "config.event.startsAt" });
  const timezone = useController({ control, name: "config.event.timezone" });
  const zones = useMemo(() => timeZoneOptions(), []);
  const tz = timezone.field.value;
  const local = instantToLocalInput(startsAt.field.value, tz);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Date and time" htmlFor="event-start" error={startsAt.fieldState.error?.message}>
        <Input
          id="event-start"
          type="datetime-local"
          value={local}
          onChange={(e) => {
            const iso = localInputToInstant(e.target.value, tz);
            startsAt.field.onChange(iso ?? "");
          }}
          onBlur={startsAt.field.onBlur}
        />
      </Field>
      <Field label="Time zone" htmlFor="event-tz" error={timezone.fieldState.error?.message}>
        <Select
          id="event-tz"
          value={tz}
          onChange={(e) => {
            const nextTz = e.target.value;
            // Keep the wall-clock time the couple typed; re-anchor it in the new zone.
            const iso = localInputToInstant(local, nextTz);
            timezone.field.onChange(nextTz);
            if (iso) startsAt.field.onChange(iso);
          }}
        >
          {zones.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </Select>
      </Field>
    </div>
  );
}

/** Optional deadline, entered in the event's zone. Empty = no deadline. */
export function DeadlineField({ control }: { control: Ctl }) {
  const deadline = useController({ control, name: "rsvpDeadline" });
  const tz = useWatch({ control, name: "config.event.timezone" });
  return (
    <Field
      label="RSVP deadline (optional)"
      htmlFor="rsvp-deadline"
      hint={`In ${tz}. Leave empty to accept RSVPs until you turn them off.`}
      error={deadline.fieldState.error?.message}
    >
      <Input
        id="rsvp-deadline"
        type="datetime-local"
        value={instantToLocalInput(deadline.field.value, tz)}
        onChange={(e) => deadline.field.onChange(localInputToInstant(e.target.value, tz))}
        onBlur={deadline.field.onBlur}
      />
    </Field>
  );
}

export function ColorField({
  control,
  name,
  label,
}: {
  control: Ctl;
  name: `config.theme.${"bg" | "accent" | "gold" | "text"}`;
  label: string;
}) {
  const { field, fieldState } = useController({ control, name });
  const value = typeof field.value === "string" ? field.value : "#000000";
  const valid = /^#[0-9a-fA-F]{6}$/.test(value);
  return (
    <Field label={label} htmlFor={name} error={fieldState.error?.message}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} picker`}
          value={valid ? value : "#000000"}
          onChange={(e) => field.onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded border border-stone-300 bg-white p-0.5"
        />
        <Input
          id={name}
          value={value}
          onChange={(e) => field.onChange(e.target.value.trim())}
          onBlur={field.onBlur}
          className="font-mono uppercase"
          maxLength={7}
        />
      </div>
    </Field>
  );
}

export function SlugField({
  control,
  siteUrl,
  published,
}: {
  control: Ctl;
  siteUrl: string;
  published: boolean;
}) {
  const { field, fieldState } = useController({ control, name: "slug" });
  const [copied, setCopied] = useState(false);
  const url = `${siteUrl}/${field.value || ""}`;

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <Field
      label="Web address"
      htmlFor="slug"
      error={fieldState.error?.message}
      hint={
        published && fieldState.isDirty
          ? "Changing a published address breaks links you already shared."
          : "Lowercase letters, numbers and hyphens."
      }
    >
      <div className="flex gap-2">
        <div className="flex min-w-0 flex-1 items-center rounded-md border border-stone-300 bg-white shadow-sm focus-within:border-rose-700 focus-within:ring-1 focus-within:ring-rose-700">
          <span className="hidden shrink-0 pl-3 text-sm text-stone-400 sm:inline">{siteUrl}/</span>
          <input
            id="slug"
            value={field.value}
            onChange={(e) => field.onChange(slugify(e.target.value.replace(/\s+$/, "-")))}
            onBlur={field.onBlur}
            className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-stone-900 focus:outline-none"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            void navigator.clipboard?.writeText(url).then(() => setCopied(true));
          }}
        >
          {copied ? "Copied" : "Copy link"}
        </Button>
      </div>
    </Field>
  );
}

export function YouTubeField({ control }: { control: Ctl }) {
  const { field, fieldState } = useController({ control, name: "config.music.youtubeId" });
  const [raw, setRaw] = useState(field.value ? `https://youtu.be/${field.value}` : "");
  const id = field.value;
  const noMatch = raw.trim() !== "" && !id;

  return (
    <Field
      label="YouTube link (background music)"
      htmlFor="youtube"
      hint={
        noMatch
          ? undefined
          : "Paste a YouTube link. Music starts when a guest opens the envelope; they can mute it."
      }
      error={noMatch ? "No video found in that link." : fieldState.error?.message}
    >
      <div className="flex gap-3">
        <Input
          id="youtube"
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            field.onChange(extractYouTubeId(e.target.value));
          }}
          onBlur={field.onBlur}
          placeholder="https://www.youtube.com/watch?v=…"
          className={cls(noMatch && "border-red-400")}
        />
        {id ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={youtubeThumbnail(id)}
            alt="Video thumbnail"
            className="h-10 w-16 shrink-0 rounded object-cover"
          />
        ) : null}
      </div>
    </Field>
  );
}
