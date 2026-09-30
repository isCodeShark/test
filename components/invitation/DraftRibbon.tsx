import Link from "next/link";

/** Shown to the owner when viewing an unpublished site at its real URL. */
export function DraftRibbon({ siteId }: { siteId: string }) {
  return (
    <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-3 bg-amber-400 px-4 py-2 text-center text-xs font-medium text-amber-950 shadow">
      <span>Draft. Only you can see this page until you publish it.</span>
      <Link href={`/dashboard/sites/${siteId}`} className="underline underline-offset-2">
        Open editor
      </Link>
    </div>
  );
}
