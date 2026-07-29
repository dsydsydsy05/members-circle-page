import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { LanyardCard } from "@/components/LanyardCard";
import { MemberFlipCard } from "@/components/MemberFlipCard";
import { EventCover } from "@/components/EventCover";
import { events, guests, factories } from "@/lib/community-data";
import { useMemberCount } from "@/lib/use-member-count";
import { useCommunityMembers } from "@/lib/use-community-members";
import { useFamilyBusinessCount } from "@/lib/use-family-business-count";



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
  const familyBusinessCount = useFamilyBusinessCount();


  return (
    <div className="min-h-screen">
      <SiteNav />

      {/* Hero — badge floats, grows slightly and fades on scroll */}
      <section className="relative min-h-[80vh] overflow-hidden">
        <div className="sticky top-0 flex h-[calc(62svh-65px)] min-h-[380px] flex-col items-center justify-center px-6 py-4">
          {/* Soft copper glow behind the badge */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-glow-breathe">
            <div
              className="pointer-events-none"
              style={{
                width: "32rem",
                height: "32rem",
                background:
                  "radial-gradient(circle, rgba(190,120,80,0.28) 0%, rgba(160,100,70,0.11) 40%, rgba(120,80,60,0.03) 65%, transparent 80%)",
                filter: "blur(70px)",
              }}
            />
          </div>
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-glow-breathe" style={{ animationDelay: "1.2s" }}>
            <div
              className="pointer-events-none"
              style={{
                width: "14rem",
                height: "18rem",
                background:
                  "radial-gradient(ellipse at center, rgba(210,140,100,0.30) 0%, rgba(180,115,85,0.12) 50%, transparent 76%)",
                filter: "blur(45px)",
              }}
            />
          </div>

          <div className="animate-tag-zoom relative z-10 flex items-center justify-center">
            <LanyardCard />
          </div>
        </div>
      </section>

      {/* Intro — sits on the same continuous background */}
      <section className="relative text-white animate-zoom-in-view">
        <div className="mx-auto max-w-6xl px-6 pb-8 pt-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
            <StatLight n={`${memberCount}`} label="Members" />
            <StatLight n="1" label="Events" />
            <StatLight n="2" label="Cities" />
            <StatLight n={`${factories.length}`} label="Vetted factories" />
            <StatLight n={`${familyBusinessCount}`} label="Family businesses" />
          </div>

          <div className="mt-16 flex flex-wrap gap-3">
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
            <article key={e.id} className="group glass-panel overflow-hidden rounded-2xl">
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
        <ul className="glass-panel divide-y divide-white/10 rounded-2xl">
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
      <div className="text-5xl font-semibold leading-none tracking-tight text-white sm:text-6xl">{n}</div>
      <div className="mt-3 text-xs uppercase tracking-[0.18em] text-white/60">{label}</div>
    </div>
  );
}

function Section({
  eyebrow, title, action, children,
}: { eyebrow: string; title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12 animate-zoom-in-view">
      <div className="mb-6 flex items-end justify-between gap-4">
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
