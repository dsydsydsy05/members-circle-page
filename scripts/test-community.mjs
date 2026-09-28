import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
const db = new PGlite();
const sql = String.raw;
await db.exec(sql`
 create role anon; create role authenticated; create role service_role;
 create schema auth;
 create table auth.users(id uuid primary key,email text);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth,public to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;
 create type public.app_role as enum('admin','moderator','user');
 create table public.user_roles(user_id uuid,role public.app_role);
 create function public.has_role(_user_id uuid,_role public.app_role) returns boolean language sql stable security definer as $$select exists(select 1 from public.user_roles where user_id=_user_id and role=_role)$$;
 create table public.profiles(id uuid primary key references auth.users(id),full_name text,avatar_url text,position text,startup text,is_member boolean,onboarded boolean);
 create table public.member_private_contacts(profile_id uuid primary key references public.profiles(id),email text);
 create table public.guests(id uuid primary key default gen_random_uuid(),name text,title text,event text,date_label text,sort_order int default 0);
 create table public.events(id uuid primary key default gen_random_uuid(),slug text unique,title text,date_label text,city text,status text,cover_url text,detail_image_url text,summary text,body text,sort_order int);
 create table public.qa_questions(id uuid primary key default gen_random_uuid(),author_id uuid,body text,status text default 'published',moderation_state text default 'passed');
 create table public.qa_answers(id uuid primary key default gen_random_uuid(),question_id uuid references public.qa_questions(id),body text not null check(char_length(body) between 1 and 4000),responder_type text not null check(responder_type in('admin','guest')),responder_name text,responder_title text,responder_avatar_url text,published_by uuid,status text default 'published' check(status in('published','deleted')),created_at timestamptz default now(),updated_at timestamptz default now(),deleted_at timestamptz,deleted_by uuid);
 alter table public.qa_answers enable row level security;alter table public.qa_questions enable row level security;
 create policy "Published questions are public" on public.qa_questions for select using(status='published' and moderation_state='passed');
 create policy "Admins manage answers" on public.qa_answers for all to authenticated using(public.has_role(auth.uid(),'admin')) with check(public.has_role(auth.uid(),'admin'));
 grant select(id,body,status,moderation_state) on public.qa_questions to anon,authenticated;
 grant select(id,question_id,body,responder_type,responder_name,responder_title,responder_avatar_url,status,created_at) on public.qa_answers to anon,authenticated;
 grant insert,update on public.qa_answers to authenticated;
`);
await db.exec(`
 insert into events(slug,title,date_label,status,sort_order) values
 ('waic-2026-founders-dinner','WAIC 2026 Founder’s Dinner','July 18, 2026','past',1),
 (null,'The Room Opening: Our First Guest','Sep 15','upcoming',1),
 (null,'How to Raise Funding','Oct 15','upcoming',2),
 (null,'How to Take a Company Public','Nov 15','upcoming',3);
`);
for (const f of [
  "20260928090000_room_stories.sql",
  "20260928091000_room_community.sql",
  "20260928092000_event_schedule.sql",
])
  await db.exec(await readFile(new URL(`../supabase/migrations/${f}`, import.meta.url), "utf8"));
const ids = {
  a: "00000000-0000-4000-8000-000000000001",
  b: "00000000-0000-4000-8000-000000000002",
  x: "00000000-0000-4000-8000-000000000003",
  admin: "00000000-0000-4000-8000-000000000004",
  no: "00000000-0000-4000-8000-000000000005",
};
for (const [key, id] of Object.entries(ids)) {
  await db.query("insert into auth.users values($1,$2)", [id, `${key}@test.invalid`]);
  await db.query("insert into profiles(id,full_name,is_member,onboarded) values($1,$2,$3,true)", [
    id,
    key,
    key !== "no",
  ]);
  if (key !== "x")
    await db.query("insert into member_private_contacts values($1,$2)", [
      id,
      `${key}@contact.invalid`,
    ]);
}
await db.query("insert into user_roles values($1,'admin')", [ids.admin]);
const as = async (user, role = "authenticated") => {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [user || ""]);
  await db.exec(`set role ${role}`);
};
const rpc = async (name, args) => {
  const params = args.map((_, i) => `$${i + 1}`).join(",");
  return (await db.query(`select public.${name}(${params}) as value`, args)).rows[0].value;
};
const con = (a, p = {}) => rpc("room_connections", [a, p]);
const qa = (a, p = {}) => rpc("room_qa_admin", [a, p]);
let count = 0;
async function test(name, fn) {
  await fn();
  count++;
  console.log(`PASS ${name}`);
}
const rejects = (fn, pattern) => assert.rejects(fn, pattern);
let connection, notification, answer, token, question, guest;
await test("Boston archive retains exact count, cover and copy", async () => {
  const event = (
    await db.query("select * from events where slug='boston-founder-dinner-2026-09-18'")
  ).rows[0];
  assert.equal(event.attendance_label, "19 founders");
  assert.match(event.body, /Briar Group/);
  assert.equal(event.cover_display, "poster");
  assert.equal(event.archive_number, 2);
  assert.equal(
    (await db.query("select archive_number from events where slug='waic-2026-founders-dinner'"))
      .rows[0].archive_number,
    1,
  );
  assert.deepEqual(
    (
      await db.query("select date_label from events where status='upcoming' order by sort_order")
    ).rows.map((row) => row.date_label),
    ["Oct 15", "Nov 15", "Dec 15"],
  );
});
await test("legacy profile UPDATE permission cannot self-activate membership", async () => {
  await db.exec("grant select,update on profiles to authenticated");
  await as(ids.no);
  await rejects(
    () => db.query("update profiles set is_member=true where id=$1", [ids.no]),
    /Membership/,
  );
  await as(null, "postgres");
});
await test("anonymous and non-members cannot connect", async () => {
  await as(null, "anon");
  await rejects(() => con("list"), /permission denied/);
  await as(ids.no);
  await rejects(() => con("list"), /active members/);
});
await test("unconnected member cannot reveal email", async () => {
  await as(ids.a);
  await rejects(() => rpc("reveal_member_contact_email", [ids.b]), /permission/);
  assert.equal(await rpc("reveal_member_contact_email", [ids.a]), "a@contact.invalid");
});
await test("self request, missing email and consent fail", async () => {
  await rejects(
    () => con("request", { target: ids.a, reason: "Hello there", consent: true }),
    /unavailable/,
  );
  await rejects(() => con("request", { target: ids.b, reason: "Hello there" }), /Confirm/);
  await rejects(
    () => con("request", { target: ids.b, reason: "Hello there", consent: null }),
    /Confirm/,
  );
  await as(ids.x);
  await rejects(
    () => con("request", { target: ids.b, reason: "Hello there", consent: true }),
    /contact email/,
  );
});
await test("request commits with durable email outbox", async () => {
  await as(ids.a);
  const r = await con("request", {
    target: ids.b,
    reason: "Would love to discuss your project.",
    consent: true,
  });
  notification = r.notification_id;
  assert.ok(notification);
  connection = (await con("list"))[0].id;
});
await test("duplicate and opposite request cannot bypass active pair", async () => {
  await rejects(
    () => con("request", { target: ids.b, reason: "Another request", consent: true }),
    /already exists/,
  );
  await as(ids.b);
  await rejects(
    () => con("request", { target: ids.a, reason: "Another request", consent: true }),
    /already exists/,
  );
});
await test("outsider cannot inspect requests or act on them", async () => {
  await as(ids.x);
  assert.equal((await con("list")).length, 0);
  await rejects(() => con("accept", { id: connection, consent: true }), /not found/);
  await rejects(() => db.query("select * from member_connections"), /permission denied/);
});
await test("sender cannot accept; recipient must consent", async () => {
  await as(ids.a);
  await rejects(() => con("accept", { id: connection, consent: true }), /cannot be accepted/);
  await as(ids.b);
  await rejects(() => con("accept", { id: connection }), /Confirm/);
});
await test("accept unlocks only the two members", async () => {
  await con("accept", { id: connection, consent: true });
  assert.equal(await rpc("reveal_member_contact_email", [ids.a]), "a@contact.invalid");
  await as(ids.a);
  assert.equal(await rpc("reveal_member_contact_email", [ids.b]), "b@contact.invalid");
  await as(ids.x);
  await rejects(() => rpc("reveal_member_contact_email", [ids.a]), /permission/);
});
await test("email failure does not remove a connection", async () => {
  await as(null, "postgres");
  await db.query(
    "update community_notifications set status='failed',error='Simulated provider outage' where id=$1",
    [notification],
  );
  await as(ids.a);
  assert.equal((await con("list"))[0].status, "accepted");
});
await test("disconnect revokes email; stale acceptance cannot restore it", async () => {
  await con("disconnect", { id: connection });
  await rejects(() => rpc("reveal_member_contact_email", [ids.b]), /permission/);
  await as(ids.b);
  await rejects(() => con("accept", { id: connection, consent: true }), /cannot be accepted/);
});
await test("decline cooldown applies to both directions", async () => {
  await as(ids.a);
  await con("request", { target: ids.b, reason: "Can we reconnect?", consent: true });
  connection = (await con("list"))[0].id;
  await as(ids.b);
  await con("decline", { id: connection });
  await rejects(
    () => con("request", { target: ids.a, reason: "Try once more", consent: true }),
    /30 days/,
  );
  await as(ids.a);
  await rejects(
    () => con("request", { target: ids.b, reason: "Try once more", consent: true }),
    /30 days/,
  );
});
await test("withdraw, block, unblock do not restore a connection", async () => {
  await as(null, "postgres");
  await db.query("insert into member_private_contacts values($1,$2)", [ids.x, "x@contact.invalid"]);
  await as(ids.a);
  await con("request", { target: ids.x, reason: "Interested in your work", consent: true });
  let id = (await con("list"))[0].id;
  await con("withdraw", { id });
  await con("request", { target: ids.x, reason: "Interested in your work", consent: true });
  await as(ids.x);
  await con("block", { target: ids.a });
  await as(ids.a);
  await rejects(
    () => con("request", { target: ids.x, reason: "Interested in your work", consent: true }),
    /unavailable/,
  );
  await as(ids.x);
  await con("unblock", { target: ids.a });
  assert.ok((await con("list")).every((c) => c.status !== "accepted"));
});
await as(null, "postgres");
question = (
  await db.query(
    "insert into qa_questions(body,author_id) values('How do you start a company?',$1) returning id",
    [ids.a],
  )
).rows[0].id;
guest = (
  await db.query(
    "insert into guests(name,title,bio) values('Test Guest','Founder','Test guest biography') returning id",
  )
).rows[0].id;
await test("non-admin cannot create or read answer drafts", async () => {
  await as(ids.a);
  await rejects(() => qa("list"), /Admin/);
});
await test("guest draft is not public and cannot publish without consent", async () => {
  await as(ids.admin);
  answer = await qa("save", {
    question_id: question,
    body: "Start with a conversation.",
    responder_type: "guest",
    guest_id: guest,
  });
  await rejects(() => qa("publish", { id: answer.id }), /guest approval/);
  await as(null, "anon");
  assert.equal((await db.query("select id,body from qa_answers")).rows.length, 0);
  await rejects(() => db.query("select * from qa_approvals"), /permission denied/);
  await rejects(() => db.query("select author_id from qa_questions"), /permission denied/);
});
await test("direct admin writes cannot fabricate published guest answers", async () => {
  await as(ids.admin);
  await rejects(
    () => db.query("update qa_answers set status='published' where id=$1", [answer.id]),
    /guest approval/,
  );
});
await test("private guest link approves exact version, then admin publishes", async () => {
  token = (await qa("invite", { id: answer.id })).token;
  await as(null, "anon");
  const preview = await rpc("room_guest_approval", [token]);
  assert.equal(preview.body, answer.body);
  assert.equal(preview.token_hash, undefined);
  await rpc("room_guest_approval", [token, "approved"]);
  await rejects(() => rpc("room_guest_approval", [token, "approved"]), /already been completed/);
  await as(ids.admin);
  await qa("publish", { id: answer.id });
  await as(null, "anon");
  assert.equal((await db.query("select id from qa_answers")).rows.length, 1);
});
await test("editing published answer invalidates old link and increments version", async () => {
  await as(ids.admin);
  const changed = await qa("save", {
    id: answer.id,
    body: "Start with a different conversation.",
    responder_type: "guest",
    guest_id: guest,
  });
  assert.equal(changed.version, 2);
  assert.equal(changed.status, "draft");
  await rejects(() => qa("publish", { id: answer.id }), /guest approval/);
  await as(null, "anon");
  await rejects(() => rpc("room_guest_approval", [token]), /unavailable/);
});
await test("declined, revoked and expired links cannot authorize publication", async () => {
  await as(ids.admin);
  token = (await qa("invite", { id: answer.id })).token;
  await as(null, "anon");
  await rpc("room_guest_approval", [token, "declined"]);
  await as(ids.admin);
  await rejects(() => qa("publish", { id: answer.id }), /guest approval/);
  token = (await qa("invite", { id: answer.id })).token;
  await qa("revoke", { id: answer.id });
  await as(null, "anon");
  await rejects(() => rpc("room_guest_approval", [token, "approved"]), /unavailable/);
  await as(ids.admin);
  token = (await qa("invite", { id: answer.id })).token;
  await as(null, "postgres");
  await db.exec("update qa_approvals set expires_at=now()-interval '1 second'");
  await as(null, "anon");
  await rejects(() => rpc("room_guest_approval", [token, "approved"]), /expired/);
});
await test("published answers disappear when parent question is hidden", async () => {
  await as(ids.admin);
  token = (await qa("invite", { id: answer.id })).token;
  await as(null, "anon");
  await rpc("room_guest_approval", [token, "approved"]);
  await as(ids.admin);
  await qa("publish", { id: answer.id });
  await as(null, "postgres");
  await db.query("update qa_questions set status='deleted' where id=$1", [question]);
  await as(null, "anon");
  assert.equal((await db.query("select id from qa_answers")).rows.length, 0);
});
await test("reports stay private and only admins resolve them", async () => {
  await as(ids.a);
  const report = await rpc("room_report", ["member", ids.b, "Please review this interaction."]);
  await rejects(() => rpc("room_moderation_admin", ["list", {}]), /Admin/);
  await rejects(() => db.query("select * from community_reports"), /permission denied/);
  await as(ids.admin);
  const list = await rpc("room_moderation_admin", ["list", {}]);
  assert.equal(list.reports[0].id, report);
  await rpc("room_moderation_admin", ["resolve", { id: report, status: "resolved" }]);
});
console.log(`\n${count} database integration scenarios passed.`);
await db.close();
