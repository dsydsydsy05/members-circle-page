import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/SiteNav";
import { usePartners } from "@/lib/use-site-content";

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: "Partners · The Room" },
      { name: "description", content: "Verified organizations working with The Room." },
    ],
    links: [{ rel: "canonical", href: "https://theroomcommunity.org/partners" }],
  }),
  component: PartnersPage,
});

function PartnersPage() {
  const { data: partners = [], isLoading } = usePartners();
  const verified = partners.filter(
    (partner) => partner.url && !partner.url.includes("example.com"),
  );
  return (
    <div className="depth-page">
      <SiteNav tone="light" />
      <main>
        <header className="depth-hero">
          <div className="page-shell depth-hero__grid">
            <div className="eyebrow">Partners / Public</div>
            <div className="depth-hero__main">
              <h1 className="section-title">Built with the right people.</h1>
              <p>
                Only partners with a real, verified destination are shown. Sponsorship placeholders
                remain unpublished.
              </p>
            </div>
          </div>
        </header>
        <section className="page-section">
          <div className="page-shell">
            {isLoading ? (
              <p className="empty-truth">Loading partners…</p>
            ) : verified.length === 0 ? (
              <p className="empty-truth">No verified public partners are currently listed.</p>
            ) : (
              <div className="border-t border-black/20">
                {verified.map((partner) => (
                  <a
                    key={partner.id}
                    href={partner.url ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="grid items-center gap-5 border-b border-black/20 py-8 transition-colors hover:text-[var(--signal)] md:grid-cols-[1fr_2fr_auto]"
                  >
                    <h2 className="text-4xl font-medium tracking-[-.05em]">{partner.name}</h2>
                    <p className="text-sm text-black/50">{partner.blurb}</p>
                    <span>↗</span>
                  </a>
                ))}
              </div>
            )}
            <Link to="/about" className="text-link mt-10">
              About the room ↗
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
