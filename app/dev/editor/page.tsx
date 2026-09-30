import { notFound } from "next/navigation";
import { SiteEditor } from "@/components/editor/SiteEditor";
import { siteUrl } from "@/lib/env";
import { DEFAULT_CONFIG } from "@/lib/sites/schema";

/** Development-only page for working on the editor UI without a database. Saving fails here. */
export default function EditorDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <main className="mx-auto max-w-6xl px-4 py-8">
        <SiteEditor
          site={{
            id: "00000000-0000-0000-0000-000000000000",
            slug: "rafid-and-shanice",
            published: false,
            rsvpEnabled: true,
            rsvpDeadline: null,
            config: DEFAULT_CONFIG,
          }}
          siteUrl={siteUrl()}
        />
      </main>
    </div>
  );
}
