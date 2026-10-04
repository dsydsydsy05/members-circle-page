import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMemberCount } from "./site.functions";

export function useMemberCount() {
  const countFn = useServerFn(getMemberCount);
  const query = useQuery({ queryKey: ["public-member-count"], queryFn: () => countFn(), staleTime: 30_000 });
  return query.data;
}
