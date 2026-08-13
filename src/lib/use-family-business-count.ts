import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getFamilyBusinessCount } from "./site.functions";

/** Number of family businesses submitted by members. */
export function useFamilyBusinessCount() {
  const countFn = useServerFn(getFamilyBusinessCount);
  const { data } = useQuery({
    queryKey: ["family-business-count"],
    queryFn: async () => {
      try {
        return await countFn({ data: undefined });
      } catch {
        // Local environments may not have a service-role key before the public
        // count migration is applied. A signed-in member can still count rows
        // through the normal authenticated RLS policy.
        const { count, error } = await supabase
          .from("family_businesses")
          .select("id", { count: "exact", head: true });
        if (error) throw error;
        return count ?? 0;
      }
    },
    staleTime: 0,
    refetchOnMount: "always",
  });
  return data ?? 0;
}
