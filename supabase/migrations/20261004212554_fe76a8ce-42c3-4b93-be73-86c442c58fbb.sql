REVOKE ALL ON FUNCTION public.remove_qa_reply(uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.remove_qa_reply(uuid) TO service_role;