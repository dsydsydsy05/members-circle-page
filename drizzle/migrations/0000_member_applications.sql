ALTER TABLE public.waitlist_entries
  ADD COLUMN IF NOT EXISTS school text,
  ADD COLUMN IF NOT EXISTS position text,
  ADD COLUMN IF NOT EXISTS startup text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS reason text;

CREATE OR REPLACE FUNCTION public.submit_member_application(
  _full_name text, _school text, _position text, _startup text, _linkedin_url text, _reason text)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
declare
  uid uuid := auth.uid();
  account_email text;
  entry public.waitlist_entries%rowtype;
  n text := left(trim(coalesce(_full_name,'')), 80);
  s text := left(trim(coalesce(_school,'')), 120);
  p text := left(trim(coalesce(_position,'')), 120);
  c text := left(trim(coalesce(_startup,'')), 120);
  l text := left(trim(coalesce(_linkedin_url,'')), 300);
  r text := left(trim(coalesce(_reason,'')), 2000);
begin
  if uid is null then raise exception 'Not authenticated'; end if;
  if n = '' or s = '' or p = '' or c = '' or l = '' or r = '' then
    raise exception 'All fields are required';
  end if;
  if l !~* '^https://([a-z0-9-]+\.)*linkedin\.com/' then raise exception 'Enter a valid LinkedIn URL'; end if;

  select lower(email) into account_email from auth.users where id = uid;
  if account_email is null then raise exception 'Account email missing'; end if;

  select * into entry from public.waitlist_entries
    where user_id = uid or (user_id is null and lower(email) = account_email)
    order by (user_id = uid) desc nulls last limit 1 for update;

  if entry.id is not null and entry.status = 'approved' then
    return 'approved';
  end if;

  if entry.id is null then
    insert into public.waitlist_entries (user_id, email, full_name, school, position, startup, linkedin_url, reason)
    values (uid, account_email, n, s, p, c, l, r);
  else
    update public.waitlist_entries
      set user_id = uid, full_name = n, school = s, position = p, startup = c,
          linkedin_url = l, reason = r, status = 'pending',
          reviewed_at = null, reviewed_by = null, updated_at = now()
      where id = entry.id;
  end if;

  insert into public.profiles (id, full_name, school, position, startup, linkedin_url)
  values (uid, n, s, p, c, l)
  on conflict (id) do update set full_name = excluded.full_name, school = excluded.school,
    position = excluded.position, startup = excluded.startup, linkedin_url = excluded.linkedin_url;

  return 'pending';
end;
$$;

REVOKE ALL ON FUNCTION public.submit_member_application(text,text,text,text,text,text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.submit_member_application(text,text,text,text,text,text) TO authenticated;