import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Instagram } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { GmailIcon, XiaohongshuIcon } from "@/components/SocialIcons";
import { CONTACT_EMAIL, CONTACT_GMAIL_URL } from "@/lib/contact";
import { useAuth } from "@/lib/use-auth";
import { useIsAdmin } from "@/lib/use-admin";

const links = [
  { to: "/about", label: "About" },
  { to: "/events", label: "Events" },
  { to: "/qa", label: "Q&A" },
  // Public archive. The authenticated Directory intentionally remains `/members`.
  { to: "/light/members", label: "Members" },
  { to: "/partners", label: "Ecosystem" },
] as const;

export function LightSiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [inverse, setInverse] = useState(false);
  const { isSignedIn, isMember } = useAuth();
  const { isAdmin } = useIsAdmin();

  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 18);
      const darkSection = document.querySelector<HTMLElement>("[data-nav-tone='dark']");
      if (!darkSection) {
        setInverse(false);
        return;
      }
      const rect = darkSection.getBoundingClientRect();
      setInverse(rect.top <= 92 && rect.bottom > 36);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const closeOnDesktop = () => {
      if (window.innerWidth > 900) setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeOnDesktop);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeOnDesktop);
    };
  }, [open]);

  const accountLabel = !isSignedIn ? "Enter" : isMember ? "My pass" : "Enter code";
  const accountTarget = isSignedIn ? "/onboarding" : "/auth";

  return (
    <header
      className={`light-nav ${scrolled ? "light-nav--scrolled" : ""} ${
        inverse ? "light-nav--inverse" : ""
      } ${open ? "light-nav--open" : ""}`}
    >
      <button
        type="button"
        className="light-nav__backdrop"
        aria-label="Close navigation"
        tabIndex={open ? 0 : -1}
        onClick={() => setOpen(false)}
      />
      <div className="light-shell light-nav__inner">
        <Link to="/" className="light-nav__brand" aria-label="The Room home">
          <BrandMark />
        </Link>
        <nav
          id="light-site-navigation"
          className={`light-nav__links ${isAdmin ? "light-nav__links--admin" : ""} ${
            open ? "light-nav__links--open" : ""
          }`}
        >
          {links.map((link, index) => (
            <Link
              key={link.to}
              to={link.to}
              activeProps={{ className: "light-nav__link--active" }}
              onClick={() => setOpen(false)}
            >
              <span className="light-nav__index">{String(index + 1).padStart(2, "0")}</span>
              <span>{link.label}</span>
            </Link>
          ))}
          {isAdmin ? (
            <Link to="/admin" className="light-nav__admin-link" onClick={() => setOpen(false)}>
              <span className="light-nav__index">06</span>
              <span>Admin</span>
            </Link>
          ) : null}
        </nav>
        <div className="light-nav__actions">
          <Link
            to={isSignedIn ? "/members" : "/auth"}
            className="light-button light-button--small light-nav__account light-nav__account--desktop"
            onClick={() => setOpen(false)}
          >
            {isSignedIn ? "Member space" : "Enter"} <span>↗</span>
          </Link>
          <Link
            to={accountTarget}
            className="light-button light-button--small light-nav__account light-nav__account--mobile"
            onClick={() => setOpen(false)}
          >
            {accountLabel} <span>↗</span>
          </Link>
          <button
            type="button"
            className="light-nav__menu"
            aria-label="Toggle navigation"
            aria-controls="light-site-navigation"
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
          <Link to="/qa">Q&amp;A</Link>
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
