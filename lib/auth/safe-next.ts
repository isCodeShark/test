/**
 * Only allow same-origin, path-only redirect targets after login.
 * Rejects absolute URLs and protocol-relative `//evil.com` forms.
 */
export function safeNext(raw: string | null | undefined, fallback = "/dashboard"): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  if (/[\r\n]/.test(raw)) return fallback;
  return raw;
}
