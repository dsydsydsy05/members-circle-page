-- Keep the public events archive predictable across every UI/version.
-- Upcoming and past events share one table and are separated by status.

update public.events
set status = lower(trim(status));

alter table public.events
  add constraint events_status_allowed
  check (status in ('upcoming', 'past'));

alter table public.events
  add constraint events_title_not_blank
  check (length(trim(title)) > 0);

comment on column public.events.status is
  'Controls public placement: upcoming appears in Upcoming / Announced; past appears in Past / Archive.';
