grant select on public.factories to anon;
grant select on public.family_businesses to anon;

create policy "Public can view factories"
  on public.factories for select to anon
  using (true);

create policy "Public can view businesses"
  on public.family_businesses for select to anon
  using (true);

alter table public.profiles
  add column if not exists home_featured boolean not null default false,
  add column if not exists home_featured_order integer not null default 999;

alter table public.profiles
  drop constraint if exists profiles_home_featured_order_check;

alter table public.profiles
  add constraint profiles_home_featured_order_check
  check (home_featured_order between 1 and 999);

create index if not exists profiles_home_featured_idx
  on public.profiles (home_featured desc, home_featured_order asc, created_at desc)
  where onboarded = true;

create or replace function public.admin_set_home_featured(
  _profile_id uuid,
  _featured boolean,
  _order integer default 999
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.has_role(auth.uid(), 'admin') then
    raise exception 'Admin access required';
  end if;

  if _order < 1 or _order > 999 then
    raise exception 'Featured order must be between 1 and 999';
  end if;

  update public.profiles
  set home_featured = _featured,
      home_featured_order = _order
  where id = _profile_id;
end;
$$;

revoke all on function public.admin_set_home_featured(uuid, boolean, integer) from public;
grant execute on function public.admin_set_home_featured(uuid, boolean, integer) to authenticated;

drop policy if exists "Public can view factories" on public.factories;
drop policy if exists "Public can view businesses" on public.family_businesses;

revoke select on public.factories from anon;
revoke select on public.family_businesses from anon;

create or replace function public.get_public_directory_counts()
returns table (
  family_businesses bigint,
  vetted_factories bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select count(*) from public.family_businesses),
    (
      select count(*)
      from public.factories
      where website is not null
        and website not ilike '%example.com%'
    );
$$;

revoke all on function public.get_public_directory_counts() from public;
grant execute on function public.get_public_directory_counts() to anon, authenticated;

update public.events
set status = lower(trim(status));

alter table public.events
  add constraint events_status_allowed
  check (status in ('upcoming', 'past'));

alter table public.events
  add constraint events_title_not_blank
  check (length(trim(title)) > 0);

comment on column public.events.status is
  'Controls public placement: upcoming appears in Upcoming / Announced; past appears in Past / Archive.';

alter table public.events
  add column if not exists slug text,
  add column if not exists detail_image_url text,
  add column if not exists summary text,
  add column if not exists body text;

create unique index if not exists events_slug_unique on public.events (slug);

insert into public.events (
  id,
  slug,
  title,
  date_label,
  city,
  status,
  cover_url,
  detail_image_url,
  summary,
  body,
  sort_order
)
values (
  '7a1c2026-0718-4d1e-9a1c-202607180001',
  'waic-2026-founders-dinner',
  'WAIC 2026 Founder’s Dinner',
  'July 18, 2026',
  'Shanghai, China',
  'past',
  '/images/events/waic-founders-dinner-cover.png',
  '/images/events/waic-founders-dinner-detail.jpg',
  'Thirty founders, investors, and researchers gathered for a candid evening during WAIC week.',
  $story$SHANGHAI — July 18, 2026 — During the World Artificial Intelligence Conference (WAIC), the room had the privilege of hosting an invitation-only Founder's Dinner, bringing together 30 accomplished founders, investors, and researchers from across the AI ecosystem. We were humbled by the response: nearly 400 applications came in for just 30 seats, and narrowing the list down was genuinely difficult — a reflection, we believe, not of the room itself, but of how much this community values candid, high-quality conversation during WAIC week.

The evening's guests represented a remarkable range of backgrounds and achievements. Among them were senior executives from leading global technology companies, including one from a formerly NYSE-listed enterprise; PhD researchers from Tsinghua University's top AI labs; partners from top-tier investment institutions; influential technology creators; LP investors backing leading venture capital funds; current leaders of established family businesses; and one of the world's youngest founders to bring a product into clinical trials.

At the room, our aim has always been simple: to create spaces where exceptional people can speak openly and learn from one another. We're grateful to everyone who applied and attended — more than the credentials at the table, what made the evening special was the openness of the conversations, and we hope to carry that spirit into future gatherings hosted by the room.$story$,
  1
)
on conflict (slug) do update set
  title = excluded.title,
  date_label = excluded.date_label,
  city = excluded.city,
  status = excluded.status,
  cover_url = excluded.cover_url,
  detail_image_url = excluded.detail_image_url,
  summary = excluded.summary,
  body = excluded.body,
  sort_order = excluded.sort_order,
  updated_at = now();

delete from public.partners
where
  (
    url = 'https://example.com'
    and name in (
      'NOVAWORKS',
      'ATLAS CAPITAL',
      'HELIOS LABS',
      'MERIDIAN',
      'FORMFACTOR',
      'KILN&CO',
      'PIXELGRAM',
      'NORTHBOUND',
      'OPENSTACK',
      'CIRCLE HOUSE'
    )
  )
  or (
    name = 'NYU CEC'
    and logo_url = '/partners/nyu-entrepreneurship.svg'
  );
