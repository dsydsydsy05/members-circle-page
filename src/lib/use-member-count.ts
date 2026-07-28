import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Number of people who have completed onboarding (real registered members). */
export function useMemberCount() {
  const { data } = useQuery({
    queryKey: ["member-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("onboarded", true);
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 60_000,
  });
  return data ?? 0;
}
