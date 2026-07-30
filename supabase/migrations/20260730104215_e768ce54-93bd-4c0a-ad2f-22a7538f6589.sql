revoke execute on function public.has_role(uuid, public.app_role) from anon, public;
revoke execute on function public.redeem_invitation_code(text) from anon, public;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
grant execute on function public.redeem_invitation_code(text) to authenticated;