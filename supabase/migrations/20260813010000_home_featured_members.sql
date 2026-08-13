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
