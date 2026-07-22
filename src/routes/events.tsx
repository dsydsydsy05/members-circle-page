import { createFileRoute } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { events, eventPhotos } from "@/lib/community-data";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events · Insider" },
      { name: "description", content: "Upcoming Insider events and past recaps — dinners, factory tours, workshops." },
      { property: "og:title", content: "Events · Insider" },
      { property: "og:description", content: "Dinners, factory tours, and workshops with the Insider community." },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
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
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img src={e.cover} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-4">
                <div className="text-xs text-muted-foreground">{e.date} · {e.city}</div>
                <div className="mt-1 text-lg font-semibold tracking-tight">{e.title}</div>
                <button className="mt-3 rounded-full border border-border px-3 py-1 text-xs hover:bg-secondary">RSVP</button>
              </div>
            </article>
          ))}
        </div>

        <h2 className="mt-16 text-xl font-semibold tracking-tight">Recap · Photos</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
          {eventPhotos.map((p, i) => (
            <figure key={p.id} className={`overflow-hidden rounded-xl bg-muted ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}>
              <img src={p.src} alt={p.caption} className="h-full w-full object-cover" />
              <figcaption className="p-2 text-xs text-muted-foreground">{p.caption}</figcaption>
            </figure>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
