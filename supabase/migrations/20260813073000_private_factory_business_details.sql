-- Anonymous visitors may see aggregate counts through trusted server functions,
-- but must not be able to query factory or family-business records directly.

drop policy if exists "Public can view factories" on public.factories;
drop policy if exists "Public can view businesses" on public.family_businesses;

revoke select on public.factories from anon;
revoke select on public.family_businesses from anon;

-- Expose only aggregate totals to the public homepage. SECURITY DEFINER lets
-- anonymous visitors obtain these two numbers without granting access to any
-- factory or family-business row.
create or replace function public.get_public_directory_counts()
returns table (
  family_businesses bigint,
  vetted_factories bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select count(*) from public.family_businesses),
    (
      select count(*)
      from public.factories
      where website is not null
        and website not ilike '%example.com%'
    );
$$;

revoke all on function public.get_public_directory_counts() from public;
grant execute on function public.get_public_directory_counts() to anon, authenticated;
