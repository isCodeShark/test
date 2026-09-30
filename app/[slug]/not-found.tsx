import Link from "next/link";

export default function SiteNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_center,#590000_0%,#1a0000_100%)] px-6 text-center text-[#faf9f6]">
      <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">Wedding Invites</p>
      <h1 className="mt-4 font-serif text-3xl">This invitation isn&apos;t here (yet).</h1>
      <p className="mt-3 max-w-md text-sm text-[#faf9f6]/80">
        The link may be mistyped, or the couple hasn&apos;t published their invitation. Ask them
        for the correct link.
      </p>
      <Link href="/" className="mt-8 text-sm text-[#d4af37] underline underline-offset-4">
        Create your own invitation
      </Link>
    </main>
  );
}
