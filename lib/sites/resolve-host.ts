import { isValidSlug } from "./slug";

/**
 * Decide how a request's Host header maps to a site.
 *
 * - `app`: the primary deployment host; routes by path (`/{slug}`).
 * - `subdomain`: `{slug}.{rootDomain}`; the proxy rewrites to `/{slug}`.
 * - `custom`: any other host, reserved for custom domains (v1 falls through).
 *
 * Pure and edge-safe so it can run in the proxy and be unit-tested.
 */
export type HostDecision =
  | { kind: "app" }
  | { kind: "subdomain"; slug: string }
  | { kind: "custom"; host: string };

export type HostEnv = {
  /** Hosts (hostname[:port]) that serve the app itself. */
  appHosts: readonly string[];
  /** Root domain for `{slug}.{root}` sites, or null when disabled. */
  rootDomain: string | null;
};

function normalizeHost(raw: string | null | undefined): string {
  if (!raw) return "";
  // Host may include a port; the first value wins if a list was forwarded.
  const first = raw.split(",")[0].trim().toLowerCase();
  return first.replace(/:\d+$/, "");
}

export function resolveHost(rawHost: string | null | undefined, env: HostEnv): HostDecision {
  const host = normalizeHost(rawHost);
  if (!host) return { kind: "app" };

  if (host === "localhost" || host.endsWith(".localhost")) return { kind: "app" };
  if (host.endsWith(".vercel.app")) return { kind: "app" };

  const appHosts = env.appHosts.map((h) => normalizeHost(h));
  if (appHosts.includes(host)) return { kind: "app" };

  const root = env.rootDomain ? normalizeHost(env.rootDomain) : null;
  if (root) {
    if (host === root || host === `www.${root}`) return { kind: "app" };
    if (host.endsWith(`.${root}`)) {
      const label = host.slice(0, -(root.length + 1));
      if (!label.includes(".") && isValidSlug(label)) {
        return { kind: "subdomain", slug: label };
      }
      // Unknown or invalid label under our root: treat as the app.
      return { kind: "app" };
    }
  }

  return { kind: "custom", host };
}
