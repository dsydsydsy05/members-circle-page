import { createFileRoute } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { MemberGate } from "@/components/MemberGate";
import { familyBusinesses } from "@/lib/community-data";

export const Route = createFileRoute("/businesses")({
  head: () => ({
    meta: [
      { title: "Family Business · The Room" },
      { name: "description", content: "Businesses run by The Room members. Tap a card to visit their site." },
      { property: "og:title", content: "Family Business · The Room" },
      { property: "og:description", content: "Businesses run by members of the The Room community." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BusinessesPage,
});

function BusinessesPage() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Members only</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Family Business</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Businesses built by our members. Tap a badge to open the site.
        </p>

        <div className="mt-10">
          <MemberGate title="Members only">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {familyBusinesses.map((b) => (
                <a
                  key={b.id}
                  href={b.website}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-col justify-between rounded-xl bg-card p-5 ring-1 ring-border transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>THE ROOM · {b.category.toUpperCase()}</span>
                    <span className="opacity-0 transition-opacity group-hover:opacity-100">→</span>
                  </div>
                  <div className="mt-6">
                    <div className="text-xl font-semibold tracking-tight">{b.name}</div>
                    <div className="text-sm text-muted-foreground">by {b.owner}</div>
                  </div>
                  <div className="mt-6 text-xs text-muted-foreground">
                    {new URL(b.website).hostname.replace("www.", "")}
                  </div>
                </a>
              ))}
            </div>
          </MemberGate>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
