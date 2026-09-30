import Link from "next/link";
import { cls } from "@/components/ui";
import { siteUrl } from "@/lib/env";
import { coupleNames, dateText } from "@/lib/sites/display";
import { listOwnedSites } from "@/lib/sites/queries";
import { parseConfig } from "@/lib/sites/schema";

export default async function DashboardPage() {
  const sites = await listOwnedSites();
  const base = siteUrl();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Your invitations</h1>
        <Link
          href="/dashboard/sites/new"
          className="rounded-md bg-rose-900 px-4 py-2 text-sm font-medium text-white hover:bg-rose-800"
        >
          New invitation
        </Link>
      </div>

      {sites.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-stone-300 bg-white p-10 text-center">
          <p className="text-stone-700">You have no invitations yet.</p>
          <Link
            href="/dashboard/sites/new"
            className="mt-4 inline-block rounded-md bg-rose-900 px-4 py-2 text-sm font-medium text-white hover:bg-rose-800"
          >
            Create your invitation
          </Link>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {sites.map((site) => {
            const config = parseConfig(site.config);
            return (
              <li key={site.id} className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold">{coupleNames(config)}</h2>
                    <p className="truncate text-sm text-stone-500">{dateText(config)}</p>
                    <p className="mt-1 truncate font-mono text-xs text-stone-500">
                      {base}/{site.slug}
                    </p>
                  </div>
                  <span
                    className={cls(
                      "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                      site.published ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-700",
                    )}
                  >
                    {site.published ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-stone-600">
                  {site.rsvpCount} {site.rsvpCount === 1 ? "RSVP" : "RSVPs"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  <Link
                    href={`/dashboard/sites/${site.id}`}
                    className="rounded-md bg-rose-900 px-3 py-1.5 font-medium text-white hover:bg-rose-800"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/dashboard/sites/${site.id}/rsvps`}
                    className="rounded-md border border-stone-300 px-3 py-1.5 hover:bg-stone-50"
                  >
                    RSVPs
                  </Link>
                  <a
                    href={`/${site.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-stone-300 px-3 py-1.5 hover:bg-stone-50"
                  >
                    {site.published ? "Open" : "Preview"}
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
