-- Preserve current public announcements while introducing explicit publication control.
ALTER TABLE public.guests ADD COLUMN is_published boolean NOT NULL DEFAULT true;
ALTER TABLE public.guests ALTER COLUMN is_published SET DEFAULT false;
GRANT SELECT ON public.guests TO anon, authenticated;
GRANT ALL ON public.guests TO service_role;
DROP POLICY "Guests are viewable by everyone" ON public.guests;
CREATE POLICY "Published guests are publicly viewable"
ON public.guests FOR SELECT TO anon, authenticated
USING (is_published = true);

-- Owners can still sign their uploads; shared signed profile URLs keep working.
DROP POLICY "Anyone can read avatars" ON storage.objects;
CREATE POLICY "Owners can read their own avatars"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'avatars' AND owner_id = (SELECT auth.uid()::text));