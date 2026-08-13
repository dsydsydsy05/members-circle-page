import type { CSSProperties, MouseEvent } from "react";
import { Link } from "@tanstack/react-router";
import type { EventRow } from "@/lib/use-site-content";

const editorialCovers = [
  "/images/events/community-opening.jpg",
  "/images/events/funding-conversation.jpg",
  "/images/events/public-company.jpg",
];

const upcomingCoverByTitle: Record<string, string> = {
  "The Room Opening: Our First Guest": editorialCovers[0],
  "How to Raise Funding": editorialCovers[1],
  "How to Take a Company Public": editorialCovers[2],
};

/**
 * The canonical light-theme event presentation. The home and Events page use
 * this same component so event content has one public display format.
 */
export function LightEventStudies({
  events,
  overlayLabel = "Coming soon",
  onSelect,
}: {
  events: EventRow[];
  overlayLabel?: string;
  onSelect?: (event: EventRow, trigger: HTMLElement) => void;
}) {
  return (
    <div className="light-event-studies">
      {events.map((event, index) => {
        const isPast = event.status.toLowerCase() === "past";
        const coverSrc = isPast
          ? event.cover_url || editorialCovers[index % editorialCovers.length]
          : upcomingCoverByTitle[event.title] || editorialCovers[index % editorialCovers.length];
        const isPoster = coverSrc.includes("waic-founders-dinner");
        const content = (
          <>
            <span className="light-event-study__index">
              Event / {String(index + 1).padStart(2, "0")}
            </span>
            <span
              className={`light-event-study__visual ${
                isPoster ? "light-event-study__visual--poster" : ""
              }`}
            >
              <img
                className={`light-event-study__image ${
                  isPoster ? "light-event-study__image--poster" : ""
                }`}
                src={coverSrc}
                alt=""
              />
              {overlayLabel ? (
                <span className="light-event-study__coming">{overlayLabel}</span>
              ) : null}
            </span>
            <span className="light-event-study__copy">
              <time>{event.date_label}</time>
              <strong>{event.title}</strong>
              <span>
                {event.city || "Location TBA"}
                <b>View event ↗</b>
              </span>
            </span>
          </>
        );
        const style = { "--event-delay": `${index * 100}ms` } as CSSProperties;

        if (onSelect) {
          return (
            <button
              key={event.id}
              type="button"
              className="light-event-study"
              style={style}
              onClick={(mouseEvent: MouseEvent<HTMLButtonElement>) =>
                onSelect(event, mouseEvent.currentTarget)
              }
            >
              {content}
            </button>
          );
        }

        return (
          <Link key={event.id} to="/events" className="light-event-study" style={style}>
            {content}
          </Link>
        );
      })}
    </div>
  );
}
