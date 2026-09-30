"use client";

import { useActionState, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { SiteConfig } from "@/lib/sites/schema";
import { coupleNames } from "@/lib/sites/display";
import { RSVP_IDLE, rsvpStorageKey, type RsvpAction, type RsvpState } from "@/lib/rsvp/schema";
import styles from "./Rsvp.module.css";

const STORAGE_EVENT = "wedding-rsvp-stored";

function subscribeStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
    window.dispatchEvent(new Event(STORAGE_EVENT));
  } catch {
    // Private mode or storage disabled: nothing to remember.
  }
}

async function previewAction(): Promise<RsvpState> {
  return { status: "error", message: "RSVPs work on the published invitation." };
}

export type RsvpDialogProps = {
  open: boolean;
  onClose: () => void;
  config: SiteConfig;
  slug: string;
  /** Server action bound to the slug. Omit in the editor preview. */
  action?: RsvpAction;
};

export function RsvpDialog({ open, onClose, config, slug, action }: RsvpDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  // Remounting the form resets its action state ("send another reply").
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      onClose={onClose}
      onClick={(e) => {
        // Click on the backdrop closes; clicks inside do not.
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="rsvp-title"
    >
      <div className={styles.inner}>
        <p className={styles.eyebrow}>RSVP</p>
        <h2 id="rsvp-title" className={styles.title}>
          {coupleNames(config)}
        </h2>
        <div className={styles.rule} />
        <RsvpForm
          key={formKey}
          config={config}
          slug={slug}
          action={action}
          onClose={onClose}
          onReset={() => setFormKey((k) => k + 1)}
        />
      </div>
    </dialog>
  );
}

function RsvpForm({
  config,
  slug,
  action,
  onClose,
  onReset,
}: {
  config: SiteConfig;
  slug: string;
  action?: RsvpAction;
  onClose: () => void;
  onReset: () => void;
}) {
  const [state, formAction, pending] = useActionState(action ?? previewAction, RSVP_IDLE);
  const [attending, setAttending] = useState<"yes" | "no">("yes");
  const [again, setAgain] = useState(false);
  const key = rsvpStorageKey(slug);
  const stored = useSyncExternalStore(subscribeStorage, () => readStored(key), () => null);

  useEffect(() => {
    if (state.status === "ok" && action) writeStored(key, state.name);
  }, [state, key, action]);

  const isPreview = !action;
  const maxGuests = config.rsvp.maxGuests;

  if (state.status === "ok") {
    return (
      <div className={styles.thanks}>
        <p>
          Thank you, {state.name}!{" "}
          {state.attending
            ? "We can't wait to celebrate with you."
            : "We'll miss you, and thank you for letting us know."}
        </p>
        <div className={styles.actions}>
          <button type="button" className={styles.secondary} onClick={onReset}>
            Send another reply
          </button>
          <button type="button" className={styles.submit} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  if (state.status === "closed") {
    return (
      <div className={styles.thanks}>
        <p>RSVPs have closed. Please reach out to the couple directly.</p>
        <div className={styles.actions}>
          <button type="button" className={styles.submit} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction}>
      {stored && !again ? (
        <p className={styles.hint}>
          You already replied as {stored}.{" "}
          <button type="button" onClick={() => setAgain(true)}>
            Reply for someone else
          </button>
        </p>
      ) : null}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="rsvp-name">
          Your name
        </label>
        <input
          id="rsvp-name"
          name="name"
          className={styles.input}
          required
          maxLength={120}
          autoComplete="name"
          disabled={isPreview}
        />
      </div>

      <div className={styles.field}>
        <span className={styles.label}>Will you attend?</span>
        <div className={styles.choices} role="radiogroup" aria-label="Will you attend?">
          <label className={styles.choice}>
            <input
              type="radio"
              name="attending"
              value="yes"
              checked={attending === "yes"}
              onChange={() => setAttending("yes")}
              disabled={isPreview}
            />
            Joyfully yes
          </label>
          <label className={styles.choice}>
            <input
              type="radio"
              name="attending"
              value="no"
              checked={attending === "no"}
              onChange={() => setAttending("no")}
              disabled={isPreview}
            />
            Regretfully no
          </label>
        </div>
      </div>

      {attending === "yes" ? (
        <div className={styles.field}>
          <label className={styles.label} htmlFor="rsvp-guests">
            Number of guests (including you)
          </label>
          <input
            id="rsvp-guests"
            name="guests"
            type="number"
            className={styles.input}
            min={1}
            max={maxGuests}
            defaultValue={1}
            inputMode="numeric"
            disabled={isPreview}
          />
        </div>
      ) : (
        <input type="hidden" name="guests" value="0" />
      )}

      {config.rsvp.dietaryPrompt.trim() ? (
        <div className={styles.field}>
          <label className={styles.label} htmlFor="rsvp-dietary">
            {config.rsvp.dietaryPrompt}
          </label>
          <textarea
            id="rsvp-dietary"
            name="dietary"
            className={styles.textarea}
            maxLength={500}
            disabled={isPreview}
          />
        </div>
      ) : null}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="rsvp-message">
          A note for the couple (optional)
        </label>
        <textarea
          id="rsvp-message"
          name="message"
          className={styles.textarea}
          maxLength={1000}
          disabled={isPreview}
        />
      </div>

      <div className={styles.honeypot} aria-hidden="true">
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state.status === "error" ? (
        <p className={styles.error} role="alert">
          {state.message}
        </p>
      ) : null}
      {isPreview ? <p className={styles.hint}>Guests can reply here on the published invitation.</p> : null}

      <div className={styles.actions}>
        <button type="button" className={styles.secondary} onClick={onClose}>
          Not now
        </button>
        <button type="submit" className={styles.submit} disabled={pending || isPreview}>
          {pending ? "Sending…" : "Send RSVP"}
        </button>
      </div>
    </form>
  );
}
