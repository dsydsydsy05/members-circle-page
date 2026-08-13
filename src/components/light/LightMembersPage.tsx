import { LightArchiveIndex } from "@/components/light/LightMemberArchive";
import { LightPage, LightPageHero } from "@/components/light/LightSite";
import { useCommunityMembers } from "@/lib/use-community-members";

export function LightMembersPage() {
  const { members, loading } = useCommunityMembers();

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
            <div className="light-directory-tools light-directory-tools--count-only">
              <p>
                <strong>{String(members.length).padStart(3, "0")}</strong> public files
              </p>
            </div>
            {loading ? (
              <p className="light-empty">Loading members…</p>
            ) : members.length === 0 ? (
              <p className="light-empty">No public member profiles are currently available.</p>
            ) : (
              <LightArchiveIndex members={members} />
            )}
          </div>
        </section>
      </main>
    </LightPage>
  );
}
