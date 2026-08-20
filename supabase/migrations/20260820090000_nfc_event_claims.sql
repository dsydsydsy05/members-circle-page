-- Anonymous NFC inventory that is manufactured before event attendees are known.
-- The chip stores only /nfc/<token>; ownership is created atomically at the event.

create table if not exists public.nfc_tags (
  id uuid primary key default gen_random_uuid(),
  token_hash bytea not null unique,
  serial_no text not null unique,
  batch_id text not null,
  status text not null default 'inactive'
    check (status in ('inactive', 'claimable', 'claimed', 'disabled')),
  user_id uuid references auth.users(id) on delete set null,
  claimable_until timestamptz,
  claimed_at timestamptz,
  disabled_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint nfc_claimed_requires_user
    check (status <> 'claimed' or user_id is not null)
);

create unique index if not exists nfc_one_claimed_tag_per_user
on public.nfc_tags (user_id)
where status = 'claimed' and user_id is not null;

create index if not exists nfc_tags_batch_status_idx
on public.nfc_tags (batch_id, status);

drop trigger if exists nfc_tags_set_updated_at on public.nfc_tags;
create trigger nfc_tags_set_updated_at
before update on public.nfc_tags
for each row execute function public.set_updated_at();

create table if not exists public.nfc_tag_events (
  id bigint generated always as identity primary key,
  tag_id uuid not null references public.nfc_tags(id) on delete cascade,
  action text not null,
  actor_id uuid references auth.users(id) on delete set null,
  member_id uuid references auth.users(id) on delete set null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.nfc_tags enable row level security;
alter table public.nfc_tag_events enable row level security;

revoke all on public.nfc_tags, public.nfc_tag_events from public, anon, authenticated;
grant all on public.nfc_tags, public.nfc_tag_events to service_role;

drop policy if exists "Admins read NFC inventory" on public.nfc_tags;
create policy "Admins read NFC inventory"
on public.nfc_tags for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins read NFC audit" on public.nfc_tag_events;
create policy "Admins read NFC audit"
on public.nfc_tag_events for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

grant select on public.nfc_tags, public.nfc_tag_events to authenticated;

create or replace function public.resolve_nfc_tag(_token text)
returns table (
  state text,
  member_id uuid,
  member_no bigint,
  profile_ready boolean
)
language plpgsql
security definer
stable
set search_path = public, extensions
as $$
declare
  matched public.nfc_tags%rowtype;
  profile public.profiles%rowtype;
begin
  if _token is null
     or length(trim(_token)) < 16
     or length(trim(_token)) > 128
     or trim(_token) !~ '^[A-Za-z0-9_-]+$' then
    return query select 'invalid'::text, null::uuid, null::bigint, false;
    return;
  end if;

  select * into matched
  from public.nfc_tags
  where token_hash = extensions.digest(lower(trim(_token)), 'sha256');

  if matched.id is null then
    return query select 'invalid'::text, null::uuid, null::bigint, false;
    return;
  end if;

  if matched.status = 'claimable'
     and matched.claimable_until is not null
     and matched.claimable_until <= now() then
    return query select 'inactive'::text, null::uuid, null::bigint, false;
    return;
  end if;

  if matched.status <> 'claimed' then
    return query select matched.status, null::uuid, null::bigint, false;
    return;
  end if;

  select * into profile from public.profiles where id = matched.user_id;
  return query
    select
      'claimed'::text,
      matched.user_id,
      profile.member_no::bigint,
      coalesce(profile.onboarded and profile.is_member, false);
end;
$$;

revoke all on function public.resolve_nfc_tag(text) from public;
grant execute on function public.resolve_nfc_tag(text) to anon, authenticated;

create or replace function public.claim_nfc_tag(_token text)
returns table (
  state text,
  member_id uuid,
  profile_ready boolean
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  uid uuid := auth.uid();
  matched public.nfc_tags%rowtype;
  ready boolean := false;
begin
  if uid is null then
    raise exception 'NFC_AUTH_REQUIRED';
  end if;
  if _token is null
     or length(trim(_token)) < 16
     or length(trim(_token)) > 128
     or trim(_token) !~ '^[A-Za-z0-9_-]+$' then
    raise exception 'NFC_NOT_FOUND';
  end if;

  select * into matched
  from public.nfc_tags
  where token_hash = extensions.digest(lower(trim(_token)), 'sha256')
  for update;

  if matched.id is null then
    raise exception 'NFC_NOT_FOUND';
  end if;

  if matched.status = 'claimed' then
    if matched.user_id <> uid then
      raise exception 'NFC_ALREADY_CLAIMED';
    end if;
    select coalesce(onboarded and is_member, false) into ready
    from public.profiles where id = uid;
    return query select 'claimed'::text, uid, coalesce(ready, false);
    return;
  end if;

  if matched.status = 'disabled' then
    raise exception 'NFC_DISABLED';
  end if;

  if matched.status <> 'claimable'
     or (matched.claimable_until is not null and matched.claimable_until <= now()) then
    raise exception 'NFC_NOT_ACTIVE';
  end if;

  if exists (
    select 1 from public.nfc_tags
    where user_id = uid and status = 'claimed' and id <> matched.id
  ) then
    raise exception 'NFC_ACCOUNT_ALREADY_HAS_CARD';
  end if;

  update public.nfc_tags
  set status = 'claimed',
      user_id = uid,
      claimed_at = now(),
      claimable_until = null,
      disabled_at = null
  where id = matched.id;

  insert into public.profiles (id, is_member)
  values (uid, true)
  on conflict (id) do update set is_member = true;

  insert into public.nfc_tag_events (tag_id, action, actor_id, member_id)
  values (matched.id, 'claimed', uid, uid);

  select coalesce(onboarded and is_member, false) into ready
  from public.profiles where id = uid;

  return query select 'claimed'::text, uid, coalesce(ready, false);
end;
$$;

revoke all on function public.claim_nfc_tag(text) from public, anon;
grant execute on function public.claim_nfc_tag(text) to authenticated;

create or replace function public.admin_create_nfc_batch(_batch_id text, _count integer)
returns table (
  serial_no text,
  token text,
  url_path text
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  clean_batch text := upper(regexp_replace(trim(_batch_id), '[^a-zA-Z0-9-]+', '-', 'g'));
  raw_token text;
  next_serial text;
  row_number integer;
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'ADMIN_REQUIRED';
  end if;
  if clean_batch = '' or length(clean_batch) > 48 then
    raise exception 'INVALID_BATCH_ID';
  end if;
  if _count < 1 or _count > 1000 then
    raise exception 'INVALID_BATCH_SIZE';
  end if;
  if exists (select 1 from public.nfc_tags where batch_id = clean_batch) then
    raise exception 'BATCH_ALREADY_EXISTS';
  end if;

  for row_number in 1.._count loop
    raw_token := encode(extensions.gen_random_bytes(16), 'hex');
    next_serial := clean_batch || '-' || lpad(row_number::text, 4, '0');

    insert into public.nfc_tags (
      token_hash, serial_no, batch_id, status, created_by
    ) values (
      extensions.digest(raw_token, 'sha256'), next_serial, clean_batch, 'inactive', auth.uid()
    );

    serial_no := next_serial;
    token := raw_token;
    url_path := '/nfc/' || raw_token;
    return next;
  end loop;
end;
$$;

revoke all on function public.admin_create_nfc_batch(text, integer) from public, anon;
grant execute on function public.admin_create_nfc_batch(text, integer) to authenticated;

create or replace function public.admin_list_nfc_tags()
returns table (
  id uuid,
  serial_no text,
  batch_id text,
  status text,
  user_id uuid,
  member_name text,
  claimable_until timestamptz,
  claimed_at timestamptz,
  created_at timestamptz
)
language sql
security definer
stable
set search_path = public
as $$
  select
    t.id,
    t.serial_no,
    t.batch_id,
    case
      when t.status = 'claimable'
        and t.claimable_until is not null
        and t.claimable_until <= now()
      then 'inactive'
      else t.status
    end as status,
    t.user_id,
    p.full_name,
    t.claimable_until,
    t.claimed_at,
    t.created_at
  from public.nfc_tags t
  left join public.profiles p on p.id = t.user_id
  where public.has_role(auth.uid(), 'admin')
  order by t.created_at desc, t.serial_no asc;
$$;

revoke all on function public.admin_list_nfc_tags() from public, anon;
grant execute on function public.admin_list_nfc_tags() to authenticated;

create or replace function public.admin_set_nfc_batch_claimable(
  _batch_id text,
  _claimable boolean,
  _minutes integer default 720
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  changed integer := 0;
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'ADMIN_REQUIRED';
  end if;
  if _claimable and (_minutes < 5 or _minutes > 10080) then
    raise exception 'INVALID_CLAIM_WINDOW';
  end if;

  insert into public.nfc_tag_events (tag_id, action, actor_id, details)
  select
    id,
    case when _claimable then 'activated' else 'deactivated' end,
    auth.uid(),
    jsonb_build_object('batch_id', batch_id, 'minutes', _minutes)
  from public.nfc_tags
  where batch_id = upper(trim(_batch_id)) and status in ('inactive', 'claimable');

  update public.nfc_tags
  set status = case when _claimable then 'claimable' else 'inactive' end,
      claimable_until = case when _claimable then now() + make_interval(mins => _minutes) else null end
  where batch_id = upper(trim(_batch_id)) and status in ('inactive', 'claimable');

  get diagnostics changed = row_count;
  return changed;
end;
$$;

revoke all on function public.admin_set_nfc_batch_claimable(text, boolean, integer) from public, anon;
grant execute on function public.admin_set_nfc_batch_claimable(text, boolean, integer) to authenticated;

create or replace function public.admin_disable_nfc_tag(_tag_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  changed integer := 0;
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'ADMIN_REQUIRED';
  end if;

  update public.nfc_tags
  set status = 'disabled', disabled_at = now(), claimable_until = null
  where id = _tag_id and status <> 'disabled';
  get diagnostics changed = row_count;

  if changed > 0 then
    insert into public.nfc_tag_events (tag_id, action, actor_id)
    values (_tag_id, 'disabled', auth.uid());
  end if;
  return changed > 0;
end;
$$;

revoke all on function public.admin_disable_nfc_tag(uuid) from public, anon;
grant execute on function public.admin_disable_nfc_tag(uuid) to authenticated;
