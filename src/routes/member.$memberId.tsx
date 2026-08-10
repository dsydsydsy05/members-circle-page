import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/SiteNav";
import { useCommunityMembers } from "@/lib/use-community-members";

export const Route = createFileRoute("/member/$memberId")({
  head: () => ({
    meta: [
      { title: "Member profile · The Room" },
      {
        name: "description",
        content: "A permanent Member Pass profile inside The Room public directory.",
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
    <div className="depth-page">
      <SiteNav tone="light" />
      <main className="page-shell pb-24 pt-36">
        {loading ? (
          <p className="empty-truth">Loading member profile…</p>
        ) : !member ? (
          <div className="empty-truth">
            <h1 className="section-title">Member not found.</h1>
            <Link to="/members" className="text-link mt-8">
              Back to directory ↗
            </Link>
          </div>
        ) : (
          <article>
            <div className="flex items-center justify-between border-b border-black/20 pb-4 text-[10px] font-semibold uppercase tracking-[.18em] text-black/45">
              <span>The Room / Member Pass</span>
              <span>No. {member.memberNo ? String(member.memberNo).padStart(3, "0") : "—"}</span>
            </div>
            <div className="grid gap-12 py-12 md:grid-cols-[minmax(260px,430px)_1fr]">
              <div className="aspect-[.82] overflow-hidden bg-black/5">
                {member.avatarUrl ? (
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    className="h-full w-full object-cover grayscale"
                  />
                ) : (
                  <div className="grid h-full place-items-center font-editorial text-[9rem] text-black/25">
                    {member.initials}
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-between">
                <div>
                  <div className="eyebrow text-[var(--signal)]">Member identity</div>
                  <h1 className="mt-8 text-[clamp(4rem,10vw,10rem)] font-medium uppercase leading-[.78] tracking-[-.075em]">
                    {member.name}
                  </h1>
                  <p className="mt-8 text-sm uppercase tracking-[.12em] text-black/50">
                    {member.role}
                    {member.city ? ` / ${member.city}` : ""}
                  </p>
                </div>
                <div className="mt-16 border-t border-black/20 pt-6">
                  <div className="text-[10px] font-semibold uppercase tracking-[.18em] text-black/40">
                    What they’re building
                  </div>
                  {member.bio ? (
                    <p className="mt-5 max-w-xl font-editorial text-3xl leading-snug">
                      {member.bio}
                    </p>
                  ) : (
                    <p className="mt-5 text-black/45">Profile statement not yet added.</p>
                  )}
                  {member.website && (
                    <a
                      href={
                        /^https?:\/\//i.test(member.website)
                          ? member.website
                          : `https://${member.website}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="text-link mt-8"
                    >
                      Website ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          </article>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
