import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { LanyardCard } from "@/components/LanyardCard";
import { MemberFlipCard } from "@/components/MemberFlipCard";
import { members, events, eventPhotos, guests } from "@/lib/community-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Room — a quieter community for builders" },
      { name: "description", content: "Members-only community for founders and makers. Flip cards, factory list, family businesses, and events." },
      { property: "og:title", content: "The Room — a quieter community" },
      { property: "og:description", content: "Founders, makers, buyers. Real conversations, real resources." },
    ],
  }),
  component: Home,
});

function Home() {
  const featured = members.slice(0, 3);
  return (
    <div className="min-h-screen">
      <SiteNav />

      {/* Hero — tag zooms in on scroll, intro content reveals below */}
      <section className="relative min-h-[150vh]">
        <div className="sticky top-0 flex h-[calc(100svh-65px)] flex-col items-center justify-center px-6 py-6">
          {/* Name tag zooms as you scroll */}
          <div className="animate-tag-zoom flex items-center justify-center">
            <LanyardCard />
          </div>

          {/* Intro content reveals during the zoom */}
          <div className="animate-content-reveal absolute inset-x-0 bottom-6 mx-auto w-full max-w-6xl px-6">

            <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              A members-only community
            </div>
            <h1 className="mt-3 text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl">
              A quieter place<br />to build a brand.
            </h1>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              The Room is a small, invite-friendly community of founders, designers and buyers.
              Trade factory contacts, share family businesses, and show up at intimate events.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/members" className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
                Meet the members
              </Link>
              <Link to="/events" className="rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-secondary">
                Upcoming events
              </Link>
            </div>
            <div className="mt-6 grid max-w-md grid-cols-3 gap-6 text-sm">
              <Stat n="120+" label="Members" />
              <Stat n="14" label="Cities" />
              <Stat n="30+" label="Vetted factories" />
            </div>
          </div>
        </div>
      </section>


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

      <Section
        eyebrow="What's next"
        title="Upcoming events"
        action={<Link to="/events" className="text-sm underline underline-offset-4">See all →</Link>}
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {events.map((e) => (
            <article key={e.id} className="group overflow-hidden rounded-xl bg-card ring-1 ring-border">
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img src={e.cover} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
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

      <Section eyebrow="Recap" title="Event photos">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {eventPhotos.map((p, i) => (
            <figure key={p.id} className={`overflow-hidden rounded-xl bg-muted ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}>
              <img src={p.src} alt={p.caption} loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </figure>
          ))}
        </div>
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
