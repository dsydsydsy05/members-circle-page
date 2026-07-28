REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, avatar_url, school, startup, position, website, tags, about, onboarded) ON public.profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.redeem_invitation_code(_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF lower(trim(_code)) <> 'theroom2026' THEN
    RETURN false;
  END IF;
  INSERT INTO public.profiles (id, is_member) VALUES (uid, true)
  ON CONFLICT (id) DO UPDATE SET is_member = true;
  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.redeem_invitation_code(TEXT) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.redeem_invitation_code(TEXT) TO authenticated;