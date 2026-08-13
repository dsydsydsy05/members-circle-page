drop policy if exists "Published partners are viewable by everyone" on public.partners;

create policy "Published partners are public"
  on public.partners for select to anon, authenticated
  using (is_published = true);

create policy "Admins can view partner drafts"
  on public.partners for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));
