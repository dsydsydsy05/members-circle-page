import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Number of family businesses submitted by members. */
export function useFamilyBusinessCount() {
  const { data } = useQuery({
    queryKey: ["family-business-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("family_businesses")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 0,
    refetchOnMount: "always",
  });
  return data ?? 0;
}
