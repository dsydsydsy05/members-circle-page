import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getFactoryCount } from "./site.functions";

// The verified workbook currently contains 26 publishable suppliers. Keep the
// public homepage aligned while Lovable is still waiting for the import/count
// migrations; a larger live database count always wins.
const STAGED_FACTORY_COUNT = 26;

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
  return Math.max(data ?? 0, STAGED_FACTORY_COUNT);
}
