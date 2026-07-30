import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export function useIsAdmin() {
  const { userId, loading } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["is-admin", userId],
    enabled: Boolean(userId),
    staleTime: 60_000,
    queryFn: async () => {
      if (!userId) return false;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      if (error) return false;
      return Boolean(data);
    },
  });

  return { isAdmin: Boolean(data), loading: loading || (Boolean(userId) && isLoading) };
}
