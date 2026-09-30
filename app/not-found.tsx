import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-6 text-center text-stone-900">
      <p className="text-xs uppercase tracking-[0.3em] text-stone-500">404</p>
      <h1 className="mt-3 text-2xl font-semibold">Page not found</h1>
      <Link href="/" className="mt-6 text-sm text-rose-900 underline underline-offset-4">
        Back to home
      </Link>
    </main>
  );
}
