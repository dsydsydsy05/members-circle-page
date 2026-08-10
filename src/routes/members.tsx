import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/SiteNav";
import { MemberFlipCard } from "@/components/MemberFlipCard";
import { useCommunityMembers } from "@/lib/use-community-members";

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

function MembersPage() {
  const { members, loading } = useCommunityMembers();
  return (
    <div className="depth-page">
      <SiteNav tone="light" />
      <main>
        <header className="depth-hero">
          <div className="page-shell depth-hero__grid">
            <div className="eyebrow">Members / Directory</div>
            <div className="depth-hero__main">
              <h1 className="section-title">People in the room.</h1>
              <p>
                Members belong to The Room. Guests are invited for specific conversations; the two
                are intentionally not combined.
              </p>
            </div>
          </div>
        </header>
        <section className="page-section">
          <div className="page-shell">
            {loading ? (
              <p className="empty-truth">Loading members…</p>
            ) : members.length === 0 ? (
              <p className="empty-truth">No public member profiles are currently available.</p>
            ) : (
              <div className="member-grid mt-0">
                {members.map((member) => (
                  <MemberFlipCard key={member.id} member={member} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
