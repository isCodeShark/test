-- Wedding invitation generator: initial schema.
-- Apply with `supabase db push` or paste into the Supabase SQL editor.

-- ---------------------------------------------------------------------------
-- sites: one row per invitation website
-- ---------------------------------------------------------------------------
create table public.sites (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users (id) on delete cascade,
  -- DNS-label slug so it can later double as a subdomain. Keep the regex and
  -- reserved list in sync with lib/sites/slug.ts.
  slug          text not null unique
                check (
                  slug ~ '^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$'
                  and slug <> all (array[
                    'dashboard', 'login', 'auth', 'api', 'admin', 'www', 'app',
                    'new', 'sites', 'assets', 'static', 'favicon.ico',
                    'robots.txt', 'sitemap.xml', 'manifest.json',
                    'opengraph-image', '_next'
                  ])
                ),
  -- Reserved for custom domains (not used in v1).
  custom_domain text unique,
  template      text not null default 'envelope-v1',
  published     boolean not null default false,
  rsvp_enabled  boolean not null default true,
  rsvp_deadline timestamptz,
  -- Everything the template renders (names, event, venue, theme, ...).
  -- Validated by SiteConfigSchema in lib/sites/schema.ts.
  config        jsonb not null default '{}'::jsonb
                check (jsonb_typeof(config) = 'object'),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index sites_owner_id_idx on public.sites (owner_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

create trigger sites_set_updated_at
  before update on public.sites
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- rsvps: guest responses, inserted anonymously from the public page
-- ---------------------------------------------------------------------------
create table public.rsvps (
  id         uuid primary key default gen_random_uuid(),
  site_id    uuid not null references public.sites (id) on delete cascade,
  name       text not null check (char_length(name) between 1 and 120),
  attending  boolean not null,
  guests     smallint not null default 1 check (guests between 0 and 20),
  dietary    text check (dietary is null or char_length(dietary) <= 500),
  message    text check (message is null or char_length(message) <= 1000),
  created_at timestamptz not null default now()
);

create index rsvps_site_id_created_at_idx on public.rsvps (site_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.sites enable row level security;
alter table public.rsvps enable row level security;

-- Owners see and manage their own sites.
create policy "sites: owner select"
  on public.sites for select
  to authenticated
  using (owner_id = (select auth.uid()));

create policy "sites: owner insert"
  on public.sites for insert
  to authenticated
  with check (owner_id = (select auth.uid()));

create policy "sites: owner update"
  on public.sites for update
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "sites: owner delete"
  on public.sites for delete
  to authenticated
  using (owner_id = (select auth.uid()));

-- Anyone can read a published site (the public invitation page).
create policy "sites: public select published"
  on public.sites for select
  to anon, authenticated
  using (published);

-- Anyone may RSVP to a published site while RSVPs are open.
-- The subquery runs as the caller, who can read published sites via the
-- policy above, so no security definer function is needed.
create policy "rsvps: public insert while open"
  on public.rsvps for insert
  to anon, authenticated
  with check (
    exists (
      select 1
      from public.sites s
      where s.id = site_id
        and s.published
        and s.rsvp_enabled
        and (s.rsvp_deadline is null or s.rsvp_deadline > now())
    )
  );

-- Owners read and delete the RSVPs for their sites.
create policy "rsvps: owner select"
  on public.rsvps for select
  to authenticated
  using (
    exists (
      select 1 from public.sites s
      where s.id = site_id and s.owner_id = (select auth.uid())
    )
  );

create policy "rsvps: owner delete"
  on public.rsvps for delete
  to authenticated
  using (
    exists (
      select 1 from public.sites s
      where s.id = site_id and s.owner_id = (select auth.uid())
    )
  );
