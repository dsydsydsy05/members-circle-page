import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Member } from "@/lib/community-data";

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

/** Real members from the database (people who completed onboarding). */
export function useCommunityMembers(): { members: Member[]; loading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: ["community-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, member_no, full_name, avatar_url, school, startup, position, website, tags, about")
        .eq("onboarded", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const members: Member[] = (data ?? [])
    .filter((p) => p.full_name)
    .map((p) => ({
      id: p.id,
      name: p.full_name!,
      handle: p.id.slice(0, 6),
      role: [p.position, p.startup].filter(Boolean).join(" · ") || "Member",
      city: p.school ?? "",
      bio: p.about ?? "",
      tags: p.tags ?? [],
      website: p.website ?? "",
      initials: initialsOf(p.full_name!),
      avatarUrl: p.avatar_url,
      memberNo: p.member_no,
    }));

  return { members, loading: isLoading };
}
