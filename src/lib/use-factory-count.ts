import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getFactoryCount } from "./site.functions";

/** Public total only; factory records remain protected by database RLS. */
export function useFactoryCount() {
  const countFn = useServerFn(getFactoryCount);
  const { data } = useQuery({
    queryKey: ["factory-count"],
    queryFn: async () => {
      try {
        return await countFn({ data: undefined });
      } catch {
        const { count, error } = await supabase
          .from("factories")
          .select("id", { count: "exact", head: true });
        if (error) throw error;
        return count ?? 0;
      }
    },
    staleTime: 30_000,
  });
  return data ?? 0;
}
