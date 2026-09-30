import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/auth/safe-next";
import { createClient } from "@/lib/supabase/server";

/**
 * Magic-link landing. Supports both flows Supabase may send:
 * - PKCE: `?code=...` (same browser that requested the link)
 * - Token hash: `?token_hash=...&type=magiclink` (works across browsers;
 *   requires the email template to link here with those params)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNext(searchParams.get("next"));

  const supabase = await createClient();

  let failed = true;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    failed = Boolean(error);
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    failed = Boolean(error);
  }

  if (failed) {
    const login = new URL("/login", request.url);
    login.searchParams.set("error", "link");
    login.searchParams.set("next", next);
    return NextResponse.redirect(login);
  }

  return NextResponse.redirect(new URL(next, request.url));
}
