CREATE TABLE public.family_businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Other',
  website text,
  owner_name text,
  location text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_businesses TO authenticated;
GRANT ALL ON public.family_businesses TO service_role;

ALTER TABLE public.family_businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signed-in users can view businesses"
  ON public.family_businesses FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can add their own business"
  ON public.family_businesses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business"
  ON public.family_businesses FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own business"
  ON public.family_businesses FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER set_family_businesses_updated_at
  BEFORE UPDATE ON public.family_businesses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX family_businesses_user_id_idx ON public.family_businesses(user_id);