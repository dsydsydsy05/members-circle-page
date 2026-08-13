import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { DoorSignal } from "@/components/BrandMark";
import { LightEventStudies } from "@/components/light/LightEventStudies";
import { LightPastEventStory } from "@/components/light/LightPastEventStory";
import { LightPartnerLogoGrid } from "@/components/light/LightPartnerLogoGrid";
import { LightButton, LightPage, LightPageHero } from "@/components/light/LightSite";
import { useEvents, useGuests, type EventRow } from "@/lib/use-site-content";
import { SPONSOR_GMAIL_URL } from "@/lib/contact";

export function LightAboutPage() {
  const roomIndex = [
    ["01", "A room to ask.", "Questions before pitches."],
    ["02", "People who’ve done it before.", "Experience, shared quietly."],
    ["03", "Capital, opportunities, and resources.", "The right things, opened up."],
    ["04", "Whatever you need next.", "A useful room changes with you."],
  ];

  return (
    <LightPage className="light-public-page light-about-page">
      <main>
        <article className="light-about-letter">
          <header className="light-shell light-about-letter__head">
            <div className="light-about-letter__folio">
              <span>The Room / Founding letter / 08—2026</span>
              <span>01 / About</span>
            </div>
            <div className="light-about-letter__intro">
              <div className="light-about-letter__address">
                <span>Boston, Massachusetts</span>
                <span>August, 2026</span>
                <p>
                  To founders, builders,
                  <br /> and people creating what’s next.
                </p>
              </div>
              <h1>The Room is a founder community born in Boston in 2026.</h1>
            </div>
          </header>
        </article>

        <section className="light-about-index" aria-labelledby="about-index-title">
          <div className="light-shell">
            <div className="light-about-index__head">
              <span>Filed under / The right room</span>
              <h2 id="about-index-title">What the room holds.</h2>
            </div>
            <ol className="light-about-index__list">
              {roomIndex.map(([index, title, note]) => (
                <li key={index}>
                  <span>{index}</span>
                  <h3>{title}</h3>
                  <p>{note}</p>
                  <b aria-hidden="true">↗</b>
                  {index === "02" ? (
                    <i className="light-about-index__annotation" aria-hidden="true">
                      people, not noise
                    </i>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="light-about-method" aria-labelledby="about-method-title">
          <div className="light-shell light-about-method__layout">
            <figure className="light-about-method__photo">
              <img
                src="/images/babson-college.jpg"
                alt="Babson College in Wellesley, Massachusetts"
              />
              <figcaption>
                <span>Babson College / Wellesley, Massachusetts</span>
                <span>42°18′01″N / 71°17′51″W</span>
              </figcaption>
            </figure>
            <div className="light-about-method__content">
              <span>How the room works</span>
              <h2 id="about-method-title">Useful things should reach the right people.</h2>
              <p>
                We create outside-the-box events, then open the opportunities and resources we
                receive back to the founder community.
              </p>
              <ol>
                <li>
                  <b>01</b>
                  <span>Outside-the-box events</span>
                </li>
                <li>
                  <b>02</b>
                  <span>Shared resources</span>
                </li>
                <li>
                  <b>03</b>
                  <span>Right things → Right people</span>
                </li>
              </ol>
            </div>
          </div>
        </section>

        <section className="light-about-cta">
          <div className="light-shell">
            <div className="light-kicker">
              <span>04</span>
              The door is open
            </div>
            <h2>Find the room you need.</h2>
            <LightButton to="/auth">Enter the room ↗</LightButton>
          </div>
        </section>
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
                    {guest.name.slice(0, 1)}
                  </div>
                  <div>
                    <h2>{guest.name}</h2>
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
    <LightPage className="light-public-page light-partners-page">
      <main>
        <LightPageHero
          index="01"
          eyebrow="Sponsors / Ecosystem"
          title={<>Ecosystem Partners.</>}
          copy="The organizations helping founders reach the right people, resources, and opportunities."
          tools={
            <a
              className="light-button light-button--small"
              href={SPONSOR_GMAIL_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Apply to sponsor ↗
            </a>
          }
        />
        <section className="light-partners-directory">
          <div className="light-shell">
            <LightPartnerLogoGrid />
          </div>
        </section>
      </main>
    </LightPage>
  );
}
