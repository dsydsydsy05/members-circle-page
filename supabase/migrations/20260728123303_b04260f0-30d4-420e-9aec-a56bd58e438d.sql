CREATE SEQUENCE IF NOT EXISTS public.member_no_seq AS integer START 1;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS member_no integer;

DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT id FROM public.profiles WHERE member_no IS NULL ORDER BY created_at ASC LOOP
    UPDATE public.profiles SET member_no = nextval('public.member_no_seq') WHERE id = r.id;
  END LOOP;
END $$;

ALTER TABLE public.profiles ALTER COLUMN member_no SET DEFAULT nextval('public.member_no_seq');

CREATE UNIQUE INDEX IF NOT EXISTS profiles_member_no_key ON public.profiles(member_no);