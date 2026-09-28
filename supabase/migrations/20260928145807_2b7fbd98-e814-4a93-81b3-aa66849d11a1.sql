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