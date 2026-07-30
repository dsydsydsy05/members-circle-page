import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { LanyardCard } from "@/components/LanyardCard";
import { MemberFlipCard } from "@/components/MemberFlipCard";
import { EventCover } from "@/components/EventCover";
import { useEvents, useGuests, useFactories } from "@/lib/use-site-content";
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
  const { data: events = [] } = useEvents();
  const { data: guests = [] } = useGuests();
  const { data: factories = [] } = useFactories();

  return (
    <div className="min-h-screen">
      <SiteNav />

      <HomeHero
        memberCount={memberCount}
        familyBusinessCount={familyBusinessCount}
        eventCount={events.length}
        factoryCount={factories.length}
      />




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
                image={e.cover_url ?? undefined}
                month={e.date_label.split(" ")[0].toUpperCase()}
                year="2026"
                caption="This Photo Contains Something You May Find Exciting"
                cta="Comment your guesses!"
              />
              <div className="p-4">
                <div className="text-xs text-muted-foreground">{e.date_label} · {e.city}</div>
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
                <div className="font-medium blur-sm select-none">{g.name}</div>
                <div className="text-sm text-muted-foreground blur-sm select-none">{g.title}</div>
              </div>
              <div className="text-sm text-muted-foreground">{g.event} · <span className="text-foreground">{g.date_label}</span></div>
            </li>
          ))}
        </ul>
      </Section>



      <SiteFooter />
    </div>
  );
}

function HomeHero({
  memberCount,
  familyBusinessCount,
  eventCount,
  factoryCount,
}: {
  eventCount: number;
  factoryCount: number;
  memberCount: number;
  familyBusinessCount: number;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const updateProgress = () => {
      frame = 0;
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const nextProgress = clamp(-rect.top / (viewportHeight * 0.68), 0, 1);

      setProgress((current) => (
        Math.abs(current - nextProgress) < 0.001 ? current : nextProgress
      ));
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  const cardFade = smoothStep(0.08, 0.5, progress);
  const contentReveal = smoothStep(0.4, 0.82, progress);
  const heroStyle = {
    "--hero-card-scale": (1 + progress * 0.24).toFixed(3),
    "--hero-card-opacity": (1 - cardFade).toFixed(3),
    "--hero-card-blur": `${(cardFade * 10).toFixed(1)}px`,
    "--hero-card-lift": `${(-progress * 10).toFixed(1)}px`,
    "--hero-content-opacity": contentReveal.toFixed(3),
    "--hero-content-y": `${((1 - contentReveal) * 42).toFixed(1)}px`,
  } as CSSProperties;


  return (
    <section ref={sectionRef} className="relative min-h-[122svh] overflow-visible" style={heroStyle}>
      <div className="sticky top-0 flex h-[68svh] min-h-[500px] flex-col items-center px-6 pt-20 sm:h-[70svh]">
        <div className="pointer-events-none absolute left-1/2 top-[43%] -translate-x-1/2 -translate-y-1/2 animate-glow-breathe">
          <div className="hero-glow-primary" />
        </div>
        <div className="pointer-events-none absolute left-1/2 top-[43%] -translate-x-1/2 -translate-y-1/2 animate-glow-breathe [animation-delay:1.2s]">
          <div className="hero-glow-secondary" />
        </div>

        <div className="hero-card-scroll relative z-10 flex items-center justify-center">
          <LanyardCard />
        </div>
      </div>

      <div
        className="hero-content-scroll absolute inset-x-0 bottom-8 z-20 text-white sm:bottom-12"
        style={{ pointerEvents: contentReveal > 0.05 ? "auto" : "none" }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
            <StatLight n={`${memberCount}`} label="Members" />
            <StatLight n={`${eventCount}`} label="Events" />
            <StatLight n="2" label="Cities" />
            <StatLight n={`${factoryCount}`} label="Vetted factories" />
            <StatLight n={`${familyBusinessCount}`} label="Family businesses" />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/members" className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90">
              Join The Room
            </Link>
            <Link to="/events" className="rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-secondary/60">
              Upcoming events
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function smoothStep(edge0: number, edge1: number, value: number) {
  const amount = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return amount * amount * (3 - 2 * amount);
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
}: { eyebrow: string; title: string; action?: ReactNode; children: ReactNode }) {
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
