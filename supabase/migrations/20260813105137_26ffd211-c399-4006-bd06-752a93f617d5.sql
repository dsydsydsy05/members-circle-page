alter table public.partners
  add column if not exists is_published boolean not null default false;

comment on column public.partners.is_published is
  'Only confirmed sponsors are published. Drafts stay admin-only.';

drop policy if exists "Partners are viewable by everyone" on public.partners;

create policy "Published partners are viewable by everyone"
  on public.partners for select to anon, authenticated
  using (is_published = true or public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins manage media" on storage.objects;

create policy "Admins manage media"
  on storage.objects for all to authenticated
  using (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));
