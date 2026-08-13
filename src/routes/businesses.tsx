import { createFileRoute } from "@tanstack/react-router";
import { MemberPortalShell } from "@/components/light/LightMemberPortal";
import { useFamilyBusinesses, normalizeUrl, hostOf } from "@/lib/use-family-businesses";

export const Route = createFileRoute("/businesses")({
  head: () => ({
    meta: [
      { title: "Family Business · The Room" },
      {
        name: "description",
        content: "Businesses run by The Room members. Tap a card to visit their site.",
      },
      { property: "og:title", content: "Family Business · The Room" },
      {
        property: "og:description",
        content: "Businesses run by members of the The Room community.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BusinessesPage,
});

function BusinessesPage() {
  return (
    <MemberPortalShell className="portal-page">
      <main className="light-member-main mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
        <div className="text-xs uppercase tracking-[0.22em] text-[#718f3e]">Members only</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Family Business</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Businesses built by our members. Tap a badge to open the site.
        </p>

        <div className="mt-10">
          <BusinessGrid />
        </div>
      </main>
    </MemberPortalShell>
  );
}

function BusinessGrid() {
  const { items, loading } = useFamilyBusinesses("all");

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        No family businesses listed yet. Add yours from your member card setup.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((b) => {
        const href = normalizeUrl(b.website);
        const host = hostOf(b.website);
        const Card = (
          <>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="text-[#718f3e]">THE ROOM · {b.category.toUpperCase()}</span>
              {href && (
                <span className="text-[#718f3e] opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100">
                  →
                </span>
              )}
            </div>
            <div className="mt-6">
              <div className="text-xl font-semibold tracking-tight">{b.name}</div>
              {b.owner_name && (
                <div className="text-sm text-muted-foreground">by {b.owner_name}</div>
              )}
              {b.description && (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {b.description}
                </p>
              )}
            </div>
            <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
              <span>{b.location ?? ""}</span>
              <span>{host ?? ""}</span>
            </div>
          </>
        );

        const cls =
          "group flex flex-col justify-between rounded-xl bg-card p-5 ring-1 ring-border transition-all hover:-translate-y-0.5 hover:ring-[#718f3e]/45 hover:shadow-md focus-visible:outline-none focus-visible:ring-[#718f3e]/65";

        return href ? (
          <a key={b.id} href={href} target="_blank" rel="noreferrer" className={cls}>
            {Card}
          </a>
        ) : (
          <div key={b.id} className={cls}>
            {Card}
          </div>
        );
      })}
    </div>
  );
}
