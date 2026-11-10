import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { DoorSignal } from "@/components/BrandMark";
import { LightEventStudies } from "@/components/light/LightEventStudies";
import { LightPastEventStory } from "@/components/light/LightPastEventStory";
import { LightSponsorCountdown } from "@/components/light/LightSponsorCountdown";
import { LightButton, LightPage, LightPageHero } from "@/components/light/LightSite";
import { PrintFrame } from "@/components/print/PrintFrame";
import { RoomStory } from "@/components/print/RoomStory";
import { useEvents, useGuests, type EventRow } from "@/lib/use-site-content";
import { SPONSOR_GMAIL_URL } from "@/lib/contact";

export function LightAboutPage() {
  return (
    <LightPage className="light-public-page light-about-page print-page">
      <main>
        <PrintFrame
          photo="/images/rooms/empty-conference-room.jpg"
          alt="An empty meeting room with chairs around a wooden table, a larger hall visible through the glass behind it"
          plate="Plate 01"
          caption={["An empty room", "Before anyone walks in"]}
          hud={["TR—001 / An empty room", "Michael Dell / UT Austin, 2003"]}
          line={
            <>
              <h1 className="print-frame__quote">
                Try never to be the <em>smartest</em> person in the room.
              </h1>
              <p>
                And if you are, I suggest you invite smarter people… or find a different room.
                <span>— Michael Dell, 2003</span>
              </p>
            </>
          }
        />
        <RoomStory />
      </main>
    </LightPage>
  );
}

export function LightEventsPage() {
  const { data: events = [], isLoading } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<EventRow | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const publishedEvents = events;
  const upcoming = publishedEvents.filter((event) => event.status.toLowerCase() !== "past");
  const past = publishedEvents.filter((event) => event.status.toLowerCase() === "past");
  return (
    <LightPage className="light-public-page light-events-page">
      <main>
        <LightPageHero
          index="01"
          eyebrow="Events / Culture"
          title={<>What happens in the room.</>}
          copy="Small formats, clear reasons to gather, and enough time for a real conversation."
        />
        <section className="light-archive-section">
          <div className="light-shell">
            <div className="light-archive-label">
              <span>Upcoming / Announced</span>
              <b>{String(upcoming.length).padStart(2, "0")}</b>
            </div>
            {isLoading ? (
              <p className="light-empty">Loading the agenda…</p>
            ) : upcoming.length ? (
              <LightEventStudies events={upcoming} />
            ) : (
              <p className="light-empty">No upcoming events are currently announced.</p>
            )}
          </div>
        </section>
        <section className="light-archive-section light-archive-section--muted">
          <div className="light-shell">
            <div className="light-archive-label">
              <span>Past / Archive</span>
              <b>{String(past.length).padStart(2, "0")}</b>
            </div>
            {past.length ? (
              <LightEventStudies
                events={past}
                overlayLabel=""
                onSelect={(event, trigger) => {
                  returnFocus.current = trigger;
                  setSelectedEvent(event);
                }}
              />
            ) : (
              <p className="light-empty">The event archive is still being filed.</p>
            )}
          </div>
        </section>
      </main>
      <LightPastEventStory
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        returnFocus={returnFocus.current}
      />
    </LightPage>
  );
}

export function LightGuestsPage() {
  const { data: guests = [], isLoading } = useGuests();
  const verified = guests.filter(
    (guest) =>
      guest.name.toLowerCase() !== "coming soon" && !guest.title.toLowerCase().includes("tba"),
  );
  return (
    <LightPage className="light-guests-page">
      <main>
        <LightPageHero
          index="01"
          eyebrow="Guests / Conversations"
          title={
            <>
              People who walked
              <br />
              through the door.
            </>
          }
          copy="A guest was invited into The Room. A member belongs to it. This archive records the conversations, not a network of names."
        />
        <section className="light-guest-archive">
          <div className="light-shell">
            {isLoading ? (
              <p className="light-empty">Loading conversation files…</p>
            ) : verified.length ? (
              verified.map((guest, index) => (
                <article key={guest.id} className="light-guest-file">
                  <span>Conversation / {String(index + 1).padStart(2, "0")}</span>
                  <div className="light-guest-file__portrait" aria-hidden="true">
                    {guest.avatar_url ? (
                      <img src={guest.avatar_url} alt="" />
                    ) : (
                      guest.name.slice(0, 1)
                    )}
                  </div>
                  <div>
                    <h2>
                      <Link to="/guest/$guestId" params={{ guestId: guest.id }}>
                        {guest.name} ↗
                      </Link>
                    </h2>
                    <p>{guest.title}</p>
                  </div>
                  <footer>
                    {guest.event || "The Room"}
                    <b>{guest.date_label || "Date TBA"}</b>
                  </footer>
                </article>
              ))
            ) : (
              <div className="light-empty light-empty--large">
                <p>No verified guest conversations have been published yet.</p>
                <Link to="/events">See announced events ↗</Link>
              </div>
            )}
          </div>
        </section>
      </main>
    </LightPage>
  );
}

export function LightProjectsPage() {
  return (
    <LightPage className="light-projects-page">
      <main>
        <LightPageHero
          index="01"
          eyebrow="Projects / Public"
          title={
            <>
              Built in
              <br />
              the room.
            </>
          }
          copy="Real work by members will be documented here as it ships. Family Business remains available inside Member Space."
        />
        <section className="light-project-empty">
          <div className="light-shell light-project-empty__panel">
            <div className="light-project-empty__index">Project / 001</div>
            <DoorSignal />
            <h2>
              Nothing public yet. The first projects
              <br /> are still being built behind the door.
            </h2>
            <LightButton to="/auth">Enter member space ↗</LightButton>
          </div>
        </section>
      </main>
    </LightPage>
  );
}

export function LightPartnersPage() {
  return (
    <LightPage className="light-public-page light-partners-page light-partners-page--countdown">
      <main className="light-partners-main">
        <section className="light-sponsor-countdown">
          <div className="light-shell light-sponsor-countdown__inner">
            <h1>Sponsorship applications close in</h1>
            <LightSponsorCountdown />
            <a
              className="light-button light-button--large"
              href={SPONSOR_GMAIL_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Apply to sponsor ↗
            </a>
          </div>
        </section>
      </main>
    </LightPage>
  );
}
