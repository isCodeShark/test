"use client";

import { useActionState, useMemo, useState, useSyncExternalStore } from "react";
import { Button, Field, Input, Select } from "@/components/ui";
import { browserTimeZone, timeZoneOptions } from "@/lib/sites/datetime";
import { slugify, suggestSlug } from "@/lib/sites/slug";
import { createSite, type NewSiteState } from "./actions";

const noop = () => () => {};

export function NewSiteForm({ siteUrl }: { siteUrl: string }) {
  const [state, action, pending] = useActionState(createSite, {} as NewSiteState);
  const [groom, setGroom] = useState("");
  const [bride, setBride] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const zones = useMemo(() => timeZoneOptions(), []);
  // Server renders UTC; the browser's zone takes over on hydration.
  const detectedTz = useSyncExternalStore(noop, browserTimeZone, () => "UTC");

  const updateNames = (nextGroom: string, nextBride: string) => {
    setGroom(nextGroom);
    setBride(nextBride);
    if (!slugTouched) setSlug(nextGroom || nextBride ? suggestSlug(nextGroom, nextBride) : "");
  };

  const errors = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Groom's name" htmlFor="groomName" error={errors.groomName}>
          <Input
            id="groomName"
            name="groomName"
            required
            value={groom}
            onChange={(e) => updateNames(e.target.value, bride)}
            placeholder="Rafid"
          />
        </Field>
        <Field label="Bride's name" htmlFor="brideName" error={errors.brideName}>
          <Input
            id="brideName"
            name="brideName"
            required
            value={bride}
            onChange={(e) => updateNames(groom, e.target.value)}
            placeholder="Shanice"
          />
        </Field>
      </div>

      <Field
        label="Web address"
        htmlFor="slug"
        error={errors.slug}
        hint={
          <>
            Guests will open <span className="font-mono">{siteUrl}/{slug || "your-names"}</span>
          </>
        }
      >
        <Input
          id="slug"
          name="slug"
          required
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value.replace(/\s+$/, "-")));
          }}
          placeholder="rafid-and-shanice"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date and time" htmlFor="date" error={errors.date}>
          <Input id="date" name="date" type="datetime-local" required />
        </Field>
        <Field label="Time zone" htmlFor="timezone" error={errors.timezone}>
          <Select id="timezone" name="timezone" key={detectedTz} defaultValue={detectedTz}>
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create invitation"}
      </Button>
    </form>
  );
}
