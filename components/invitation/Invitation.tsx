"use client";

import { useCallback, useMemo, useState } from "react";
import { icsDataUrl } from "@/lib/ics/build-ics";
import { dateText } from "@/lib/sites/display";
import { siteIcs } from "@/lib/sites/event";
import type { SiteConfig } from "@/lib/sites/schema";
import { fireConfetti } from "./confetti";
import { EnvelopeTemplate } from "./templates/envelope/EnvelopeTemplate";

export type InvitationProps = {
  config: SiteConfig;
  slug: string;
  /** "live" on the public page, "preview" inside the editor. */
  mode: "live" | "preview";
  /** Start already opened (editor toggle). */
  defaultOpen?: boolean;
  /** Origin used for the .ics link and description on the live page. */
  siteUrl?: string;
};

export function Invitation({ config, slug, mode, defaultOpen = false, siteUrl = "" }: InvitationProps) {
  const [open, setOpen] = useState(defaultOpen);

  const handleOpen = useCallback(() => {
    if (open) return;
    setOpen(true);
    void fireConfetti(config.theme);
  }, [open, config.theme]);

  const icsFilename = `${slug || "wedding"}.ics`;

  // The live page downloads from the server route; the preview builds the
  // same file inline so the link works without a saved site.
  const icsHref = useMemo(() => {
    if (mode === "live") return `/${slug}/event.ics`;
    try {
      const ics = siteIcs({
        uid: `preview-${slug || "site"}@wedding-invites`,
        config,
        url: siteUrl ? `${siteUrl}/${slug}` : undefined,
        // Deterministic so server and client render the same data URL.
        dtstamp: new Date(config.event.startsAt),
      });
      return icsDataUrl(ics);
    } catch {
      return "";
    }
  }, [mode, slug, config, siteUrl]);

  return (
    <EnvelopeTemplate
      config={config}
      open={open}
      onOpen={handleOpen}
      mode={mode}
      icsHref={dateText(config) ? icsHref : ""}
      icsFilename={icsFilename}
    />
  );
}
