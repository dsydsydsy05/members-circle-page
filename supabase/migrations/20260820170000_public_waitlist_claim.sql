-- Allow people to apply before creating an account, then attach an approved
-- application to the first authenticated account using the same email.

begin;

alter table public.waitlist_entries
  alter column user_id drop not null;

comment on column public.waitlist_entries.user_id is
  'Authenticated account that owns this application. Null until the applicant signs in with the same email.';

create or replace function public.claim_waitlist_for_current_user()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  account_email text;
  entry public.waitlist_entries%rowtype;
begin
  if uid is null then
    return null;
  end if;

  select lower(email)
  into account_email
  from auth.users
  where id = uid;

  if account_email is null then
    return null;
  end if;

  -- Preserve an application already attached to this account, including when
  -- the account email was changed after the original application.
  select *
  into entry
  from public.waitlist_entries
  where user_id = uid
  limit 1
  for update;

  if entry.id is null then
    select *
    into entry
    from public.waitlist_entries
    where lower(email) = account_email
    limit 1
    for update;
  end if;

  if entry.id is null then
    return null;
  end if;

  -- A claimed application can never be moved to a different account.
  if entry.user_id is not null and entry.user_id <> uid then
    return null;
  end if;

  if entry.user_id is null then
    update public.waitlist_entries
    set user_id = uid,
        updated_at = now()
    where id = entry.id;
  end if;

  if entry.status = 'approved' then
    insert into public.profiles (id, is_member)
    values (uid, true)
    on conflict (id) do update
      set is_member = true;
  end if;

  return entry.status;
end;
$$;

revoke all on function public.claim_waitlist_for_current_user() from public, anon;
grant execute on function public.claim_waitlist_for_current_user() to authenticated;

create or replace function public.admin_review_waitlist(
  _entry_id uuid,
  _status text,
  _admin_note text default null
)
returns public.waitlist_entries
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.waitlist_entries%rowtype;
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'Forbidden'; end if;
  if _status not in ('pending', 'approved', 'rejected') then raise exception 'Invalid status'; end if;

  update public.waitlist_entries
  set status = _status,
      admin_note = nullif(trim(coalesce(_admin_note, '')), ''),
      reviewed_by = auth.uid(),
      reviewed_at = case when _status = 'pending' then null else now() end,
      updated_at = now()
  where id = _entry_id
  returning * into result;

  if result.id is null then raise exception 'Waitlist entry not found'; end if;

  -- Existing accounts receive access immediately. Public applications remain
  -- approved and are activated by claim_waitlist_for_current_user on sign-in.
  if _status = 'approved' and result.user_id is not null then
    insert into public.profiles (id, is_member)
    values (result.user_id, true)
    on conflict (id) do update
      set is_member = true;
  end if;

  return result;
end;
$$;

revoke all on function public.admin_review_waitlist(uuid, text, text) from public, anon;
grant execute on function public.admin_review_waitlist(uuid, text, text) to authenticated;

commit;
