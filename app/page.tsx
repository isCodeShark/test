import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_center,#590000_0%,#1a0000_100%)] px-6 text-center text-[#faf9f6]">
      <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">Wedding Invites</p>
      <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">
        A digital invitation your guests open like an envelope.
      </h1>
      <p className="mt-4 max-w-xl text-base text-[#faf9f6]/80">
        Customize the wording, colors and music, publish to a link you can share on WhatsApp,
        and collect RSVPs in one place.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href={user ? "/dashboard" : "/login"}
          className="rounded-md bg-[#d4af37] px-5 py-2.5 text-sm font-semibold text-[#2b0000] hover:bg-[#e2c15a]"
        >
          {user ? "Go to dashboard" : "Get started"}
        </Link>
      </div>
    </main>
  );
}
