-- Editorial metadata is shared by home, archive, and admin.
alter table public.events
 add column if not exists attendance_label text,
 add column if not exists image_alt text,
 add column if not exists cover_caption text,
 add column if not exists cover_display text not null default 'photo'
 check (cover_display in ('photo','poster'));
alter table public.guests add column if not exists avatar_url text,
 add column if not exists bio text;
alter table public.profiles add column if not exists conversation_topics text;
grant select (conversation_topics), update (conversation_topics) on public.profiles to authenticated;
grant select (conversation_topics) on public.profiles to anon;
update public.events set attendance_label='30 guests', cover_display='poster',
 image_alt='Guests gathering at The Room founder dinner in Shanghai'
 where slug='waic-2026-founders-dinner';
insert into public.events (slug,title,date_label,city,status,cover_url,detail_image_url,summary,body,sort_order,attendance_label,image_alt,cover_caption,cover_display)
values ('boston-founder-dinner-2026-09-18','Founder Dinner','September 18, 2026','Boston','past',
 '/images/events/boston-founder-dinner-cover-19.png','/images/events/boston-founder-dinner-photo.jpg',
 'Your story before your company.',
 E'Nineteen founders around one table, with one rule: we get into your story before we get into your company.\n\nThank you to Briar Group for providing the space at the Glass House.\n\nThe Room is a members-only community that curates a small room of founders every month, for people who would rather be in the RIGHT room than in EVERY room.',
 -100,'19 founders','Founders sharing dinner around one table at the Glass House in Boston',
 null,'poster')
on conflict (slug) do nothing;
