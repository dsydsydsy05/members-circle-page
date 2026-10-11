-- Challenge applications: contact email (required) + optional phone
alter table public.challenge_applications
  add column email text,
  add column phone text;

comment on column public.challenge_applications.email is 'Contact email for the challenge application (required on submit)';
comment on column public.challenge_applications.phone is 'Optional contact phone number';

-- Backfill email from the applicant''s auth account where missing
update public.challenge_applications ca
set email = au.email
from auth.users au
where ca.user_id = au.id
  and ca.email is null;

-- New signature with contact fields; drop the old 8-arg version (feature unreleased)
drop function public.submit_challenge_application(text, text, text, text, text, text, text, text);

create or replace function public.submit_challenge_application(
  _full_name text,
  _school text,
  _grade text,
  _linkedin_url text,
  _current_work text,
  _why_deserve text,
  _crazy_thing text,
  _on_camera text,
  _email text,
  _phone text
)
returns public.challenge_applications
language plpgsql
security definer
set search_path = public
as $$
declare
  _uid uuid := auth.uid();
  _row public.challenge_applications;
begin
  if _uid is null then
    raise exception 'Sign in required.';
  end if;

  if coalesce(trim(_full_name), '') = ''
     or coalesce(trim(_school), '') = ''
     or coalesce(trim(_grade), '') = ''
     or coalesce(trim(_linkedin_url), '') = ''
     or coalesce(trim(_current_work), '') = ''
     or coalesce(trim(_why_deserve), '') = ''
     or coalesce(trim(_crazy_thing), '') = ''
     or coalesce(trim(_on_camera), '') = ''
     or coalesce(trim(_email), '') = '' then
    raise exception 'Please answer every question.';
  end if;

  if lower(_linkedin_url) not like '%linkedin.com/%' then
    raise exception 'Enter a valid LinkedIn profile URL.';
  end if;

  if trim(_email) !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Enter a valid email address.';
  end if;

  insert into public.challenge_applications (
    user_id, full_name, school, grade, linkedin_url,
    current_work, why_deserve, crazy_thing, on_camera, email, phone
  ) values (
    _uid,
    left(trim(_full_name), 80),
    left(trim(_school), 120),
    left(trim(_grade), 60),
    left(trim(_linkedin_url), 300),
    left(trim(_current_work), 400),
    left(trim(_why_deserve), 2000),
    left(trim(_crazy_thing), 2000),
    left(trim(_on_camera), 2000),
    left(trim(_email), 255),
    nullif(left(trim(_phone), 40), '')
  )
  on conflict (user_id) do update set
    full_name = excluded.full_name,
    school = excluded.school,
    grade = excluded.grade,
    linkedin_url = excluded.linkedin_url,
    current_work = excluded.current_work,
    why_deserve = excluded.why_deserve,
    crazy_thing = excluded.crazy_thing,
    on_camera = excluded.on_camera,
    email = excluded.email,
    phone = excluded.phone,
    status = case
      when public.challenge_applications.status = 'pending' then 'pending'
      else public.challenge_applications.status
    end,
    updated_at = now()
  returning * into _row;

  return _row;
end;
$$;

revoke all on function public.submit_challenge_application(text, text, text, text, text, text, text, text, text, text) from public, anon;
grant execute on function public.submit_challenge_application(text, text, text, text, text, text, text, text, text, text) to authenticated;
