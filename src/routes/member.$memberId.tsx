import { createFileRoute, Link } from "@tanstack/react-router";
import { MemberContactLinks } from "@/components/light/MemberContactLinks";
import { LightPage } from "@/components/light/LightSite";
import { useCommunityMembers } from "@/lib/use-community-members";

export const Route = createFileRoute("/member/$memberId")({
  head: () => ({
    meta: [
      { title: "Member profile · The Room" },
      {
        name: "description",
        content: "A Member Pass profile inside The Room public archive.",
      },
    ],
  }),
  component: MemberProfilePage,
});

function MemberProfilePage() {
  const { memberId } = Route.useParams();
  const { members, loading } = useCommunityMembers();
  const member = members.find((item) => item.id === memberId || String(item.memberNo) === memberId);

  return (
    <LightPage className="light-public-page">
      <main className="min-h-[72svh] bg-[#f7f6f1] px-5 pb-24 pt-36 text-[#111311] sm:px-8">
        <div className="mx-auto max-w-6xl">
          {loading ? (
            <p className="font-mono text-xs uppercase tracking-[.16em] text-black/50">
              Loading member profile…
            </p>
          ) : !member ? (
            <div className="border-t border-black/20 py-16">
              <h1 className="font-display text-5xl font-medium tracking-[-.04em]">
                Member not found.
              </h1>
              <Link
                to="/light/members"
                className="mt-8 inline-block border-b border-current pb-1 font-mono text-xs uppercase tracking-[.12em]"
              >
                Back to public archive ↗
              </Link>
            </div>
          ) : (
            <article>
              <div className="flex items-center justify-between border-b border-black/20 pb-4 font-mono text-[10px] uppercase tracking-[.16em] text-black/50">
                <span>The Room / Member File</span>
                <span>No. {member.memberNo ? String(member.memberNo).padStart(3, "0") : "—"}</span>
              </div>
              <div className="grid gap-10 py-12 md:grid-cols-[280px_1fr] md:items-center lg:gap-20">
                <div className="aspect-square overflow-hidden rounded-full border border-black/15 bg-[#e7e7e1]">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center font-display text-8xl text-black/25">
                      {member.initials}
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[.16em] text-[#779b43]">
                    Member identity
                  </div>
                  <h1 className="mt-5 font-display text-[clamp(4rem,10vw,8rem)] font-medium leading-[.88] tracking-[-.05em]">
                    {member.name}
                  </h1>
                  <p className="mt-6 font-mono text-xs uppercase tracking-[.1em] text-black/50">
                    {member.role}
                    {member.city ? ` / ${member.city}` : ""}
                  </p>
                  <div className="mt-10 max-w-2xl border-t border-black/20 pt-6">
                    <div className="font-mono text-[10px] uppercase tracking-[.16em] text-black/45">
                      What they’re building
                    </div>
                    <p className="mt-4 text-xl leading-relaxed sm:text-2xl">
                      {member.bio || "Profile statement not yet added."}
                    </p>
                    {member.website ? (
                      <a
                        href={
                          /^https?:\/\//i.test(member.website)
                            ? member.website
                            : `https://${member.website}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="mt-7 inline-block border-b border-current pb-1 font-mono text-xs uppercase tracking-[.12em]"
                      >
                        Website ↗
                      </a>
                    ) : null}
                    <MemberContactLinks
                      memberId={member.id}
                      linkedinUrl={member.linkedinUrl}
                      emailMask={member.contactEmailMask}
                    />
                  </div>
                </div>
              </div>
            </article>
          )}
        </div>
      </main>
    </LightPage>
  );
}
