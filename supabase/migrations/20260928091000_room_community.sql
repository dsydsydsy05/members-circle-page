-- All state changes go through checked RPCs, never client-written consent flags.
create table public.member_connections (
 id uuid primary key default gen_random_uuid(),
 sender_id uuid not null references public.profiles(id) on delete cascade,
 recipient_id uuid not null references public.profiles(id) on delete cascade,
 reason text not null check(char_length(reason) between 8 and 500),
 status text not null default 'pending' check(status in ('pending','accepted','declined','withdrawn','disconnected','blocked')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(sender_id<>recipient_id)
);
create unique index member_connections_active_pair on public.member_connections
 (least(sender_id,recipient_id),greatest(sender_id,recipient_id)) where status in ('pending','accepted');
create table public.member_blocks (
 blocker_id uuid not null references public.profiles(id) on delete cascade,
 blocked_id uuid not null references public.profiles(id) on delete cascade,
 created_at timestamptz not null default now(), primary key(blocker_id,blocked_id), check(blocker_id<>blocked_id)
);
create table public.community_reports (
 id uuid primary key default gen_random_uuid(), reporter_id uuid not null references auth.users(id),
 target_type text not null check(target_type in ('question','answer','member')),
 target_id uuid not null, reason text not null check(char_length(reason) between 8 and 1000),
 status text not null default 'open' check(status in ('open','resolved','dismissed')),
 created_at timestamptz not null default now(), resolved_at timestamptz
);
create table public.community_notifications (
 id uuid primary key default gen_random_uuid(), connection_id uuid not null references public.member_connections(id) on delete cascade,
 actor_id uuid not null references auth.users(id), recipient_id uuid not null references auth.users(id),
 kind text not null check(kind in ('request','accepted')),
 status text not null default 'pending' check(status in ('pending','processing','sent','failed','cancelled')),
 error text, provider_id text, attempts integer not null default 0,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(connection_id,kind)
);
alter table public.qa_answers drop constraint if exists qa_answers_status_check;
alter table public.qa_answers add constraint qa_answers_status_check check(status in ('draft','published','deleted'));
alter table public.qa_answers alter column status set default 'draft';
alter table public.qa_answers add column guest_id uuid references public.guests(id), add column version integer not null default 1;
update public.qa_answers set status='draft' where responder_type='guest' and status='published';
create table public.qa_approvals (
 id uuid primary key default gen_random_uuid(), answer_id uuid not null references public.qa_answers(id) on delete cascade,
 version integer not null, token_hash text not null unique,
 answer_body text not null, guest_name text not null, guest_title text,
 status text not null default 'pending' check(status in ('pending','approved','declined','revoked')),
 expires_at timestamptz not null default now()+interval '7 days', decided_at timestamptz,
 created_at timestamptz not null default now()
);
-- Private tables have no browser grants. RPC responses explicitly choose public fields.
do $$ declare t text; begin
 foreach t in array array['member_connections','member_blocks','community_reports','community_notifications','qa_approvals'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from public,anon,authenticated',t);
 execute format('grant all on public.%I to service_role',t);
 end loop;
end $$;
grant select(guest_id,version) on public.qa_answers to anon,authenticated;

create function public.room_is_member(_id uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles where id=_id and is_member and onboarded)
$$;
create function public.room_blocked(_a uuid,_b uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.member_blocks where (blocker_id=_a and blocked_id=_b) or (blocker_id=_b and blocked_id=_a))
$$;
revoke all on function public.room_is_member(uuid),public.room_blocked(uuid,uuid) from public,anon,authenticated;

-- Replaces the old member-wide reveal, including direct RPC callers.
create or replace function public.reveal_member_contact_email(_profile_id uuid) returns text
language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); result text;
begin
 if u is null then raise exception 'Sign in to view contact details.'; end if;
 if u<>_profile_id and (not public.room_is_member(u) or not public.room_is_member(_profile_id)
  or public.room_blocked(u,_profile_id) or not exists(select 1 from public.member_connections
  where status='accepted' and ((sender_id=u and recipient_id=_profile_id) or (recipient_id=u and sender_id=_profile_id))))
 then raise exception 'Connect and receive permission before viewing this email.'; end if;
 select email into result from public.member_private_contacts where profile_id=_profile_id;
 return result;
end $$;
revoke all on function public.reveal_member_contact_email(uuid) from public,anon;
grant execute on function public.reveal_member_contact_email(uuid) to authenticated;

create function public.room_connections(_action text,_payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); target uuid; c public.member_connections; n uuid; result jsonb;
begin
 if u is null or not public.room_is_member(u) then raise exception 'Available to active members only.'; end if;
 if _action='list' then
  select coalesce(jsonb_agg(to_jsonb(x) order by x.updated_at desc),'[]') into result from (
   select mc.id,mc.sender_id,mc.recipient_id,mc.reason,mc.status,mc.updated_at,mc.created_at,p.full_name as name,p.avatar_url,
   p.position,p.startup from public.member_connections mc join public.profiles p on p.id=case when mc.sender_id=u then mc.recipient_id else mc.sender_id end
   where u in(mc.sender_id,mc.recipient_id)) x;
  return result;
 end if;
 if _action='blocks' then
  return coalesce((select jsonb_agg(jsonb_build_object('id',b.blocked_id,'name',p.full_name)) from public.member_blocks b join public.profiles p on p.id=b.blocked_id where b.blocker_id=u),'[]');
 end if;
 if _action in ('request','block','unblock') then
  target:=(_payload->>'target')::uuid;
  if target is null or target=u or not public.room_is_member(target) then raise exception 'This member is unavailable.'; end if;
 else
  select * into c from public.member_connections where id=(_payload->>'id')::uuid;
  if c.id is null or u not in(c.sender_id,c.recipient_id) then raise exception 'Request not found.'; end if;
  target:=case when c.sender_id=u then c.recipient_id else c.sender_id end;
 end if;
 -- Serialize every action on a pair, including simultaneous opposite requests.
 perform pg_advisory_xact_lock(hashtextextended(least(u,target)::text||greatest(u,target)::text,0));
 if c.id is not null then select * into c from public.member_connections where id=c.id for update; end if;
 if _action='block' then
  insert into public.member_blocks values(u,target,now()) on conflict do nothing;
  update public.member_connections set status='blocked',updated_at=now() where status in ('pending','accepted') and ((sender_id=u and recipient_id=target) or (sender_id=target and recipient_id=u));
 elsif _action='unblock' then
  delete from public.member_blocks where blocker_id=u and blocked_id=target;
 elsif _action='request' then
  if public.room_blocked(u,target) then raise exception 'This connection is unavailable.'; end if;
  if coalesce(_payload->>'consent','false')<>'true' then raise exception 'Confirm the email exchange first.'; end if;
  if not exists(select 1 from public.member_private_contacts where profile_id=u) then raise exception 'Add your contact email in My pass first.'; end if;
  if exists(select 1 from public.member_connections where status in('pending','accepted') and ((sender_id=u and recipient_id=target) or (sender_id=target and recipient_id=u))) then raise exception 'A request or connection already exists.'; end if;
  if exists(select 1 from public.member_connections where status='declined' and updated_at>now()-interval '30 days' and ((sender_id=u and recipient_id=target) or (sender_id=target and recipient_id=u))) then raise exception 'Please wait 30 days before requesting this connection again.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(u::text,1));
  if (select count(*) from public.member_connections where sender_id=u and created_at>now()-interval '1 day')>=10 then raise exception 'Daily request limit reached. Please try tomorrow.'; end if;
  insert into public.member_connections(sender_id,recipient_id,reason) values(u,target,trim(_payload->>'reason')) returning * into c;
  insert into public.community_notifications(connection_id,actor_id,recipient_id,kind) values(c.id,u,target,'request') returning id into n;
 elsif _action='accept' then
  if c.status<>'pending' or c.recipient_id<>u then raise exception 'This request cannot be accepted.'; end if;
  if public.room_blocked(u,target) or not public.room_is_member(target) then raise exception 'This connection is unavailable.'; end if;
  if coalesce(_payload->>'consent','false')<>'true' then raise exception 'Confirm the email exchange first.'; end if;
  if (select count(*) from public.member_private_contacts where profile_id in(u,target))<>2 then raise exception 'Both members must add a contact email in My pass first.'; end if;
  update public.member_connections set status='accepted',updated_at=now() where id=c.id;
  insert into public.community_notifications(connection_id,actor_id,recipient_id,kind) values(c.id,u,target,'accepted') returning id into n;
 elsif _action='decline' and c.status='pending' and c.recipient_id=u then
  update public.member_connections set status='declined',updated_at=now() where id=c.id;
 elsif _action='withdraw' and c.status='pending' and c.sender_id=u then
  update public.member_connections set status='withdrawn',updated_at=now() where id=c.id;
 elsif _action='disconnect' and c.status='accepted' then
  update public.member_connections set status='disconnected',updated_at=now() where id=c.id;
 else raise exception 'This action is no longer available.';
 end if;
 return jsonb_build_object('notification_id',n);
end $$;
revoke all on function public.room_connections(text,jsonb) from public,anon;
grant execute on function public.room_connections(text,jsonb) to authenticated;

create function public.room_report(_type text,_id uuid,_reason text) returns uuid
language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); r uuid;
begin
 if u is null then raise exception 'Sign in to report content.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(u::text,2));
 if (select count(*) from public.community_reports where reporter_id=u and created_at>now()-interval '1 day')>=10 then raise exception 'Report limit reached.'; end if;
 if not ((_type='question' and exists(select 1 from public.qa_questions where id=_id and status='published')) or
 (_type='answer' and exists(select 1 from public.qa_answers where id=_id and status='published')) or
 (_type='member' and public.room_is_member(_id))) then raise exception 'Content not found.'; end if;
 insert into public.community_reports(reporter_id,target_type,target_id,reason) values(u,_type,_id,trim(_reason)) returning id into r;
 return r;
end $$;
revoke all on function public.room_report(text,uuid,text) from public,anon;
grant execute on function public.room_report(text,uuid,text) to authenticated;

-- Runs even for a direct admin REST write. Approval state cannot be supplied by a browser.
create function public.room_answer_guard() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.responder_type='admin' then new.responder_name:='The Room'; new.responder_title:=null; new.responder_avatar_url:=null; new.guest_id:=null; end if;
 if tg_op='UPDATE' then
  if row(new.body,new.guest_id,new.responder_type,new.responder_name,new.responder_title,new.responder_avatar_url,new.question_id)
    is distinct from row(old.body,old.guest_id,old.responder_type,old.responder_name,old.responder_title,old.responder_avatar_url,old.question_id) then
   new.version:=old.version+1;
   update public.qa_approvals set status='revoked' where answer_id=old.id and status in('pending','approved');
   if new.responder_type='guest' then new.status:='draft'; end if;
  else new.version:=old.version; end if;
 else new.version:=1; end if;
 if new.responder_type='guest' and new.status='published' and (new.guest_id is null or not exists(
  select 1 from public.qa_approvals where answer_id=new.id and version=new.version and status='approved'))
 then raise exception 'This answer version needs guest approval before publication.'; end if;
 return new;
end $$;
create trigger room_answer_guard before insert or update on public.qa_answers for each row execute function public.room_answer_guard();

create function public.room_qa_admin(_action text,_payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
declare a public.qa_answers; g public.guests; token text; result jsonb;
begin
 if auth.uid() is null or not public.has_role(auth.uid(),'admin'::public.app_role) then raise exception 'Admin access required.'; end if;
 if _action='list' then
  return jsonb_build_object('answers',coalesce((select jsonb_agg(to_jsonb(q) order by q.created_at) from public.qa_answers q),'[]'),
   'approvals',coalesce((select jsonb_agg(jsonb_build_object('id',id,'answer_id',answer_id,'version',version,'status',status,'expires_at',expires_at,'decided_at',decided_at)) from public.qa_approvals),'[]'));
 end if;
 if _action='save' then
  if _payload->>'responder_type'='guest' then
   select * into g from public.guests where id=(_payload->>'guest_id')::uuid;
   if g.id is null then raise exception 'Select a guest profile first.'; end if;
  end if;
  if _payload->>'id' is not null then
   update public.qa_answers set body=trim(_payload->>'body'),guest_id=g.id,
    responder_type=_payload->>'responder_type',responder_name=coalesce(g.name,'The Room'),
    responder_title=g.title,responder_avatar_url=g.avatar_url,status='draft'
    where id=(_payload->>'id')::uuid returning * into a;
  else
   insert into public.qa_answers(question_id,body,guest_id,responder_type,responder_name,responder_title,responder_avatar_url,published_by,status)
   values((_payload->>'question_id')::uuid,trim(_payload->>'body'),g.id,_payload->>'responder_type',coalesce(g.name,'The Room'),g.title,g.avatar_url,auth.uid(),'draft') returning * into a;
  end if;
  if a.id is null then raise exception 'Answer not found.'; end if;
  return to_jsonb(a);
 end if;
 select * into a from public.qa_answers where id=(_payload->>'id')::uuid for update;
 if a.id is null then raise exception 'Answer not found.'; end if;
 if _action='invite' then
  if a.guest_id is null or a.responder_type<>'guest' or a.status='deleted' then raise exception 'Choose an active guest answer.'; end if;
  update public.qa_approvals set status='revoked' where answer_id=a.id and status in('pending','approved');
  update public.qa_answers set status='draft' where id=a.id;
  token:=gen_random_uuid()::text||gen_random_uuid()::text;
  insert into public.qa_approvals(answer_id,version,token_hash,answer_body,guest_name,guest_title)
   values(a.id,a.version,encode(sha256(convert_to(token,'UTF8')),'hex'),a.body,a.responder_name,a.responder_title);
  return jsonb_build_object('token',token);
 elsif _action='revoke' then
  update public.qa_approvals set status='revoked' where answer_id=a.id and status in('pending','approved');
  update public.qa_answers set status='draft' where id=a.id;
 elsif _action='publish' then
  if not exists(select 1 from public.qa_questions where id=a.question_id and status='published' and moderation_state='passed') then raise exception 'Restore the question before publishing.'; end if;
  update public.qa_answers set status='published' where id=a.id;
 elsif _action='delete' then
  update public.qa_answers set status='deleted',deleted_at=now(),deleted_by=auth.uid() where id=a.id;
  update public.qa_approvals set status='revoked' where answer_id=a.id and status in('pending','approved');
 else raise exception 'Unknown action.'; end if;
 return '{}'::jsonb;
end $$;
revoke all on function public.room_qa_admin(text,jsonb) from public,anon;
grant execute on function public.room_qa_admin(text,jsonb) to authenticated;

create function public.room_guest_approval(_token text,_decision text default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare approval public.qa_approvals; a public.qa_answers; aid uuid;
begin
 select answer_id into aid from public.qa_approvals where token_hash=encode(sha256(convert_to(_token,'UTF8')),'hex');
 -- Lock answer first, matching edit/revoke order; never let approval race an edit.
 select * into a from public.qa_answers where id=aid for update;
 select * into approval from public.qa_approvals where token_hash=encode(sha256(convert_to(_token,'UTF8')),'hex') for update;
 if approval.id is null or approval.status='revoked' or approval.expires_at<=now() or a.version<>approval.version or a.status='deleted'
 then raise exception 'This link is unavailable or expired. Ask The Room for a new link.'; end if;
 if _decision is not null then
  if _decision not in('approved','declined') or approval.status<>'pending' then raise exception 'This review has already been completed.'; end if;
  update public.qa_approvals set status=_decision,decided_at=now() where id=approval.id;
  approval.status:=_decision;
 end if;
 return jsonb_build_object('body',approval.answer_body,'name',approval.guest_name,'title',approval.guest_title,
  'question',(select body from public.qa_questions where id=a.question_id),'status',approval.status,'expires_at',approval.expires_at);
end $$;
revoke all on function public.room_guest_approval(text,text) from public;
grant execute on function public.room_guest_approval(text,text) to anon,authenticated;

create function public.room_moderation_admin(_action text,_payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not public.has_role(auth.uid(),'admin'::public.app_role) then raise exception 'Admin access required.'; end if;
 if _action='list' then return jsonb_build_object(
 'reports',coalesce((select jsonb_agg(to_jsonb(r) order by created_at desc) from public.community_reports r),'[]'),
 'notifications',coalesce((select jsonb_agg(to_jsonb(n) order by created_at desc) from public.community_notifications n where status in('failed','pending','processing')),'[]'));
 elsif _action='resolve' then
  update public.community_reports set status=_payload->>'status',resolved_at=now() where id=(_payload->>'id')::uuid;
 else raise exception 'Unknown action.'; end if;
 return '{}'::jsonb;
end $$;
revoke all on function public.room_moderation_admin(text,jsonb) from public,anon;
grant execute on function public.room_moderation_admin(text,jsonb) to authenticated;

-- Removing a question removes its answers from the public read surface as well.
drop policy if exists "Published answers are public" on public.qa_answers;
create policy "Published answers are public" on public.qa_answers for select to anon,authenticated
 using(status='published' and exists(select 1 from public.qa_questions q where q.id=question_id and q.status='published' and q.moderation_state='passed'));

-- The legacy table-level UPDATE grant must not let users activate their own membership.
-- Invoker context allows existing SECURITY DEFINER membership/claim flows to continue.
create function public.room_membership_guard() returns trigger language plpgsql set search_path='' as $$
begin
 if current_user in ('authenticated','anon') and not public.has_role(auth.uid(),'admin'::public.app_role) then
  if (tg_op='INSERT' and new.is_member) or (tg_op='UPDATE' and new.is_member is distinct from old.is_member) then
   raise exception 'Membership can only be changed by The Room.';
  end if;
 end if;
 return new;
end $$;
create trigger room_membership_guard before insert or update on public.profiles for each row execute function public.room_membership_guard();
