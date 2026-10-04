create or replace function public.get_public_member_count()
returns bigint language sql stable security definer set search_path to ''
as $$
  select count(*) from (
    select lower(email) as k from public.waitlist_entries where status = 'approved'
    union
    select coalesce(lower(u.email), p.id::text) from public.profiles p left join auth.users u on u.id = p.id where p.is_member
  ) x;
$$;
revoke all on function public.get_public_member_count() from public;
grant execute on function public.get_public_member_count() to anon, authenticated, service_role;