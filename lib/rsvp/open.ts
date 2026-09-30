/** Whether guests may currently RSVP to a site. Mirrors the RLS insert policy. */
export function rsvpOpen(
  site: { published: boolean; rsvp_enabled: boolean; rsvp_deadline: string | null },
  now: number = Date.now(),
): boolean {
  if (!site.published || !site.rsvp_enabled) return false;
  if (site.rsvp_deadline && new Date(site.rsvp_deadline).getTime() <= now) return false;
  return true;
}
