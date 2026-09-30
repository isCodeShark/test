import type { Metadata } from "next";
import Link from "next/link";
import { siteUrl } from "@/lib/env";
import { NewSiteForm } from "./NewSiteForm";

export const metadata: Metadata = { title: "New invitation" };

export default function NewSitePage() {
  return (
    <div className="mx-auto max-w-xl">
      <Link href="/dashboard" className="text-sm text-stone-500 hover:text-stone-800">
        ← Back to dashboard
      </Link>
      <h1 className="mt-3 text-2xl font-semibold">Create your invitation</h1>
      <p className="mt-1 text-sm text-stone-600">
        Just the basics for now. You can change everything, including the address, in the editor.
      </p>
      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <NewSiteForm siteUrl={siteUrl()} />
      </div>
    </div>
  );
}
