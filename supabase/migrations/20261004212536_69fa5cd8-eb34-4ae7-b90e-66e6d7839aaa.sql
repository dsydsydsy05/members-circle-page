CREATE TABLE public.qa_replies (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 question_id uuid NOT NULL REFERENCES public.qa_questions(id) ON DELETE CASCADE,
 author_id uuid NOT NULL REFERENCES auth.users(id),
 author_name text NOT NULL DEFAULT 'Community participant',
 body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
 status text NOT NULL DEFAULT 'published' CHECK (status IN ('published','deleted')),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT (id, question_id, author_name, body, status, created_at) ON public.qa_replies TO anon, authenticated;
GRANT ALL ON public.qa_replies TO service_role;
ALTER TABLE public.qa_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published community replies" ON public.qa_replies FOR SELECT TO anon, authenticated USING (
 status = 'published' AND EXISTS (SELECT 1 FROM public.qa_questions q WHERE q.id = question_id AND q.status = 'published' AND q.moderation_state = 'passed')
);
CREATE POLICY "Authors read their replies" ON public.qa_replies FOR SELECT TO authenticated USING (author_id = auth.uid());
CREATE POLICY "Admins read replies" ON public.qa_replies FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE INDEX qa_replies_question_created_idx ON public.qa_replies(question_id, created_at);
CREATE INDEX qa_replies_author_created_idx ON public.qa_replies(author_id, created_at);
CREATE TRIGGER qa_replies_updated BEFORE UPDATE ON public.qa_replies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE FUNCTION public.remove_qa_reply(_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in required.'; END IF;
 UPDATE public.qa_replies SET status='deleted' WHERE id=_id AND (author_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
 IF NOT FOUND THEN RAISE EXCEPTION 'Reply not found.'; END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.remove_qa_reply(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.remove_qa_reply(uuid) TO authenticated;