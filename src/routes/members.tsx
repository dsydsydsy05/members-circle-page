import { createFileRoute } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { MemberFlipCard } from "@/components/MemberFlipCard";
import { members } from "@/lib/community-data";

export const Route = createFileRoute("/members")({
  head: () => ({
    meta: [
      { title: "Members · The Room" },
      { name: "description", content: "Meet the founders, designers and buyers inside the The Room community. Flip a card to see details." },
      { property: "og:title", content: "Members · The Room" },
      { property: "og:description", content: "Flip through the The Room member cards." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MembersPage,
});

function MembersPage() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Community</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Members</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          A small, curated group. Every member has a card — tap to flip and see what they do, then visit their site.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => <MemberFlipCard key={m.id} member={m} />)}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
