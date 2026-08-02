import { createFileRoute } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { tierMeta, tierOrder, type Partner, type PartnerTier } from "@/lib/partners-data";
import { usePartners } from "@/lib/use-site-content";

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: "Partners & Sponsors — The Room" },
      {
        name: "description",
        content:
          "Diamond, Platinum, Gold and Silver sponsors plus ecosystem partners powering the The Room community.",
      },
      { property: "og:title", content: "Partners & Sponsors — The Room" },
      {
        property: "og:description",
        content: "The brands, funds and studios backing our members-only community.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PartnersPage,
});

function PartnerLogo({ partner, height }: { partner: Partner; height: string }) {
  const hasLogo = !!partner.logoUrl;
  return (
    <a
      href={partner.url}
      target="_blank"
      rel="noreferrer"
      className={`group relative flex ${height} flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border border-border bg-card px-4 text-center transition-colors hover:border-primary/60 ${hasLogo ? "" : "blur-sm"} select-none`}
    >
      {hasLogo ? (
        <img
          src={partner.logoUrl ?? undefined}
          alt={`${partner.name} logo`}
          className="h-1/2 w-auto max-w-[80%] object-contain transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
          {partner.name.replace(/[^A-Z]/g, "").slice(0, 2) || "IC"}
        </div>
      )}
      <div className="text-sm font-semibold tracking-[0.18em]">{partner.name}</div>
      <div className="px-2 text-[11px] leading-snug text-muted-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {partner.blurb}
      </div>
    </a>
  );
}

function PartnersPage() {
  const { data: rows = [] } = usePartners();
  const partners: Partner[] = rows.map((p) => ({
    id: p.id,
    name: p.name,
    tier: p.tier as PartnerTier,
    blurb: p.blurb,
    url: p.url ?? "#",
    logoUrl: p.logo_url,
  }));
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
          Partners
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          Backed by people<br />who build things.
        </h1>

        <div className="mt-14 space-y-14">
          {tierOrder.map((tier) => {
            const meta = tierMeta[tier];
            const list = partners.filter((p) => p.tier === tier);
            if (!list.length) return null;
            return (
              <section key={tier}>
                <div className="mb-5 flex items-baseline justify-between gap-4 border-b border-border pb-3">
                  <h2 className="text-xl font-semibold tracking-tight">
                    {meta.label}
                    <span className="ml-2 text-xs font-normal text-primary">
                      {list.length}
                    </span>
                  </h2>
                  <div className="text-xs text-muted-foreground">{meta.note}</div>
                </div>
                <div className={`grid gap-4 ${meta.cols}`}>
                  {list.map((p) => (
                    <PartnerLogo key={p.id} partner={p} height={meta.height} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-20 rounded-2xl border border-primary/30 bg-card p-8 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Want to partner with us?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Four sponsorship tiers plus an ecosystem track for tools and communities.
          </p>
          <a
            href="mailto:partners@the room.community"
            className="mt-6 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Get the deck
          </a>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
