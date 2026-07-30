-- roles
create type public.app_role as enum ('admin','moderator','user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users can view their own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "Admins can view all roles" on public.user_roles for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins can manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

insert into public.user_roles (user_id, role)
select id, 'admin'::app_role from auth.users where email = 'dsydongshiyu@gmail.com'
on conflict do nothing;

-- events
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date_label text not null default '',
  city text not null default '',
  status text not null default 'upcoming',
  cover_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.events to anon;
grant select, insert, update, delete on public.events to authenticated;
grant all on public.events to service_role;
alter table public.events enable row level security;
create policy "Events are viewable by everyone" on public.events for select using (true);
create policy "Admins manage events" on public.events for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- guests
create table public.guests (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Coming Soon',
  title text not null default '',
  event text not null default '',
  date_label text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.guests to anon;
grant select, insert, update, delete on public.guests to authenticated;
grant all on public.guests to service_role;
alter table public.guests enable row level security;
create policy "Guests are viewable by everyone" on public.guests for select using (true);
create policy "Admins manage guests" on public.guests for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- event photos
create table public.event_photos (
  id uuid primary key default gen_random_uuid(),
  src text not null,
  caption text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.event_photos to anon;
grant select, insert, update, delete on public.event_photos to authenticated;
grant all on public.event_photos to service_role;
alter table public.event_photos enable row level security;
create policy "Photos are viewable by everyone" on public.event_photos for select using (true);
create policy "Admins manage photos" on public.event_photos for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- factories (members only)
create table public.factories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default '',
  location text not null default '',
  moq text not null default '',
  notes text not null default '',
  website text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.factories to authenticated;
grant all on public.factories to service_role;
alter table public.factories enable row level security;
create policy "Members can view factories" on public.factories for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_member = true) or public.has_role(auth.uid(),'admin'));
create policy "Admins manage factories" on public.factories for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- partners
create table public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tier text not null default 'silver',
  blurb text not null default '',
  url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.partners to anon;
grant select, insert, update, delete on public.partners to authenticated;
grant all on public.partners to service_role;
alter table public.partners enable row level security;
create policy "Partners are viewable by everyone" on public.partners for select using (true);
create policy "Admins manage partners" on public.partners for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- updated_at triggers
create trigger events_updated_at before update on public.events for each row execute function public.set_updated_at();
create trigger guests_updated_at before update on public.guests for each row execute function public.set_updated_at();
create trigger event_photos_updated_at before update on public.event_photos for each row execute function public.set_updated_at();
create trigger factories_updated_at before update on public.factories for each row execute function public.set_updated_at();
create trigger partners_updated_at before update on public.partners for each row execute function public.set_updated_at();

-- admin management of members / businesses
create policy "Admins can view all profiles" on public.profiles for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins can update any profile" on public.profiles for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Admins can delete profiles" on public.profiles for delete to authenticated using (public.has_role(auth.uid(),'admin'));
grant delete on public.profiles to authenticated;
create policy "Admins manage family businesses" on public.family_businesses for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- seed current site content
insert into public.events (title, date_label, city, status, cover_url, sort_order) values
 ('The Room Opening: Our First Guest','Sep 15','Boston','upcoming','https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1200&auto=format&fit=crop&q=70',1),
 ('How to Raise Funding','Oct 15','Boston','upcoming','https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200&auto=format&fit=crop&q=70',2),
 ('How to Take a Company Public','Nov 15','Boston','upcoming','https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&auto=format&fit=crop&q=70',3);

insert into public.guests (name, title, event, date_label, sort_order) values
 ('Coming Soon','Guest speaker TBA','The Room Opening: Our First Guest','Sep 15',1),
 ('Coming Soon','Guest speaker TBA','How to Raise Funding','Oct 15',2),
 ('Coming Soon','Guest speaker TBA','How to Take a Company Public','Nov 15',3);

insert into public.event_photos (src, caption, sort_order) values
 ('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1000&auto=format&fit=crop&q=70','Founders Dinner No. 06 — Tokyo',1),
 ('https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=1000&auto=format&fit=crop&q=70','Workshop: Small-batch dye',2),
 ('https://images.unsplash.com/photo-1515169067868-5387ec356754?w=1000&auto=format&fit=crop&q=70','Studio visit — Lisbon',3),
 ('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000&auto=format&fit=crop&q=70','The Room Spring Social — NYC',4),
 ('https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1000&auto=format&fit=crop&q=70','Factory tour — Guangzhou',5),
 ('https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1000&auto=format&fit=crop&q=70','Coffee Hour — Paris',6);

insert into public.factories (name, category, location, moq, notes, website, sort_order) values
 ('Nanhai Knit Works','Knitwear','Foshan, CN','150 / color','Great with merino & recycled cotton blends.','https://example.com',1),
 ('Porto Cut & Sew','Apparel','Porto, PT','100 pcs','Family-run, strong on shirting.','https://example.com',2),
 ('Aegean Ceramics','Home / Ceramics','Izmir, TR','300 pcs','Hand-thrown small batches, kind lead times.','https://example.com',3),
 ('Kobe Paperworks','Packaging','Kobe, JP','500 pcs','Beautiful uncoated stocks, letterpress friendly.','https://example.com',4);

insert into public.partners (name, tier, blurb, url, sort_order) values
 ('NOVAWORKS','diamond','Global manufacturing platform for emerging brands.','https://example.com',1),
 ('ATLAS CAPITAL','platinum','Early-stage fund backing consumer builders.','https://example.com',2),
 ('HELIOS LABS','platinum','Materials R&D for performance apparel.','https://example.com',3),
 ('MERIDIAN','gold','Cross-border logistics, simplified.','https://example.com',4),
 ('FORMFACTOR','gold','Industrial design studio.','https://example.com',5),
 ('KILN&CO','gold','Small-batch ceramics and homeware.','https://example.com',6),
 ('PIXELGRAM','silver','Creative production for launches.','https://example.com',7),
 ('NORTHBOUND','silver','Retail buying collective.','https://example.com',8),
 ('OPENSTACK','ecosystem','Developer tools for commerce teams.','https://example.com',9),
 ('CIRCLE HOUSE','ecosystem','Community space and event host.','https://example.com',10);