import { buildIcs } from "@/lib/ics/build-ics";
import { coupleNames, siteDescription } from "./display";
import type { SiteConfig } from "./schema";

/** The calendar file for a site, shared by the .ics route and the preview. */
export function siteIcs(input: {
  uid: string;
  config: SiteConfig;
  url?: string;
  dtstamp?: Date;
}): string {
  const { config } = input;
  const header = config.headerLine.trim();
  return buildIcs({
    uid: input.uid,
    title: header ? `${header} ${coupleNames(config)}` : `${coupleNames(config)} - Wedding`,
    description: siteDescription(config) + (input.url ? `\n${input.url}` : ""),
    location: [config.venue.name, config.venue.address]
      .map((s) => s.trim())
      .filter(Boolean)
      .join(", "),
    url: input.url,
    startsAt: config.event.startsAt,
    durationMinutes: config.event.durationMinutes,
    dtstamp: input.dtstamp,
  });
}
