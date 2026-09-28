-- Archive identities stay stable when newest-first display order changes.
alter table public.events add column if not exists archive_number integer
 check (archive_number is null or archive_number > 0);
update public.events set archive_number=1 where slug='waic-2026-founders-dinner';
update public.events set archive_number=2, cover_caption=null where slug='boston-founder-dinner-2026-09-18';

-- Keep the existing three announced events and their order; move each one month later.
update public.events set date_label=case title
 when 'The Room Opening: Our First Guest' then 'Oct 15'
 when 'How to Raise Funding' then 'Nov 15'
 when 'How to Take a Company Public' then 'Dec 15'
 end
 where status='upcoming' and title in (
 'The Room Opening: Our First Guest','How to Raise Funding','How to Take a Company Public');

-- Keep the corresponding unpublished guest placeholders consistent with their events.
update public.guests g set date_label=e.date_label from public.events e
 where g.event=e.title and g.name='Coming Soon' and e.status='upcoming'
 and e.title in ('The Room Opening: Our First Guest','How to Raise Funding','How to Take a Company Public');
