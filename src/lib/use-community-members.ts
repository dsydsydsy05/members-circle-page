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
      const contactFields =
        "id, member_no, full_name, avatar_url, school, startup, position, website, linkedin_url, contact_email_mask, tags, about, home_featured, home_featured_order, created_at";
      const fields =
        "id, member_no, full_name, avatar_url, school, startup, position, website, tags, about, home_featured, home_featured_order, created_at";
      const legacyFields =
        "id, member_no, full_name, avatar_url, school, startup, position, website, tags, about, created_at";
      let { data, error } = await supabase
        .from("profiles")
        .select(contactFields)
        .eq("onboarded", true)
        .order("created_at", { ascending: false });
      if (
        error?.code === "42703" &&
        (error.message.includes("linkedin_url") || error.message.includes("contact_email_mask"))
      ) {
        const fallback = await supabase
          .from("profiles")
          .select(fields)
          .eq("onboarded", true)
          .order("created_at", { ascending: false });
        data = fallback.data as typeof data;
        error = fallback.error;
      }
      if (error?.code === "42703" || error?.message?.includes("home_featured")) {
        const fallback = await supabase
          .from("profiles")
          .select(legacyFields)
          .eq("onboarded", true)
          .order("created_at", { ascending: false });
        data = fallback.data as typeof data;
        error = fallback.error;
      }
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
      linkedinUrl: "linkedin_url" in p ? (p.linkedin_url ?? "") : "",
      contactEmailMask: "contact_email_mask" in p ? (p.contact_email_mask ?? "") : "",
      initials: initialsOf(p.full_name!),
      avatarUrl: p.avatar_url,
      memberNo: p.member_no,
      featuredOnHome: "home_featured" in p ? Boolean(p.home_featured) : false,
      featuredOrder:
        "home_featured_order" in p && typeof p.home_featured_order === "number"
          ? p.home_featured_order
          : 999,
    }));

  return { members, loading: isLoading };
}
