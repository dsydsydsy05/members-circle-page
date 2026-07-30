DROP POLICY IF EXISTS "Signed-in users can view businesses" ON public.family_businesses;

CREATE POLICY "Members can view businesses"
ON public.family_businesses
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.is_member = true
  )
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR auth.uid() = user_id
);