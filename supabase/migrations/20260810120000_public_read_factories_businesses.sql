-- Allow public read access to the Factory List and Family Business tables.
-- The pages render for all visitors and are labeled "Members only";
-- writes stay restricted to members/admins by the existing policies.

grant select on public.factories to anon;
grant select on public.family_businesses to anon;

create policy "Public can view factories"
  on public.factories for select to anon
  using (true);

create policy "Public can view businesses"
  on public.family_businesses for select to anon
  using (true);
