import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/SiteNav";
import { BrandMark, DoorSignal } from "@/components/BrandMark";
import { usePartners } from "@/lib/use-site-content";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About · The Room" },
      {
        name: "description",
        content:
          "Why The Room exists, how it works, and the principles behind this private builder community.",
      },
      { property: "og:title", content: "About · The Room" },
      { property: "og:description", content: "Private by design. Builder-first by choice." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://theroomcommunity.org/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { data: partners = [] } = usePartners();
  const verifiedPartners = partners.filter(
    (partner) => partner.url && !partner.url.includes("example.com"),
  );
  return (
    <div className="depth-page">
      <SiteNav tone="light" />
      <main>
        <header className="depth-hero">
          <div className="page-shell depth-hero__grid">
            <div className="eyebrow">About / The Room</div>
            <div className="depth-hero__main">
              <h1 className="editorial-title">Built for the conversations that need less noise.</h1>
              <p>
                The Room is a private community for founders, builders and operators. It is designed
                around access, trust and the work itself.
              </p>
            </div>
          </div>
        </header>

        <section className="page-section">
          <div className="page-shell grid gap-16 lg:grid-cols-[1fr_2fr]">
            <div className="eyebrow">Why the room</div>
            <div>
              <h2 className="section-title">Private by design.</h2>
              <div className="mt-16 grid gap-px bg-black/20 border border-black/20 md:grid-cols-3">
                {[
                  ["01", "Builders first", "Back people doing hard, important things."],
                  ["02", "Real work only", "Depth over noise. Signal over hype."],
                  ["03", "Open dialogue", "Share, learn and move forward."],
                ].map(([no, title, copy]) => (
                  <article key={no} className="min-h-64 bg-[var(--paper-bright)] p-6">
                    <div className="text-[10px] font-semibold tracking-[.16em] text-[var(--signal)]">
                      {no}
                    </div>
                    <h3 className="mt-20 text-2xl font-medium tracking-[-.04em]">{title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-black/55">{copy}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="page-section bg-[var(--charcoal)] text-[var(--paper)]">
          <div className="page-shell grid gap-12 lg:grid-cols-2">
            <div>
              <div className="eyebrow">How it works</div>
              <h2 className="section-title mt-8">
                Identity.
                <br />
                Entry.
                <br />
                <span className="text-[var(--signal)]">Signal.</span>
              </h2>
            </div>
            <div className="relative min-h-[520px] overflow-hidden border border-white/15">
              <DoorSignal className="absolute inset-[10%] text-[var(--signal)]" />
              <div className="absolute bottom-6 left-6 right-6 flex justify-between border-t border-white/15 pt-4 text-[10px] uppercase tracking-[.15em] text-white/45">
                <span>Member pass / who you are</span>
                <span>Door / where you enter</span>
                <span>Light / what matters</span>
              </div>
            </div>
          </div>
        </section>

        {verifiedPartners.length > 0 && (
          <section className="page-section">
            <div className="page-shell">
              <div className="eyebrow">Partners / Verified</div>
              <div className="mt-12 border-y border-black/20">
                {verifiedPartners.map((partner) => (
                  <a
                    key={partner.id}
                    href={partner.url ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="grid gap-4 border-b border-black/20 py-6 last:border-b-0 md:grid-cols-[1fr_2fr_auto]"
                  >
                    <strong className="text-2xl tracking-[-.04em]">{partner.name}</strong>
                    <span className="text-sm text-black/55">{partner.blurb}</span>
                    <span>↗</span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="page-section border-t border-black/20">
          <div className="page-shell flex flex-col items-start justify-between gap-10 md:flex-row md:items-end">
            <div>
              <BrandMark className="w-48 text-[var(--signal)]" />
              <h2 className="section-title mt-10">Inside starts here.</h2>
            </div>
            <Link to="/auth" className="signal-link">
              Enter the room ↗
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
