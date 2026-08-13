export type EventCoverVariant = "warm" | "cool" | "signal";

export function EventCover({
  image,
  month,
  status,
  variant,
}: {
  image?: string | null;
  month: string;
  status: string;
  variant: EventCoverVariant;
}) {
  return (
    <div className={`event-cover event-cover--${variant}`}>
      <div className="event-cover__fallback" aria-hidden="true" />
      {image ? (
        <img src={image} alt="" loading="lazy" decoding="async" className="event-cover__image" />
      ) : null}
      <div className="event-cover__veil" aria-hidden="true" />

      <div className="event-cover__content">
        <div className="event-cover__top">
          <span>{month}</span>
          <svg
            viewBox="0 0 24 24"
            className="event-cover__blind-mark"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12z" />
            <circle cx="12" cy="12" r="3.2" />
            <path d="M3 3l18 18" />
          </svg>
          <span>{status}</span>
        </div>

        <div className="event-cover__lockup">
          <span>Coming</span>
          <strong>Soon</strong>
          <p>Details stay inside the room.</p>
        </div>
      </div>
    </div>
  );
}
