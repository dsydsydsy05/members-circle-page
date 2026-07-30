import { createFileRoute } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { useEvents } from "@/lib/use-site-content";
import { EventCover } from "@/components/EventCover";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events · The Room" },
      { name: "description", content: "Upcoming The Room events and past recaps — dinners, factory tours, workshops." },
      { property: "og:title", content: "Events · The Room" },
      { property: "og:description", content: "Dinners, factory tours, and workshops with the The Room community." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const { data: events = [] } = useEvents();
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Calendar</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Events</h1>

        <h2 className="mt-12 text-xl font-semibold tracking-tight">Upcoming</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-3">
          {events.map((e) => (
            <article key={e.id} className="group overflow-hidden rounded-xl bg-card ring-1 ring-border">
              <EventCover
                image={e.cover_url ?? ""}
                month={e.date_label.split(" ")[0].toUpperCase()}
                year="2026"
                caption="This Photo Contains Something You May Find Exciting"
                cta="Comment your guesses!"
              />
              <div className="p-4">
                <div className="text-xs text-muted-foreground">{e.date_label} · {e.city}</div>
                <div className="mt-1 text-lg font-semibold tracking-tight">{e.title}</div>
                <button className="mt-3 rounded-full border border-border px-3 py-1 text-xs hover:bg-secondary">RSVP</button>
              </div>
            </article>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
