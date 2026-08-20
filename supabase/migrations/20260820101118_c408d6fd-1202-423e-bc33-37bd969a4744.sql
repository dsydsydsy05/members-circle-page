-- Admin cleanup for disposable NFC test inventory.
-- Production batches are intentionally protected from deletion.

create or replace function public.admin_delete_nfc_test_batch(_batch_id text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_batch text := upper(trim(_batch_id));
  deleted integer := 0;
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'ADMIN_REQUIRED';
  end if;

  if clean_batch !~ '^TEST-[A-Z0-9-]+$' then
    raise exception 'ONLY_TEST_BATCHES_CAN_BE_DELETED';
  end if;

  delete from public.nfc_tags
  where batch_id = clean_batch;

  get diagnostics deleted = row_count;
  return deleted;
end;
$$;

revoke all on function public.admin_delete_nfc_test_batch(text) from public, anon;
grant execute on function public.admin_delete_nfc_test_batch(text) to authenticated;