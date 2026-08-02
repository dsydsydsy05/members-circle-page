import { createFileRoute } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { type Partner } from "@/lib/partners-data";
import { usePartners } from "@/lib/use-site-content";

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: "Partners — The Room" },
      {
        name: "description",
        content:
          "Partners, communities and media powering the The Room community.",
      },
      { property: "og:title", content: "Partners — The Room" },
      {
        property: "og:description",
        content: "The brands, communities and media backing our members.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PartnersPage,
});

function PartnerLogo({ partner }: { partner: Partner }) {
  const hasLogo = !!partner.logoUrl;
  return (
    <a
      href={partner.url}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col items-center justify-start gap-3 text-center select-none"
    >
      {hasLogo ? (
        <img
          src={partner.logoUrl ?? undefined}
          alt={`${partner.name} logo`}
          className="h-24 w-auto max-w-[90%] object-contain brightness-0 invert transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-24 w-24 items-center justify-center text-xl font-semibold tracking-tight text-white/80">
          {partner.name.replace(/[^A-Z]/g, "").slice(0, 2) || "IC"}
        </div>
      )}
      <div className="text-xs font-medium tracking-tight text-white/70 group-hover:text-white">
        {partner.name}
      </div>
    </a>
  );
}

function PartnersPage() {
  const { data: rows = [] } = usePartners();
  const partners: Partner[] = rows.map((p) => ({
    id: p.id,
    name: p.name,
    tier: p.tier as Partner["tier"],
    blurb: p.blurb,
    url: p.url ?? "#",
    logoUrl: p.logo_url,
  }));

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="text-xs uppercase tracking-[0.24em] text-primary">
          Community
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Partners, Communities & Media
        </h1>

        <div className="mt-16 grid grid-cols-3 gap-x-6 gap-y-12 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {partners.map((p) => (
            <PartnerLogo key={p.id} partner={p} />
          ))}
        </div>

        <div className="mt-20 text-center">
          <a
            href="mailto:partners@theroom.community"
            className="inline-block rounded-full border border-primary/50 px-6 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            Become a partner
          </a>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
