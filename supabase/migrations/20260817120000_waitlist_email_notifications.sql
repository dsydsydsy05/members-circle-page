-- Track administrator email delivery without making application creation depend on email uptime.
alter table public.waitlist_entries
  add column if not exists admin_notification_status text not null default 'pending',
  add column if not exists admin_notification_id text,
  add column if not exists admin_notification_error text,
  add column if not exists admin_notified_at timestamptz,
  add column if not exists decision_notification_status text not null default 'pending',
  add column if not exists decision_notification_id text,
  add column if not exists decision_notification_error text,
  add column if not exists decision_notified_at timestamptz,
  add column if not exists decision_notified_for text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.waitlist_entries'::regclass
      and conname = 'waitlist_admin_notification_status_check'
  ) then
    alter table public.waitlist_entries
      add constraint waitlist_admin_notification_status_check
      check (admin_notification_status in ('pending', 'processing', 'sent', 'failed'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.waitlist_entries'::regclass
      and conname = 'waitlist_decision_notification_status_check'
  ) then
    alter table public.waitlist_entries
      add constraint waitlist_decision_notification_status_check
      check (decision_notification_status in ('pending', 'processing', 'sent', 'failed'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.waitlist_entries'::regclass
      and conname = 'waitlist_decision_notified_for_check'
  ) then
    alter table public.waitlist_entries
      add constraint waitlist_decision_notified_for_check
      check (decision_notified_for is null or decision_notified_for in ('approved', 'rejected'));
  end if;
end
$$;

comment on column public.waitlist_entries.admin_notification_status is
  'Delivery state for the first administrator notification email for this application.';

comment on column public.waitlist_entries.decision_notification_status is
  'Delivery state for the latest approved or rejected decision email sent to the applicant.';

