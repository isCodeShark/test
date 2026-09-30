import Link from "next/link";

// Placeholder until Phase 5 adds the site list.
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Your invitations</h1>
      <p className="mt-2 text-sm text-stone-600">You have no invitations yet.</p>
      <Link
        href="/dashboard/sites/new"
        className="mt-6 inline-block rounded-md bg-rose-900 px-4 py-2 text-sm font-medium text-white hover:bg-rose-800"
      >
        Create your invitation
      </Link>
    </div>
  );
}
