import { z } from "zod";

/** Guest input from the RSVP form (FormData strings). */
export const RsvpInputSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(120, "That name is too long"),
  attending: z.enum(["yes", "no"], { message: "Let us know if you can make it" }),
  guests: z.coerce.number().int().min(0).max(20).default(1),
  dietary: z.string().trim().max(500, "Please keep this under 500 characters").default(""),
  message: z.string().trim().max(1000, "Please keep this under 1000 characters").default(""),
  /** Honeypot: real guests never fill this in. */
  website: z.string().max(0).optional(),
});

export type RsvpInput = z.infer<typeof RsvpInputSchema>;

export type RsvpState =
  | { status: "idle" }
  | { status: "ok"; name: string; attending: boolean }
  | { status: "closed" }
  | { status: "error"; message: string; field?: string };

export const RSVP_IDLE: RsvpState = { status: "idle" };

export type RsvpAction = (prev: RsvpState, formData: FormData) => Promise<RsvpState>;

export function rsvpStorageKey(slug: string): string {
  return `rsvp:${slug}`;
}
