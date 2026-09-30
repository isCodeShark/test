import { DEFAULT_CONFIG, type SiteConfig } from "./schema";

/** Starting config for a fresh site: reference styling, the couple's own details blank. */
export function newSiteConfig(input: {
  groomName: string;
  brideName: string;
  startsAt: string;
  timezone: string;
}): SiteConfig {
  return {
    ...DEFAULT_CONFIG,
    groom: { name: input.groomName, parentsLine: "" },
    bride: { name: input.brideName, parentsLine: "" },
    event: { ...DEFAULT_CONFIG.event, startsAt: input.startsAt, timezone: input.timezone },
    venue: { name: "", address: "", mapUrl: "" },
  };
}
