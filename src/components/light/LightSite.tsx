import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Instagram } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { GmailIcon, XiaohongshuIcon } from "@/components/SocialIcons";
import { CONTACT_EMAIL, CONTACT_GMAIL_URL } from "@/lib/contact";
import { useAuth } from "@/lib/use-auth";

const links = [
  { to: "/about", label: "About" },
  { to: "/events", label: "Events" },
  // Public archive. The authenticated Directory intentionally remains `/members`.
  { to: "/light/members", label: "Members" },
  { to: "/partners", label: "Ecosystem" },
] as const;

export function LightSiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 18);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header className={`light-nav ${scrolled ? "light-nav--scrolled" : ""}`}>
      <div className="light-shell light-nav__inner">
        <Link to="/" className="light-nav__brand" aria-label="The Room home">
          <BrandMark />
        </Link>
        <nav className={`light-nav__links ${open ? "light-nav__links--open" : ""}`}>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeProps={{ className: "light-nav__link--active" }}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="light-nav__actions">
          <Link to={isSignedIn ? "/members" : "/auth"} className="light-button light-button--small">
            {isSignedIn ? "Member space" : "Enter"} <span>↗</span>
          </Link>
          <button
            type="button"
            className="light-nav__menu"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}

export function LightSiteFooter() {
  return (
    <footer className="light-footer">
      <div className="light-shell light-footer__top">
        <BrandMark className="light-footer__mark" />
        <div className="light-footer__social">
          <a
            href={CONTACT_GMAIL_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Email ${CONTACT_EMAIL} in Gmail`}
          >
            <GmailIcon />
          </a>
          <a
            href="https://www.instagram.com/theroomcommunityofficial?igsh=MXM2MmJhYjViOWxqZg%3D%3D&utm_source=qr"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <Instagram />
          </a>
          <a
            href="https://xhslink.cn/m/7PDVR1JEqmN"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="小红书"
          >
            <XiaohongshuIcon />
          </a>
        </div>
      </div>
      <div className="light-shell light-footer__bottom">
        <div className="light-footer__edition">
          <span>The Room / Light Edition 04</span>
          <span>Boston · 2026</span>
        </div>
        <nav className="light-footer__links" aria-label="Footer navigation">
          <Link to="/about">About</Link>
          <Link to="/events">Events</Link>
          <Link to="/light/members">Members</Link>
          <Link to="/partners">Ecosystem</Link>
          <Link to="/auth">Enter</Link>
        </nav>
        <span className="light-footer__copyright">© {new Date().getFullYear()} The Room</span>
      </div>
    </footer>
  );
}

export function LightPage({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`theme-light light-site ${className}`}>
      <LightSiteNav />
      {children}
      <LightSiteFooter />
    </div>
  );
}

export function LightPageHero({
  index,
  eyebrow,
  title,
  copy,
  tools,
}: {
  index: string;
  eyebrow: string;
  title: ReactNode;
  copy: string;
  tools?: ReactNode;
}) {
  return (
    <header className="light-page-hero">
      <div className="light-shell light-page-hero__grid">
        <div className="light-kicker">
          <span>{index}</span>
          {eyebrow}
        </div>
        <div className="light-page-hero__main">
          <h1>{title}</h1>
          <div className="light-page-hero__side">
            {tools}
            <p>{copy}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export function LightButton({
  to,
  children,
  inverse = false,
}: {
  to: string;
  children: ReactNode;
  inverse?: boolean;
}) {
  if (to === "/auth") {
    return (
      <Link to="/auth" className={`light-button ${inverse ? "light-button--inverse" : ""}`}>
        {children}
      </Link>
    );
  }

  return (
    <Link to={to as never} className={`light-button ${inverse ? "light-button--inverse" : ""}`}>
      {children}
    </Link>
  );
}

export function LightSectionHeader({
  index,
  label,
  title,
  action,
}: {
  index?: string;
  label?: string;
  title: ReactNode;
  action?: ReactNode;
}) {
  const hasKicker = Boolean(index || label);

  return (
    <div
      className={`light-section-head ${!hasKicker && !action ? "light-section-head--title-only" : ""}`}
    >
      {hasKicker ? (
        <div className="light-kicker">
          {index ? <span>{index}</span> : null}
          {label}
        </div>
      ) : null}
      <h2>{title}</h2>
      {action ? <div className="light-section-head__action">{action}</div> : null}
    </div>
  );
}
