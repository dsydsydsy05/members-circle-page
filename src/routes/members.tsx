import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LightArchiveIndex } from "@/components/light/LightMemberArchive";
import { MemberPortalShell } from "@/components/light/LightMemberPortal";
import { useCommunityMembers } from "@/lib/use-community-members";
import { useAuth } from "@/lib/use-auth";
import type { Member } from "@/lib/community-data";

export const Route = createFileRoute("/members")({
  head: () => ({
    meta: [
      { title: "Members · The Room" },
      {
        name: "description",
        content: "The public member directory of The Room — founders, builders and operators.",
      },
      { property: "og:title", content: "People in The Room" },
      {
        property: "og:description",
        content: "An editorial directory built around the Member Pass system.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://theroomcommunity.org/members" }],
  }),
  component: MembersPage,
});

function matchesQuery(member: Member, query: string) {
  const haystack = [member.name, member.role, member.city, member.bio, ...member.tags]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function MembersPage() {
  const { members, loading } = useCommunityMembers();
  const { profile } = useAuth();
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? members.filter((member) => matchesQuery(member, q)) : members;

    // Match against your own profile: same school first, then shared project types.
    // School names are fuzzy-matched both ways ("NYU" hits "NYU Stern").
    const school = profile?.school?.trim().toLowerCase();
    const myTags = new Set((profile?.tags ?? []).map((tag) => tag.trim().toLowerCase()));
    if (!school && myTags.size === 0) return filtered;

    const sameSchool = (other: string) => {
      const theirs = other.trim().toLowerCase();
      if (!school || !theirs) return false;
      return theirs === school || theirs.includes(school) || school.includes(theirs);
    };
    const score = (member: Member) => {
      let value = 0;
      if (sameSchool(member.city)) value += 2;
      value += member.tags.filter((tag) => myTags.has(tag.trim().toLowerCase())).length;
      return value;
    };
    return [...filtered].sort((a, b) => score(b) - score(a));
  }, [members, query, profile]);

  return (
    <MemberPortalShell className="depth-page">
      <main>
        <header className="members-directory-hero">
          <div className="page-shell members-directory-hero__grid">
            <div className="eyebrow members-directory-hero__eyebrow">
              Member Space / Private Directory
            </div>
            <h1 className="members-directory-hero__title">Inside the room.</h1>
            <div className="members-directory-hero__side">
              <label className="directory-search">
                <span>Search</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Name, school, or project type"
                />
              </label>
              <p className="members-directory-hero__intro">
                This is the internal member directory. It is separate from the public Members
                archive and never includes invited guests.
              </p>
            </div>
          </div>
        </header>
        <section className="members-directory-list">
          <div className="page-shell">
            {loading ? (
              <p className="empty-truth">Loading members…</p>
            ) : members.length === 0 ? (
              <p className="empty-truth">No internal member profiles are currently available.</p>
            ) : visible.length === 0 ? (
              <p className="empty-truth">No members match your search.</p>
            ) : (
              <LightArchiveIndex members={visible} variant="directory" />
            )}
          </div>
        </section>
      </main>
    </MemberPortalShell>
  );
}
