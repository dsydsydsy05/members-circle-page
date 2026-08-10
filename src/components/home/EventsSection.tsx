import { Link } from "@tanstack/react-router";
import type { EventRow } from "@/lib/use-site-content";

export function EventsSection({ events }: { events: EventRow[] }) {
  if (!events.length) return null;
  return (
    <section className="events-home page-section" aria-labelledby="events-title">
      <div className="page-shell">
        <div className="events-home__head">
          <div className="eyebrow">04 / Events</div>
          <h2 id="events-title" className="section-title">
            What happens in the room.
          </h2>
        </div>
        <div className="events-home__list">
          {events.slice(0, 4).map((event) => (
            <Link key={event.id} to="/events" className="event-row">
              <div className="event-row__date">{event.date_label}</div>
              <h3>{event.title}</h3>
              <div className="event-row__meta">
                {event.city}
                <br />
                {event.status}
              </div>
            </Link>
          ))}
        </div>
        <Link to="/events" className="text-link mt-10">
          See all events ↗
        </Link>
      </div>
    </section>
  );
}
