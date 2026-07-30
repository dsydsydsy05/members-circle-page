import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getFamilyBusinessCount } from "./site.functions";

/** Number of family businesses submitted by members. */
export function useFamilyBusinessCount() {
  const countFn = useServerFn(getFamilyBusinessCount);
  const { data } = useQuery({
    queryKey: ["family-business-count"],
    queryFn: () => countFn({ data: undefined }),
    staleTime: 0,
    refetchOnMount: "always",
  });
  return data ?? 0;
}
