/**
 * Link for the clickable venue block. Uses the couple's own map URL when set,
 * otherwise a Google Maps search for "name, address".
 */
export function buildMapUrl(venue: { name: string; address: string; mapUrl: string }): string {
  const custom = venue.mapUrl.trim();
  if (custom) return custom;
  const query = [venue.name.trim(), venue.address.trim()].filter(Boolean).join(", ");
  if (!query) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
