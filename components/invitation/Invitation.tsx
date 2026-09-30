"use client";

import { useCallback, useMemo, useState } from "react";
import { icsDataUrl } from "@/lib/ics/build-ics";
import { dateText } from "@/lib/sites/display";
import { siteIcs } from "@/lib/sites/event";
import type { SiteConfig } from "@/lib/sites/schema";
import type { RsvpAction } from "@/lib/rsvp/schema";
import { BackgroundMusic, MusicPlaceholder } from "./BackgroundMusic";
import { fireConfetti } from "./confetti";
import { RsvpDialog } from "./RsvpDialog";
import { EnvelopeTemplate } from "./templates/envelope/EnvelopeTemplate";
import styles from "./templates/envelope/Envelope.module.css";

export type InvitationProps = {
  config: SiteConfig;
  slug: string;
  /** "live" on the public page, "preview" inside the editor. */
  mode: "live" | "preview";
  /** Start already opened (editor toggle). */
  defaultOpen?: boolean;
  /** Origin used for the .ics link and description on the live page. */
  siteUrl?: string;
  /** RSVP availability; omit to hide the RSVP button entirely. */
  rsvp?: { enabled: boolean; closed: boolean };
  /** Server action bound to the slug (live page only). */
  submitRsvp?: RsvpAction;
};

export function Invitation({
  config,
  slug,
  mode,
  defaultOpen = false,
  siteUrl = "",
  rsvp,
  submitRsvp,
}: InvitationProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [rsvpOpen, setRsvpOpen] = useState(false);

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

  const rsvpSlot = rsvp?.enabled ? (
    rsvp.closed ? (
      <p className={styles.rsvpClosed}>RSVPs are closed</p>
    ) : (
      <button
        type="button"
        className={styles.rsvpButton}
        onClick={() => setRsvpOpen(true)}
        tabIndex={open ? 0 : -1}
      >
        RSVP
      </button>
    )
  ) : null;

  const controls = config.music.youtubeId ? (
    mode === "live" ? (
      <BackgroundMusic youtubeId={config.music.youtubeId} volume={config.music.volume} />
    ) : (
      <MusicPlaceholder />
    )
  ) : null;

  return (
    <EnvelopeTemplate
      config={config}
      open={open}
      onOpen={handleOpen}
      mode={mode}
      icsHref={dateText(config) ? icsHref : ""}
      icsFilename={icsFilename}
      rsvpSlot={rsvpSlot}
      controls={controls}
    >
      {rsvp?.enabled && !rsvp.closed ? (
        <RsvpDialog
          open={rsvpOpen}
          onClose={() => setRsvpOpen(false)}
          config={config}
          slug={slug}
          action={mode === "live" ? submitRsvp : undefined}
        />
      ) : null}
    </EnvelopeTemplate>
  );
}
