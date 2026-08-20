-- Public LinkedIn metadata plus private, rate-limited member email reveals.
-- Full email addresses never live in the publicly readable profiles table.

alter table public.profiles
  add column if not exists linkedin_url text,
  add column if not exists contact_email_mask text;

alter table public.profiles
  drop constraint if exists profiles_linkedin_url_length_check;
alter table public.profiles
  add constraint profiles_linkedin_url_length_check
  check (linkedin_url is null or char_length(linkedin_url) between 12 and 500);

alter table public.profiles
  drop constraint if exists profiles_contact_email_mask_length_check;
alter table public.profiles
  add constraint profiles_contact_email_mask_length_check
  check (contact_email_mask is null or char_length(contact_email_mask) between 5 and 320);

grant update (linkedin_url) on public.profiles to authenticated;

create table if not exists public.member_private_contacts (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint member_private_contacts_email_length_check
    check (char_length(email) between 3 and 320),
  constraint member_private_contacts_email_format_check
    check (email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')
);

revoke all on public.member_private_contacts from public, anon;
grant select, insert, update, delete on public.member_private_contacts to authenticated;
grant all on public.member_private_contacts to service_role;

alter table public.member_private_contacts enable row level security;

drop policy if exists "Members manage their private contact" on public.member_private_contacts;
create policy "Members manage their private contact"
  on public.member_private_contacts
  for all
  to authenticated
  using ((select auth.uid()) = profile_id)
  with check ((select auth.uid()) = profile_id);

drop trigger if exists member_private_contacts_set_updated_at on public.member_private_contacts;
create trigger member_private_contacts_set_updated_at
before update on public.member_private_contacts
for each row execute function public.set_updated_at();

create or replace function public.mask_member_email(_email text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  clean_email text := lower(trim(_email));
  local_part text := split_part(clean_email, '@', 1);
  domain_part text := split_part(clean_email, '@', 2);
begin
  if local_part = '' or domain_part = '' then
    return null;
  end if;

  return left(local_part, 1)
    || repeat('*', greatest(3, least(6, char_length(local_part) - 1)))
    || '@'
    || domain_part;
end;
$$;

create or replace function public.sync_member_contact_email_mask()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    update public.profiles
    set contact_email_mask = null
    where id = old.profile_id;
    return old;
  end if;

  new.email := lower(trim(new.email));
  update public.profiles
  set contact_email_mask = public.mask_member_email(new.email)
  where id = new.profile_id;
  return new;
end;
$$;

drop trigger if exists member_private_contacts_sync_mask on public.member_private_contacts;
create trigger member_private_contacts_sync_mask
before insert or update or delete on public.member_private_contacts
for each row execute function public.sync_member_contact_email_mask();

create table if not exists public.member_contact_reveal_events (
  requester_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  revealed_on date not null default current_date,
  revealed_at timestamptz not null default now(),
  primary key (requester_id, profile_id, revealed_on)
);

revoke all on public.member_contact_reveal_events from public, anon, authenticated;
grant all on public.member_contact_reveal_events to service_role;
alter table public.member_contact_reveal_events enable row level security;

create index if not exists member_contact_reveal_events_daily_idx
  on public.member_contact_reveal_events (requester_id, revealed_on);

create or replace function public.reveal_member_contact_email(_profile_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  is_admin boolean := false;
  is_member boolean := false;
  is_target_public boolean := false;
  already_revealed boolean := false;
  daily_reveals integer := 0;
  contact_email text;
begin
  if uid is null then
    raise exception 'MEMBER_EMAIL_SIGN_IN_REQUIRED';
  end if;

  is_admin := public.has_role(uid, 'admin'::public.app_role);

  select coalesce(p.is_member and p.onboarded, false)
  into is_member
  from public.profiles p
  where p.id = uid;

  if uid <> _profile_id and not is_admin and not coalesce(is_member, false) then
    raise exception 'MEMBER_EMAIL_MEMBERS_ONLY';
  end if;

  select coalesce(p.is_member and p.onboarded, false)
  into is_target_public
  from public.profiles p
  where p.id = _profile_id;

  if uid <> _profile_id and not is_admin and not coalesce(is_target_public, false) then
    return null;
  end if;

  if uid <> _profile_id and not is_admin then
    select exists (
      select 1
      from public.member_contact_reveal_events e
      where e.requester_id = uid
        and e.profile_id = _profile_id
        and e.revealed_on = current_date
    ) into already_revealed;

    if not already_revealed then
      if exists (
        select 1
        from public.member_contact_reveal_events e
        where e.requester_id = uid
          and e.revealed_at > now() - interval '8 seconds'
      ) then
        raise exception 'MEMBER_EMAIL_SLOW_DOWN';
      end if;

      select count(*)
      into daily_reveals
      from public.member_contact_reveal_events e
      where e.requester_id = uid
        and e.revealed_on = current_date;

      if daily_reveals >= 5 then
        raise exception 'MEMBER_EMAIL_DAILY_LIMIT';
      end if;

      insert into public.member_contact_reveal_events (requester_id, profile_id)
      values (uid, _profile_id)
      on conflict do nothing;
    end if;
  end if;

  select c.email
  into contact_email
  from public.member_private_contacts c
  where c.profile_id = _profile_id;

  return contact_email;
end;
$$;

revoke execute on function public.mask_member_email(text) from public, anon, authenticated;
revoke execute on function public.sync_member_contact_email_mask() from public, anon, authenticated;
revoke execute on function public.reveal_member_contact_email(uuid) from public, anon;
grant execute on function public.reveal_member_contact_email(uuid) to authenticated;

comment on table public.member_private_contacts is
  'Private member contact email. Full values are owner-readable and otherwise available only through the rate-limited reveal RPC.';
comment on column public.profiles.contact_email_mask is
  'Public non-reversible display mask derived from member_private_contacts.email.';
comment on function public.reveal_member_contact_email(uuid) is
  'Returns one member contact email to signed-in members, with per-requester audit, cooldown, and a 5-new-contacts daily limit.';