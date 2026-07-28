REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.redeem_invitation_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_invitation_code(text) TO authenticated;