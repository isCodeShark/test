/**
 * Typed access to public environment variables.
 *
 * NEXT_PUBLIC_* values are inlined at build time, so they must be referenced
 * by their full literal name (no dynamic `process.env[name]` lookups).
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

export function supabaseUrl(): string {
  return required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function supabaseAnonKey(): string {
  return required(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** Canonical origin of this deployment, without a trailing slash. */
export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

/** Host (hostname[:port]) of the canonical deployment. */
export function siteHost(): string {
  return new URL(siteUrl()).host;
}

/** Optional root domain for {slug}.<root> subdomains. */
export function rootDomain(): string | null {
  const raw = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim().toLowerCase();
  return raw ? raw : null;
}
