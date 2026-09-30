import type { Metadata } from "next";
import Link from "next/link";
import { safeNext } from "@/lib/auth/safe-next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

const ERRORS: Record<string, string> = {
  link: "That sign-in link is invalid or has expired. Request a new one.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = safeNext(typeof params.next === "string" ? params.next : null);
  const errorKey = typeof params.error === "string" ? params.error : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
        <Link href="/" className="text-xs uppercase tracking-widest text-stone-500">
          Wedding Invites
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-stone-900">Sign in</h1>
        <p className="mt-1 text-sm text-stone-600">
          Manage your invitation and see who has RSVP&apos;d.
        </p>
        <div className="mt-6">
          <LoginForm next={next} error={errorKey ? ERRORS[errorKey] ?? "Sign-in failed." : undefined} />
        </div>
      </div>
    </main>
  );
}
