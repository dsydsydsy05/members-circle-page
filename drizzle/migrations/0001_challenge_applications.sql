-- The Ultimate Entrepreneurial Challenge applications

create table public.challenge_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  school text not null,
  grade text not null,
  linkedin_url text not null,
  current_work text not null,
  why_deserve text not null,
  crazy_thing text not null,
  on_camera text not null,
  status text not null default 'pending' check (status in ('pending','accepted','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

grant select, insert, update on public.challenge_applications to authenticated;
grant all on public.challenge_applications to service_role;

alter table public.challenge_applications enable row level security;

-- Applicants can read their own application only; writes go through the
-- security-definer submit function so validation stays server-side.
create policy "Applicants read own challenge application"
on public.challenge_applications
for select
to authenticated
using (auth.uid() = user_id);

create policy "Admins read all challenge applications"
on public.challenge_applications
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role));

create or replace function public.submit_challenge_application(
  _full_name text,
  _school text,
  _grade text,
  _linkedin_url text,
  _current_work text,
  _why_deserve text,
  _crazy_thing text,
  _on_camera text
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
     or coalesce(trim(_on_camera), '') = '' then
    raise exception 'Please answer every question.';
  end if;

  if lower(_linkedin_url) not like '%linkedin.com/%' then
    raise exception 'Enter a valid LinkedIn profile URL.';
  end if;

  insert into public.challenge_applications (
    user_id, full_name, school, grade, linkedin_url,
    current_work, why_deserve, crazy_thing, on_camera
  ) values (
    _uid,
    left(trim(_full_name), 80),
    left(trim(_school), 120),
    left(trim(_grade), 60),
    left(trim(_linkedin_url), 300),
    left(trim(_current_work), 400),
    left(trim(_why_deserve), 2000),
    left(trim(_crazy_thing), 2000),
    left(trim(_on_camera), 2000)
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
    status = case
      when public.challenge_applications.status = 'pending' then 'pending'
      else public.challenge_applications.status
    end,
    updated_at = now()
  returning * into _row;

  return _row;
end;
$$;

revoke all on function public.submit_challenge_application(text, text, text, text, text, text, text, text) from public, anon;
grant execute on function public.submit_challenge_application(text, text, text, text, text, text, text, text) to authenticated;

create or replace function public.admin_review_challenge_application(
  _application_id uuid,
  _decision text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.has_role(auth.uid(), 'admin'::public.app_role) then
    raise exception 'Admin access required.';
  end if;
  if _decision not in ('accepted', 'rejected', 'pending') then
    raise exception 'Invalid decision.';
  end if;
  update public.challenge_applications
  set status = _decision, updated_at = now()
  where id = _application_id;
end;
$$;

revoke all on function public.admin_review_challenge_application(uuid, text) from public, anon, authenticated;
grant execute on function public.admin_review_challenge_application(uuid, text) to authenticated;