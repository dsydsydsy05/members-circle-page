import { Link } from "@tanstack/react-router";
import { DEMO_PARTNERS } from "@/lib/demo-partners";

export function LightPartnerLogoGrid({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`light-partner-logo-grid${compact ? " light-partner-logo-grid--compact" : ""}`}>
      {DEMO_PARTNERS.map((partner, index) => (
        <a
          key={partner.id}
          href={partner.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${partner.name} — visit official website`}
          style={{ "--logo-index": index } as React.CSSProperties}
        >
          <img src={partner.logo_url} alt="" />
        </a>
      ))}
      {compact ? (
        <Link
          to="/partners"
          aria-label="View all ecosystem partners"
          style={{ "--logo-index": DEMO_PARTNERS.length } as React.CSSProperties}
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
