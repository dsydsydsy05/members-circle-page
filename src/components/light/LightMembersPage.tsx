import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LightArchiveIndex } from "@/components/light/LightMemberArchive";
import { LightPage, LightPageHero } from "@/components/light/LightSite";
import { useCommunityMembers } from "@/lib/use-community-members";
import { supabase } from "@/integrations/supabase/client";

function matchesMember(
  member: ReturnType<typeof useCommunityMembers>["members"][number],
  query: string,
) {
  const haystack = [member.name, member.role, member.city, member.bio, ...member.tags]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export function LightMembersPage() {
  const { members, loading } = useCommunityMembers();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query.trim()), 280);
    return () => window.clearTimeout(timeout);
  }, [query]);

  const semantic = useQuery({
    queryKey: ["member-semantic-search", debouncedQuery],
    enabled: debouncedQuery.length >= 2,
    retry: false,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("search-members", {
        body: { query: debouncedQuery },
      });
      if (error) throw error;
      return data as { ids?: string[]; semantic?: boolean };
    },
  });

  const filteredMembers = useMemo(() => {
    if (!debouncedQuery) return members;
    const localMatches = members.filter((member) => matchesMember(member, debouncedQuery));
    const ids = semantic.data?.ids ?? [];
    if (!semantic.data?.semantic || ids.length === 0) return localMatches;
    const byId = new Map(members.map((member) => [member.id, member]));
    const ordered = ids.map((id) => byId.get(id)).filter(Boolean) as typeof members;
    const seen = new Set(ordered.map((member) => member.id));
    return [...ordered, ...localMatches.filter((member) => !seen.has(member.id))];
  }, [debouncedQuery, members, semantic.data]);

  const hasSemanticOrder = Boolean(
    debouncedQuery && semantic.data?.semantic && semantic.data.ids?.length,
  );

  return (
    <LightPage className="light-public-page light-members-page">
      <main>
        <LightPageHero
          index="01"
          eyebrow="Members / Directory"
          title="People in the room."
          copy="Members belong to The Room. Guests are invited for specific conversations; the two are intentionally not combined."
        />
        <section className="light-directory-section light-directory-section--archive">
          <div className="light-shell">
            <div className="light-directory-tools">
              <label htmlFor="member-search">
                Search the archive
                <input
                  id="member-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Name, school, project, or what you need…"
                />
              </label>
              <p>
                <strong>{String(filteredMembers.length).padStart(3, "0")}</strong>{" "}
                {semantic.isFetching ? "searching files" : "public files"}
              </p>
            </div>
            {loading ? (
              <p className="light-empty">Loading members…</p>
            ) : members.length === 0 ? (
              <p className="light-empty">No public member profiles are currently available.</p>
            ) : filteredMembers.length === 0 ? (
              <p className="light-empty">No files match “{debouncedQuery}”. Try another clue.</p>
            ) : (
              <LightArchiveIndex members={filteredMembers} preserveOrder={hasSemanticOrder} />
            )}
          </div>
        </section>
      </main>
    </LightPage>
  );
}
