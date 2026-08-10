import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/SiteNav";
import { useGuests } from "@/lib/use-site-content";

export const Route = createFileRoute("/guests")({
  head: () => ({
    meta: [
      { title: "Conversations · The Room" },
      { name: "description", content: "Guests invited into The Room for specific conversations." },
    ],
    links: [{ rel: "canonical", href: "https://theroomcommunity.org/guests" }],
  }),
  component: GuestsPage,
});

function GuestsPage() {
  const { data: guests = [], isLoading } = useGuests();
  const verified = guests.filter(
    (guest) =>
      guest.name.toLowerCase() !== "coming soon" && !guest.title.toLowerCase().includes("tba"),
  );

  return (
    <div className="depth-page">
      <SiteNav tone="light" />
      <main>
        <header className="depth-hero">
          <div className="page-shell depth-hero__grid">
            <div className="eyebrow">Guests / Conversations</div>
            <div className="depth-hero__main">
              <h1 className="editorial-title">People who’ve walked through the door.</h1>
              <p>
                A guest was invited into The Room. A member belongs to it. This archive records the
                conversations, not a network of names.
              </p>
            </div>
          </div>
        </header>
        <section className="page-section">
          <div className="page-shell">
            {isLoading ? (
              <p className="empty-truth">Loading conversations…</p>
            ) : verified.length === 0 ? (
              <div className="empty-truth">
                <p>
                  No verified guest conversations have been published yet. Database placeholders
                  remain hidden.
                </p>
                <Link to="/events" className="text-link mt-6">
                  See announced events ↗
                </Link>
              </div>
            ) : (
              <div className="border-t border-black/20">
                {verified.map((guest, index) => (
                  <article
                    key={guest.id}
                    className="grid gap-5 border-b border-black/20 py-8 md:grid-cols-[80px_1fr_1fr]"
                  >
                    <span className="text-xs text-[var(--signal)]">
                      /{String(index + 1).padStart(2, "0")}
                    </span>
                    <h2 className="font-editorial text-4xl">{guest.name}</h2>
                    <div>
                      <p>{guest.title}</p>
                      <p className="mt-2 text-sm text-black/45">
                        {guest.event} / {guest.date_label}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
