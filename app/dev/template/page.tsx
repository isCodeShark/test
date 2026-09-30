import { notFound } from "next/navigation";
import { Invitation } from "@/components/invitation/Invitation";
import { DEFAULT_CONFIG } from "@/lib/sites/schema";
import { submitRsvp } from "@/app/[slug]/actions";

/** Development-only page for working on the template with the reference data. */
export default function TemplateDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <Invitation
      config={{ ...DEFAULT_CONFIG, music: { youtubeId: "dQw4w9WgXcQ", volume: 30 } }}
      slug="demo"
      mode="live"
      rsvp={{ enabled: true, closed: false }}
      submitRsvp={submitRsvp.bind(null, "demo")}
    />
  );
}
