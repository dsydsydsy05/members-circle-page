-- Q&A, waitlist, invitation codes, moderation and semantic member search.
-- This migration is intentionally idempotent where account seeding is concerned:
-- admins are assigned both now and when the matching auth user is created later.

create extension if not exists pgcrypto with schema extensions;
create extension if not exists vector with schema extensions;

-- ---------------------------------------------------------------------------
-- Administrator bootstrap

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, is_member)
  values (new.id, lower(coalesce(new.email, '')) = 'test@theroomcommunity.org')
  on conflict (id) do update
    set is_member = public.profiles.is_member
      or lower(coalesce(new.email, '')) = 'test@theroomcommunity.org';

  if lower(coalesce(new.email, '')) in (
    'dsydongshiyu@gmail.com',
    '1012720881@qq.com',
    'test@theroomcommunity.org'
  ) then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin'::public.app_role)
    on conflict (user_id, role) do nothing;
  end if;

  return new;
end;
$$;

insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role
from auth.users
where lower(email) in (
  'dsydongshiyu@gmail.com',
  '1012720881@qq.com',
  'test@theroomcommunity.org'
)
on conflict (user_id, role) do nothing;

update public.profiles p
set is_member = true
from auth.users u
where p.id = u.id
  and lower(u.email) = 'test@theroomcommunity.org';

-- ---------------------------------------------------------------------------
-- Invitation codes. Codes are never stored as plaintext.

create table if not exists public.invitation_codes (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  code_hash bytea not null unique,
  active boolean not null default true,
  max_redemptions integer,
  redemption_count integer not null default 0,
  expires_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invitation_codes_max_redemptions_check
    check (max_redemptions is null or max_redemptions > 0),
  constraint invitation_codes_redemption_count_check check (redemption_count >= 0)
);

create table if not exists public.invitation_code_redemptions (
  id uuid primary key default gen_random_uuid(),
  invitation_code_id uuid not null references public.invitation_codes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  unique (invitation_code_id, user_id)
);

grant select, insert, update, delete on public.invitation_codes to authenticated;
grant select on public.invitation_code_redemptions to authenticated;
grant all on public.invitation_codes, public.invitation_code_redemptions to service_role;

alter table public.invitation_codes enable row level security;
alter table public.invitation_code_redemptions enable row level security;

drop policy if exists "Admins manage invitation codes" on public.invitation_codes;
create policy "Admins manage invitation codes"
on public.invitation_codes for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Users view own invitation redemptions" on public.invitation_code_redemptions;
create policy "Users view own invitation redemptions"
on public.invitation_code_redemptions for select to authenticated
using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

insert into public.invitation_codes (label, code_hash, active)
values ('Legacy member invitation', extensions.digest('theroom2026', 'sha256'), true)
on conflict (code_hash) do nothing;

create or replace function public.redeem_invitation_code(_code text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  uid uuid := auth.uid();
  matched public.invitation_codes%rowtype;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  select * into matched
  from public.invitation_codes
  where code_hash = extensions.digest(lower(trim(_code)), 'sha256')
    and active = true
    and (expires_at is null or expires_at > now())
    and (max_redemptions is null or redemption_count < max_redemptions)
  for update;

  if matched.id is null then
    return false;
  end if;

  insert into public.invitation_code_redemptions (invitation_code_id, user_id)
  values (matched.id, uid)
  on conflict (invitation_code_id, user_id) do nothing;

  if found then
    update public.invitation_codes
    set redemption_count = redemption_count + 1, updated_at = now()
    where id = matched.id;
  end if;

  insert into public.profiles (id, is_member)
  values (uid, true)
  on conflict (id) do update set is_member = true;

  return true;
end;
$$;

revoke all on function public.redeem_invitation_code(text) from public, anon;
grant execute on function public.redeem_invitation_code(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Waitlist / Become a member

create table if not exists public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  admin_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint waitlist_full_name_length check (char_length(full_name) between 1 and 80),
  constraint waitlist_email_length check (char_length(email) between 3 and 320)
);

create unique index if not exists waitlist_entries_email_lower_idx
  on public.waitlist_entries (lower(email));

grant select on public.waitlist_entries to authenticated;
grant all on public.waitlist_entries to service_role;
alter table public.waitlist_entries enable row level security;

drop policy if exists "Users view own waitlist entry" on public.waitlist_entries;
create policy "Users view own waitlist entry"
on public.waitlist_entries for select to authenticated
using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins manage waitlist" on public.waitlist_entries;
create policy "Admins manage waitlist"
on public.waitlist_entries for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create or replace function public.submit_waitlist(_full_name text)
returns public.waitlist_entries
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  account_email text;
  clean_name text := trim(regexp_replace(coalesce(_full_name, ''), '\s+', ' ', 'g'));
  result public.waitlist_entries%rowtype;
begin
  if uid is null then raise exception 'Not authenticated'; end if;
  if char_length(clean_name) < 1 or char_length(clean_name) > 80 then
    raise exception 'Name must be between 1 and 80 characters';
  end if;

  select email into account_email from auth.users where id = uid;
  if account_email is null then raise exception 'Account email is unavailable'; end if;

  insert into public.waitlist_entries (user_id, email, full_name)
  values (uid, lower(account_email), clean_name)
  on conflict (user_id) do update
    set full_name = excluded.full_name,
        email = excluded.email,
        updated_at = now()
  returning * into result;

  return result;
end;
$$;

revoke all on function public.submit_waitlist(text) from public, anon;
grant execute on function public.submit_waitlist(text) to authenticated;

create or replace function public.admin_review_waitlist(
  _entry_id uuid,
  _status text,
  _admin_note text default null
)
returns public.waitlist_entries
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.waitlist_entries%rowtype;
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'Forbidden'; end if;
  if _status not in ('pending', 'approved', 'rejected') then raise exception 'Invalid status'; end if;

  update public.waitlist_entries
  set status = _status,
      admin_note = nullif(trim(coalesce(_admin_note, '')), ''),
      reviewed_by = auth.uid(),
      reviewed_at = case when _status = 'pending' then null else now() end,
      updated_at = now()
  where id = _entry_id
  returning * into result;

  if result.id is null then raise exception 'Waitlist entry not found'; end if;

  if _status = 'approved' then
    update public.profiles set is_member = true where id = result.user_id;
  end if;

  return result;
end;
$$;

revoke all on function public.admin_review_waitlist(uuid, text, text) from public, anon;
grant execute on function public.admin_review_waitlist(uuid, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Q&A and moderation configuration

create table if not exists public.moderation_terms (
  id uuid primary key default gen_random_uuid(),
  term text not null,
  language text not null check (language in ('zh', 'en', 'any')),
  category text not null check (category in ('sexual', 'gambling', 'other')),
  effect text not null default 'block' check (effect in ('block', 'allow')),
  match_mode text not null default 'phrase' check (match_mode in ('word', 'phrase', 'substring')),
  severity smallint not null default 3 check (severity between 1 and 4),
  source text not null default 'The Room custom',
  source_url text,
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (term, language, effect)
);

create table if not exists public.moderation_domains (
  id uuid primary key default gen_random_uuid(),
  domain text not null unique,
  category text not null check (category in ('sexual', 'gambling')),
  source text not null,
  source_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.moderation_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  category text not null,
  source text not null,
  content_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.qa_questions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 8 and 1000),
  status text not null default 'published' check (status in ('published', 'deleted')),
  moderation_state text not null default 'passed' check (moderation_state in ('passed', 'blocked')),
  deleted_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.qa_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.qa_questions(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  responder_type text not null check (responder_type in ('admin', 'guest')),
  responder_name text not null,
  responder_title text,
  responder_avatar_url text,
  published_by uuid not null references auth.users(id) on delete restrict,
  status text not null default 'published' check (status in ('published', 'deleted')),
  deleted_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

revoke all on public.qa_questions, public.qa_answers from anon, authenticated;
grant select (id, body, status, moderation_state, created_at, updated_at)
  on public.qa_questions to anon, authenticated;
grant select (
  id,
  question_id,
  body,
  responder_type,
  responder_name,
  responder_title,
  responder_avatar_url,
  status,
  created_at,
  updated_at
) on public.qa_answers to anon, authenticated;
grant update on public.qa_questions to authenticated;
grant insert, update on public.qa_answers to authenticated;
grant select, insert, update, delete on public.moderation_terms, public.moderation_domains to authenticated;
grant select on public.moderation_events to authenticated;
grant all on public.qa_questions, public.qa_answers, public.moderation_terms,
  public.moderation_domains, public.moderation_events to service_role;

alter table public.qa_questions enable row level security;
alter table public.qa_answers enable row level security;
alter table public.moderation_terms enable row level security;
alter table public.moderation_domains enable row level security;
alter table public.moderation_events enable row level security;

drop policy if exists "Published questions are public" on public.qa_questions;
create policy "Published questions are public"
on public.qa_questions for select
using (status = 'published' and moderation_state = 'passed' or public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins manage questions" on public.qa_questions;
create policy "Admins manage questions"
on public.qa_questions for update to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Published answers are public" on public.qa_answers;
create policy "Published answers are public"
on public.qa_answers for select
using (status = 'published' or public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins manage answers" on public.qa_answers;
create policy "Admins manage answers"
on public.qa_answers for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins manage moderation terms" on public.moderation_terms;
create policy "Admins manage moderation terms"
on public.moderation_terms for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins manage moderation domains" on public.moderation_domains;
create policy "Admins manage moderation domains"
on public.moderation_domains for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create or replace function public.admin_replace_moderation_domains(
  _category text,
  _domains text[],
  _source text,
  _source_url text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare inserted_count integer;
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'Forbidden'; end if;
  if _category not in ('sexual', 'gambling') then raise exception 'Invalid category'; end if;

  delete from public.moderation_domains
  where category = _category and source = _source;

  insert into public.moderation_domains (domain, category, source, source_url)
  select distinct lower(trim(value)), _category, _source, _source_url
  from unnest(_domains) as value
  where trim(value) ~ '^[a-z0-9.-]+\.[a-z]{2,}$'
  on conflict (domain) do update
    set category = excluded.category,
        source = excluded.source,
        source_url = excluded.source_url,
        active = true;

  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;

revoke all on function public.admin_replace_moderation_domains(text, text[], text, text) from public, anon;
grant execute on function public.admin_replace_moderation_domains(text, text[], text, text) to authenticated;

drop policy if exists "Admins view moderation events" on public.moderation_events;
create policy "Admins view moderation events"
on public.moderation_events for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create or replace function public.admin_list_qa_questions()
returns table (
  id uuid,
  author_id uuid,
  author_email text,
  body text,
  status text,
  moderation_state text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'Forbidden'; end if;
  return query
    select q.id, q.author_id, u.email::text, q.body, q.status, q.moderation_state, q.created_at
    from public.qa_questions q
    left join auth.users u on u.id = q.author_id
    order by q.created_at desc;
end;
$$;

revoke all on function public.admin_list_qa_questions() from public, anon;
grant execute on function public.admin_list_qa_questions() to authenticated;

insert into public.moderation_terms
  (term, language, category, effect, match_mode, severity, source, source_url)
values
  ('在线赌场', 'zh', 'gambling', 'block', 'phrase', 4, 'The Room curated', null),
  ('博彩网站', 'zh', 'gambling', 'block', 'phrase', 4, 'The Room curated', null),
  ('真人下注', 'zh', 'gambling', 'block', 'phrase', 4, 'The Room curated', null),
  ('色情服务', 'zh', 'sexual', 'block', 'phrase', 4, 'The Room curated', null),
  ('成人视频', 'zh', 'sexual', 'block', 'phrase', 4, 'The Room curated', null),
  ('online casino', 'en', 'gambling', 'block', 'phrase', 4, 'The Room curated', null),
  ('sports betting', 'en', 'gambling', 'block', 'phrase', 4, 'The Room curated', null),
  ('casino bonus', 'en', 'gambling', 'block', 'phrase', 4, 'The Room curated', null),
  ('real money gambling', 'en', 'gambling', 'block', 'phrase', 4, 'The Room curated', null),
  ('crypto casino', 'en', 'gambling', 'block', 'phrase', 4, 'The Room curated', null)
on conflict (term, language, effect) do nothing;

-- ---------------------------------------------------------------------------
-- Semantic member search. Embeddings are private; only the match function
-- exposes public profile ids and aggregate relevance scores.

create table if not exists public.profile_search_documents (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  search_text text not null,
  embedding extensions.vector(384),
  embedded_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.member_embedding_jobs (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  queued_at timestamptz not null default now(),
  attempts integer not null default 0,
  last_error text
);

grant all on public.profile_search_documents, public.member_embedding_jobs to service_role;
alter table public.profile_search_documents enable row level security;
alter table public.member_embedding_jobs enable row level security;

create index if not exists profile_search_documents_embedding_idx
on public.profile_search_documents
using hnsw (embedding vector_cosine_ops)
where embedding is not null;

create or replace function public.queue_member_embedding()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.onboarded = true then
    insert into public.member_embedding_jobs (profile_id, queued_at, attempts, last_error)
    values (new.id, now(), 0, null)
    on conflict (profile_id) do update
      set queued_at = now(), attempts = 0, last_error = null;
  else
    delete from public.profile_search_documents where profile_id = new.id;
    delete from public.member_embedding_jobs where profile_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_queue_member_embedding on public.profiles;
create trigger profiles_queue_member_embedding
after insert or update of full_name, school, startup, position, website, tags, about, onboarded
on public.profiles
for each row execute function public.queue_member_embedding();

insert into public.member_embedding_jobs (profile_id)
select id from public.profiles where onboarded = true
on conflict (profile_id) do nothing;

create or replace function public.match_member_profiles(
  query_embedding extensions.vector(384),
  query_text text,
  match_count integer default 24
)
returns table (profile_id uuid, score double precision)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select
    d.profile_id,
    greatest(
      case
        when lower(coalesce(p.full_name, '')) = lower(trim(query_text)) then 1.0
        when lower(coalesce(p.full_name, '')) like '%' || lower(trim(query_text)) || '%' then 0.92
        when lower(d.search_text) like '%' || lower(trim(query_text)) || '%' then 0.76
        else 0.0
      end,
      coalesce((1 - (d.embedding <=> query_embedding)) * 0.70, 0)
      + case when lower(d.search_text) like '%' || lower(trim(query_text)) || '%' then 0.30 else 0 end
    )::double precision as score
  from public.profile_search_documents d
  join public.profiles p on p.id = d.profile_id
  where p.onboarded = true and p.full_name is not null and d.embedding is not null
  order by score desc, p.created_at desc
  limit greatest(1, least(match_count, 50));
$$;

grant execute on function public.match_member_profiles(extensions.vector, text, integer) to anon, authenticated;

-- Shared updated_at triggers.
drop trigger if exists invitation_codes_updated_at on public.invitation_codes;
create trigger invitation_codes_updated_at before update on public.invitation_codes
for each row execute function public.set_updated_at();
drop trigger if exists waitlist_entries_updated_at on public.waitlist_entries;
create trigger waitlist_entries_updated_at before update on public.waitlist_entries
for each row execute function public.set_updated_at();
drop trigger if exists moderation_terms_updated_at on public.moderation_terms;
create trigger moderation_terms_updated_at before update on public.moderation_terms
for each row execute function public.set_updated_at();
drop trigger if exists qa_questions_updated_at on public.qa_questions;
create trigger qa_questions_updated_at before update on public.qa_questions
for each row execute function public.set_updated_at();
drop trigger if exists qa_answers_updated_at on public.qa_answers;
create trigger qa_answers_updated_at before update on public.qa_answers
for each row execute function public.set_updated_at();
