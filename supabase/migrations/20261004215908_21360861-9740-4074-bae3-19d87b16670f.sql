-- Logs who has already received the member welcome email so sends stay idempotent.
create table if not exists public.member_welcome_emails (
  email text primary key,
  sent_at timestamptz not null default now(),
  resend_id text
);

grant all on public.member_welcome_emails to service_role;

alter table public.member_welcome_emails enable row level security;
-- No policies: only service_role (edge functions) touches this log.

-- Approved waitlist emails plus member profile emails, deduplicated,
-- minus anyone already emailed. Service role only.
create or replace function public.list_member_welcome_recipients()
returns table(email text)
language sql
stable
security definer
set search_path = ''
as $$
  select lower(email) as email
  from (
    select lower(w.email) as email
    from public.waitlist_entries w
    where w.status = 'approved'
    union
    select lower(u.email) as email
    from public.profiles p
    join auth.users u on u.id = p.id
    where p.is_member and u.email is not null
  ) x
  where x.email is not null
    and not exists (
      select 1 from public.member_welcome_emails m where m.email = x.email
    );
$$;

revoke all on function public.list_member_welcome_recipients() from public, anon, authenticated;
grant execute on function public.list_member_welcome_recipients() to service_role;
