import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { LanyardCard } from "@/components/LanyardCard";
import { MemberFlipCard } from "@/components/MemberFlipCard";
import { EventCover } from "@/components/EventCover";
import { events, guests, factories } from "@/lib/community-data";
import { useMemberCount } from "@/lib/use-member-count";
import { useCommunityMembers } from "@/lib/use-community-members";



export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Room — a quieter community for builders" },
      { name: "description", content: "Members-only community for founders and makers. Flip cards, factory list, family businesses, and events." },
      { property: "og:title", content: "The Room — a quieter community for builders" },
      { property: "og:description", content: "Members-only community for founders and makers. Flip cards, factory list, family businesses, and events." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const memberCount = useMemberCount();
  const featured = useCommunityMembers().members.slice(0, 3);


  return (
    <div className="min-h-screen">
      <SiteNav />

      {/* Hero — only the badge. Scroll down to reveal the story. */}
      <section className="relative min-h-[170vh] bg-black">
        <div className="sticky top-0 flex h-[calc(100svh-65px)] flex-col items-center justify-center px-6 py-6">
          {/* Ambient glow behind the card */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: "26rem",
              height: "36rem",
              background: "radial-gradient(circle, oklch(0.88 0.29 136 / 0.22) 0%, oklch(0.88 0.29 136 / 0.05) 45%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
          <div className="animate-tag-zoom relative z-10 flex items-center justify-center">
            <LanyardCard />
          </div>
          <div className="absolute inset-x-0 bottom-6 z-10 text-center text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Scroll
          </div>
        </div>
      </section>

      {/* Intro — appears after the badge */}
      <section className="bg-black text-white animate-zoom-in-view">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="text-xs uppercase tracking-[0.24em] text-white/50">
            A members-only community
          </div>
          <h1 className="mt-3 text-4xl font-semibold leading-[1.02] tracking-tight sm:text-6xl">
            A quieter place<br />to build a brand.
          </h1>
          <p className="mt-5 max-w-xl text-white/60">
            The Room is a small, invite-friendly community of founders, designers and buyers.
            Trade factory contacts, share family businesses, and show up at intimate events.
          </p>
          <div className="mt-8 grid max-w-3xl grid-cols-2 gap-8 sm:grid-cols-5">
            <StatLight n={`${memberCount}`} label="Members" />
            <StatLight n="1" label="Events" />
            <StatLight n="2" label="Cities" />
            <StatLight n={`${factories.length}`} label="Vetted factories" />
            <StatLight n="0" label="Family businesses" />
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/members" className="rounded-full bg-[color:var(--neon)] px-6 py-3 text-sm font-medium text-black hover:opacity-90">
              Join The Room
            </Link>
            <Link to="/events" className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white hover:bg-white/5">
              Upcoming events
            </Link>
          </div>
        </div>
      </section>



      {featured.length > 0 && (
        <Section
          eyebrow="Community"
          title="Meet a few members"
          action={<Link to="/members" className="text-sm underline underline-offset-4">All members →</Link>}
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((m) => <MemberFlipCard key={m.id} member={m} />)}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Tap any card to flip and see details.</p>
        </Section>
      )}


      <Section
        eyebrow="What's next"
        title="Upcoming events"
        action={<Link to="/events" className="text-sm underline underline-offset-4">See all →</Link>}
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {events.map((e) => (
            <article key={e.id} className="group overflow-hidden rounded-xl bg-card ring-1 ring-border">
              <EventCover
                image={e.cover}
                month={e.date.split(" ")[0].toUpperCase()}
                year="2026"
                caption="This Photo Contains Something You May Find Exciting"
                cta="Comment your guesses!"
              />
              <div className="p-4">
                <div className="text-xs text-muted-foreground">{e.date} · {e.city}</div>
                <div className="mt-1 text-lg font-semibold tracking-tight">{e.title}</div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="Guests" title="People we've hosted (and will)"
        action={<Link to="/guests" className="text-sm underline underline-offset-4">Full list →</Link>}
      >
        <ul className="divide-y divide-border rounded-xl bg-card ring-1 ring-border">
          {guests.map((g) => (
            <li key={g.id} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-medium">{g.name}</div>
                <div className="text-sm text-muted-foreground">{g.title}</div>
              </div>
              <div className="text-sm text-muted-foreground">{g.event} · <span className="text-foreground">{g.date}</span></div>
            </li>
          ))}
        </ul>
      </Section>



      <SiteFooter />
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-semibold tracking-tight">{n}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function StatLight({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-semibold tracking-tight text-white">{n}</div>
      <div className="text-xs text-white/50">{label}</div>
    </div>
  );
}

function Section({
  eyebrow, title, action, children,
}: { eyebrow: string; title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 animate-zoom-in-view">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{eyebrow}</div>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
