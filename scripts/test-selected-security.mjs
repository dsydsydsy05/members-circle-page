import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const db = new PGlite();
await db.exec(`
  CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
  CREATE SCHEMA auth; CREATE SCHEMA storage;
  CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
    SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid
  $$;
  GRANT USAGE ON SCHEMA public,auth,storage TO anon,authenticated;
  CREATE FUNCTION public.has_role(uuid,text) RETURNS boolean LANGUAGE sql STABLE AS $$
    SELECT $1 = '00000000-0000-4000-8000-000000000003'::uuid AND $2 = 'admin'
  $$;
  CREATE TABLE public.guests(id int PRIMARY KEY,name text);
  GRANT SELECT,INSERT,UPDATE,DELETE ON public.guests TO authenticated;
  ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Guests are viewable by everyone" ON public.guests FOR SELECT USING(true);
  CREATE POLICY "Admins manage guests" ON public.guests FOR ALL TO authenticated
    USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
  INSERT INTO public.guests VALUES(1,'Existing announcement');
  CREATE TABLE storage.objects(id int PRIMARY KEY,bucket_id text,owner_id text);
  GRANT SELECT ON storage.objects TO anon,authenticated;
  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Anyone can read avatars" ON storage.objects FOR SELECT TO anon,authenticated USING(bucket_id='avatars');
  INSERT INTO storage.objects VALUES
    (1,'avatars','00000000-0000-4000-8000-000000000001'),
    (2,'avatars','00000000-0000-4000-8000-000000000002'),
    (3,'media','00000000-0000-4000-8000-000000000001');
`);
await db.exec(await readFile(new URL('../drizzle/migrations/0005_selected_guest_avatar_security.sql', import.meta.url),'utf8'));
await db.exec("INSERT INTO public.guests(id,name) VALUES(2,'Private draft')");
async function as(role,user='') {
  await db.exec('RESET ROLE');
  await db.query("SELECT set_config('request.jwt.claim.sub',$1,false)",[user]);
  await db.exec(`SET ROLE ${role}`);
}
const rows = async (table) => (await db.query(`SELECT id FROM ${table} ORDER BY id`)).rows.map(r=>r.id);
await as('anon');
assert.deepEqual(await rows('public.guests'),[1]);
assert.deepEqual(await rows('storage.objects'),[]);
console.log('PASS anonymous readers see published guests only and no raw avatar files');
await as('authenticated','00000000-0000-4000-8000-000000000001');
assert.deepEqual(await rows('public.guests'),[1]);
assert.deepEqual(await rows('storage.objects'),[1]);
assert.equal((await db.query('UPDATE public.guests SET is_published=true WHERE id=2 RETURNING id')).rows.length,0);
console.log('PASS signed-in user reads only owned avatars and cannot publish guest drafts');
await as('authenticated','00000000-0000-4000-8000-000000000002');
assert.deepEqual(await rows('storage.objects'),[2]);
await as('authenticated','00000000-0000-4000-8000-000000000003');
assert.deepEqual(await rows('public.guests'),[1,2]);
await db.exec('UPDATE public.guests SET is_published=true WHERE id=2');
await as('anon');
assert.deepEqual(await rows('public.guests'),[1,2]);
console.log('PASS admins retain draft access and control guest publication');
await db.close();