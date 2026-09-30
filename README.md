# Wedding Invites

A generator for digital wedding invitation websites. A couple signs in, customizes the
wording, date, venue, colors and music of an envelope-style invitation with a live preview,
publishes it to a link they can share on WhatsApp, and collects RSVPs in a dashboard.

The design is the envelope in `Reference/` (kept in the repo, untouched, as the design
reference): a wax seal the guest taps, gold gatefold doors that slide open, confetti, and a
card with the couple's details.

## What guests get

- Tap-to-open envelope animation with confetti.
- Tap the **date** to download a calendar file (`.ics`).
- Tap the **venue** to open it in Google Maps.
- Background music (a YouTube link) that starts when the envelope opens, with a mute toggle.
- An **RSVP** button: name, attending yes/no, number of guests, dietary needs, a message.
- Link previews (Open Graph) so the invitation looks good when shared.

## What the couple gets

- Email magic-link sign-in (no passwords).
- Editor with live phone-sized preview: opening line, header, names, parents, date and time
  with time zone, venue and map link, YouTube music, colors, RSVP settings, sharing text.
- Publish / unpublish, choose the web address (`/rafid-and-shanice`).
- RSVP dashboard with totals (responses, attending, declined, guests) and CSV export.

## Stack

Next.js 16 (App Router, TypeScript, Tailwind for the dashboard UI), Supabase (Postgres,
Auth, row-level security), zod, react-hook-form, date-fns, canvas-confetti, vitest.
Deployed on Vercel.

## Local development

Prerequisites: Node 20+ and a Supabase project (free tier is fine).

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create the database schema. In the Supabase dashboard open **SQL Editor**, paste the
   contents of `supabase/migrations/20260930000000_init.sql` and run it. (Or, with the
   Supabase CLI linked to your project, run `supabase db push`.)

3. Configure Auth. In **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:3000` for local work (your production URL later).
   - **Redirect URLs**: add `http://localhost:3000/auth/callback` and, later,
     `https://<your-domain>/auth/callback`.

   Optional but recommended so magic links also work when opened in a different browser or
   an in-app mail browser: in **Authentication → Email Templates → Magic Link**, change the
   link to

   ```
   {{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=magiclink&next=/dashboard
   ```

4. Create `.env.local` from the example and fill in your project's values
   (**Project Settings → API**):

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Purpose |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The anon (public) API key. Row-level security does the access control; no service-role key is used. |
   | `NEXT_PUBLIC_SITE_URL` | Canonical origin of this deployment, no trailing slash. Used for magic-link redirects, link previews and the calendar file. |
   | `NEXT_PUBLIC_ROOT_DOMAIN` | Optional. When set, `{slug}.<root>` is served as `/{slug}` (needs a wildcard domain on Vercel). Leave unset. |

5. Run it:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000, sign in with your email, and create an invitation.
   Two development-only pages help when working on the design without a database:
   `/dev/template` (the invitation with reference data) and `/dev/editor` (the editor UI;
   saving fails there by design).

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (also type-checks) |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate route types and run `tsc` |
| `npm test` | Unit tests (vitest): slug rules, host resolver, config schema, date/time, `.ics` builder, CSV, YouTube id parsing |

## Deploying to Vercel

1. Create a Vercel project for this repo (framework preset: Next.js). If you reuse the old
   static `rs-wedding-invitation` project, change its framework preset to Next.js first.
2. Add the environment variables from the table above. Set `NEXT_PUBLIC_SITE_URL` to the
   production URL (for example `https://invites.example.com`).
3. In Supabase, set the **Site URL** to the production URL and add
   `https://<production-host>/auth/callback` to the redirect URLs.
4. Deploy:

   ```bash
   vercel --prod
   ```

Preview deployments share the production Supabase project; magic links requested from a
preview URL redirect to `NEXT_PUBLIC_SITE_URL`, so use production for sign-in testing or
set a per-environment `NEXT_PUBLIC_SITE_URL`.

## How it is put together

```
app/
  [slug]/            public invitation page, RSVP server action, /event.ics
  dashboard/         site list, create flow, editor, RSVP table and CSV export
  login, auth/       magic-link sign-in, callback, sign-out
  dev/               development-only pages (404 in production)
components/
  invitation/        Invitation (state), the envelope template + CSS module, RSVP dialog,
                     background music player, confetti
  editor/            SiteEditor form, PreviewFrame (scaled phone), field components
  dashboard/         RSVP table and totals
lib/
  sites/             SiteConfig zod schema + defaults, slug rules, host resolver, queries,
                     date/time helpers, display text, map URL, YouTube id parsing
  rsvp/              RSVP input schema, open/closed rule, CSV helpers
  ics/               RFC 5545 calendar builder
  supabase/          browser/server/proxy clients and hand-written database types
proxy.ts             session refresh, /dashboard guard, subdomain rewrite
supabase/migrations/ schema and row-level security policies
Reference/           the original static design, kept as the reference
```

Access control lives in the database (`supabase/migrations/…_init.sql`): owners can read
and change only their own sites and RSVPs; anyone can read a published site; anonymous
guests can insert an RSVP only while a site is published, RSVP-enabled and before its
deadline. Unpublished sites are visible only to their owner (with a "Draft" ribbon).

## Later: subdomains and custom domains

Site lookup is already host-aware. To serve `rafid-and-shanice.<root>`:

1. Add the wildcard domain `*.<root>` to the Vercel project.
2. Set `NEXT_PUBLIC_ROOT_DOMAIN=<root>`.

The proxy rewrites such hosts to `/{slug}` (`lib/sites/resolve-host.ts`). For a couple's
own domain, attach it to the Vercel project (Domains API), store it in the site's
`custom_domain` column and extend the proxy's `custom` branch to look the host up and
rewrite the same way.

## Known limitations (v1)

- One design template (the reference envelope).
- Supabase's built-in email sender is rate-limited (a few emails per hour); configure
  custom SMTP for real use.
- RSVP spam protection is a honeypot plus length limits; no CAPTCHA.
- No image uploads yet: the seal and pattern are the reference assets.
