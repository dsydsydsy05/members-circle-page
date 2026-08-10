import { createServerFn } from "@tanstack/react-start";

export const getFamilyBusinessCount = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count, error } = await supabaseAdmin
    .from("family_businesses")
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
});
