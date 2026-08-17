grant update on table public.profiles to authenticated;

drop policy if exists "Published questions are public" on public.qa_questions;
drop policy if exists "Admins read all questions" on public.qa_questions;
create policy "Published questions are public"
on public.qa_questions for select to anon, authenticated
using (status = 'published' and moderation_state = 'passed');
create policy "Admins read all questions"
on public.qa_questions for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Published answers are public" on public.qa_answers;
drop policy if exists "Admins read all answers" on public.qa_answers;
create policy "Published answers are public"
on public.qa_answers for select to anon, authenticated
using (status = 'published');
create policy "Admins read all answers"
on public.qa_answers for select to authenticated
using (public.has_role(auth.uid(), 'admin'));