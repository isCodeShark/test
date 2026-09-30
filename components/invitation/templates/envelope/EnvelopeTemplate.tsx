"use client";

import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { dateText, timeText } from "@/lib/sites/display";
import { buildMapUrl } from "@/lib/sites/map-url";
import type { SiteConfig } from "@/lib/sites/schema";
import styles from "./Envelope.module.css";

export type EnvelopeTemplateProps = {
  config: SiteConfig;
  open: boolean;
  onOpen: () => void;
  mode: "live" | "preview";
  /** href for the date link (.ics download). Empty disables the link. */
  icsHref: string;
  icsFilename: string;
  /** Rendered under the venue once the envelope is open (RSVP button). */
  rsvpSlot?: ReactNode;
  /** Floating controls, e.g. the music toggle. */
  controls?: ReactNode;
  /** Overlays such as the RSVP dialog. */
  children?: ReactNode;
};

function cx(...names: Array<string | false | undefined>) {
  return names.filter(Boolean).join(" ");
}

export function EnvelopeTemplate({
  config,
  open,
  onOpen,
  mode,
  icsHref,
  icsFilename,
  rsvpSlot,
  controls,
  children,
}: EnvelopeTemplateProps) {
  const themeVars = {
    "--bg-color": config.theme.bg,
    "--accent-color": config.theme.accent,
    "--gold": config.theme.gold,
    "--text-color": config.theme.text,
  } as CSSProperties;

  const mapUrl = buildMapUrl(config.venue);
  const date = dateText(config);
  const time = timeText(config);

  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (open) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen();
    }
  };

  const opener =
    config.opener.mode === "bismillah" ? (
      <div className={styles.bismillah} aria-label="Bismillah">
        ﷽
      </div>
    ) : config.opener.mode === "custom" && config.opener.text.trim() ? (
      <div className={styles.bismillah}>{config.opener.text}</div>
    ) : null;

  const venueInner = (
    <>
      {config.venue.name.trim() ? <p className={styles.venueName}>{config.venue.name}</p> : null}
      {config.venue.address.trim() ? (
        <p className={styles.venueAddress}>{config.venue.address}</p>
      ) : null}
    </>
  );

  return (
    <div
      className={cx(styles.stage, mode === "preview" && styles.stagePreview)}
      style={themeVars}
      data-open={open ? "true" : "false"}
    >
      <div className={styles.container}>
        <p className={cx(styles.instruction, open && styles.instructionHidden)} aria-hidden={open}>
          Tap the seal to open
        </p>
        <div
          className={cx(styles.envelopeWrapper, open && styles.open)}
          role={open ? undefined : "button"}
          tabIndex={open ? -1 : 0}
          aria-label={open ? undefined : "Open wedding invitation"}
          onClick={open ? undefined : onOpen}
          onKeyDown={handleKey}
        >
          <div className={styles.envelope}>
            <div className={styles.envelopeBack} />

            <div className={styles.card}>
              {/* Opaque cover that hides text until opened */}
              <div className={styles.cardCover} />

              <div className={styles.cardContent} aria-hidden={!open}>
                {opener}
                {config.headerLine.trim() ? (
                  <div className={styles.headerText}>
                    <p>{config.headerLine}</p>
                  </div>
                ) : null}

                <div className={styles.names}>
                  <h1>{config.groom.name}</h1>
                  {config.groom.parentsLine.trim() ? (
                    <p className={styles.parentText}>{config.groom.parentsLine}</p>
                  ) : null}

                  <p className={styles.ampersand}>&amp;</p>

                  <h1>{config.bride.name}</h1>
                  {config.bride.parentsLine.trim() ? (
                    <p className={styles.parentText}>{config.bride.parentsLine}</p>
                  ) : null}
                </div>

                <div className={styles.detailsSection}>
                  <div className={styles.details}>
                    {icsHref ? (
                      <a
                        className={styles.date}
                        href={icsHref}
                        download={icsFilename}
                        title="Add to calendar"
                        tabIndex={open ? 0 : -1}
                      >
                        {date}
                      </a>
                    ) : (
                      <p className={styles.date}>{date}</p>
                    )}
                    {time ? <p className={styles.time}>{time}</p> : null}
                  </div>

                  <div className={styles.separatorLine} />

                  {mapUrl ? (
                    <a
                      className={styles.venue}
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open in maps"
                      tabIndex={open ? 0 : -1}
                    >
                      {venueInner}
                    </a>
                  ) : (
                    <div className={styles.venue}>{venueInner}</div>
                  )}

                  {rsvpSlot}
                </div>
              </div>
            </div>

            {/* Golden Gatefold Doors */}
            <div className={styles.gates}>
              <div className={cx(styles.gate, styles.leftGate)} />
              <div className={cx(styles.gate, styles.rightGate)} />
            </div>

            <div className={styles.waxSeal} />
          </div>
        </div>
      </div>

      {open && controls ? <div className={styles.controls}>{controls}</div> : null}
      {children}
    </div>
  );
}
