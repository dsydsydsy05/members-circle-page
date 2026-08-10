import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/SiteNav";
import { useEvents, useGuests } from "@/lib/use-site-content";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events · The Room" },
      {
        name: "description",
        content: "Dinners, guest conversations and private gatherings announced by The Room.",
      },
      { property: "og:title", content: "What happens in The Room" },
      { property: "og:description", content: "Real conversations. No stages, no slides." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://theroomcommunity.org/events" }],
  }),
  component: EventsPage,
});

function EventsPage() {
  const { data: events = [], isLoading } = useEvents();
  const { data: guests = [] } = useGuests();
  const upcoming = events.filter((event) => event.status.toLowerCase() !== "past");
  const past = events.filter((event) => event.status.toLowerCase() === "past");
  const conversations = guests.filter(
    (guest) =>
      guest.name.toLowerCase() !== "coming soon" && !guest.title.toLowerCase().includes("tba"),
  );

  return (
    <div className="dark-page">
      <SiteNav />
      <main>
        <header className="depth-hero border-white/15">
          <div className="page-shell depth-hero__grid">
            <div className="eyebrow text-[var(--signal)]">Events / Culture</div>
            <div className="depth-hero__main">
              <h1 className="editorial-title">What happens in the room.</h1>
              <p className="!text-white/50">
                Small formats, clear reasons to gather, and enough time for a real conversation.
              </p>
            </div>
          </div>
        </header>
        <section className="page-section">
          <div className="page-shell">
            <div className="eyebrow">Upcoming / Announced</div>
            {isLoading ? (
              <p className="mt-10 text-white/50">Loading events…</p>
            ) : upcoming.length === 0 ? (
              <p className="mt-10 border-t border-white/15 py-8 text-white/45">
                No upcoming events are currently announced.
              </p>
            ) : (
              <div className="events-home__list mt-10">
                {upcoming.map((event) => (
                  <article key={event.id} className="event-row">
                    <div className="event-row__date">{event.date_label}</div>
                    <h2>{event.title}</h2>
                    <div className="event-row__meta">
                      {event.city}
                      <br />
                      By invitation
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
        {past.length > 0 && (
          <section className="page-section border-t border-white/15">
            <div className="page-shell">
              <div className="eyebrow">Past / Archive</div>
              <div className="events-home__list mt-10">
                {past.map((event) => (
                  <article key={event.id} className="event-row">
                    <div className="event-row__date">{event.date_label}</div>
                    <h2>{event.title}</h2>
                    <div className="event-row__meta">
                      {event.city}
                      <br />
                      Past
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
        <section className="page-section border-t border-white/15">
          <div className="page-shell grid gap-12 md:grid-cols-[1fr_2fr]">
            <div className="eyebrow">Conversations</div>
            <div>
              {conversations.length > 0 ? (
                conversations.map((guest) => (
                  <article key={guest.id} className="border-b border-white/15 py-8 first:pt-0">
                    <div className="text-xs uppercase tracking-[.14em] text-[var(--signal)]">
                      Guest / {guest.date_label}
                    </div>
                    <h2 className="mt-4 font-editorial text-5xl">{guest.name}</h2>
                    <p className="mt-3 text-white/50">
                      {guest.title} / {guest.event}
                    </p>
                  </article>
                ))
              ) : (
                <div>
                  <h2 className="font-editorial text-5xl sm:text-7xl">
                    Guests are invited.
                    <br />
                    Members belong.
                  </h2>
                  <p className="mt-6 max-w-xl text-white/45">
                    No verified guest conversation profiles have been published yet. Placeholder
                    speakers are intentionally not shown.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
