import { Link } from "@tanstack/react-router";
import type { CSSProperties, ReactNode } from "react";
import { usePartners, type PartnerRow } from "@/lib/use-site-content";

function PartnerItem({ partner, index }: { partner: PartnerRow; index: number }) {
  const content: ReactNode = partner.logo_url ? (
    <img src={partner.logo_url} alt="" />
  ) : (
    <strong>{partner.name}</strong>
  );
  const style = { "--logo-index": index } as CSSProperties;

  return partner.url ? (
    <a
      href={partner.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${partner.name} — visit official website`}
      style={style}
    >
      {content}
    </a>
  ) : (
    <div className="light-partner-logo-grid__item" aria-label={partner.name} style={style}>
      {content}
    </div>
  );
}

export function LightPartnerLogoGrid({ compact = false }: { compact?: boolean }) {
  const { data: partners = [], isLoading, isError } = usePartners();

  if (isLoading) {
    return (
      <div className="light-partner-logo-grid__empty light-partner-logo-grid__empty--loading">
        Loading ecosystem partners…
      </div>
    );
  }

  if (isError || partners.length === 0) {
    return (
      <div className="light-partner-logo-grid__empty">
        No ecosystem partners are currently published.
      </div>
    );
  }

  return (
    <div className={`light-partner-logo-grid${compact ? " light-partner-logo-grid--compact" : ""}`}>
      {partners.map((partner, index) => (
        <PartnerItem key={partner.id} partner={partner} index={index} />
      ))}
      {compact ? (
        <Link
          to="/partners"
          aria-label="View all ecosystem partners"
          style={{ "--logo-index": partners.length } as CSSProperties}
        >
          <span className="light-partner-logo-grid__more" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </Link>
      ) : null}
    </div>
  );
}
