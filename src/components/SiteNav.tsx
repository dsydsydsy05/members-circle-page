import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth, signOut } from "@/lib/use-auth";
import { useIsAdmin } from "@/lib/use-admin";
import { BrandMark } from "@/components/BrandMark";

const publicLinks = [
  { to: "/about", label: "About" },
  { to: "/projects", label: "Projects" },
  { to: "/events", label: "Events" },
] as const;

const memberLinks = [
  { to: "/members", label: "Directory" },
  { to: "/resources", label: "Factory List" },
  { to: "/businesses", label: "Family Business" },
  { to: "/events", label: "Events" },
] as const;

export function SiteNav({
  space = "public",
  tone = "dark",
}: {
  space?: "public" | "member";
  tone?: "dark" | "light";
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { loading, isSignedIn, isMember } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const links = space === "member" ? memberLinks : publicLinks;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    await signOut();
    queryClient.clear();
    navigate({ to: "/", replace: true });
  };

  return (
    <header
      className={`site-nav ${tone === "light" ? "site-nav--light" : ""} ${scrolled ? "site-nav--scrolled" : ""}`}
    >
      <div className="site-nav__inner">
        <Link to="/" aria-label="The Room — home" className="site-nav__brand">
          <BrandMark className="h-auto w-[146px]" />
        </Link>

        <nav
          className="site-nav__links"
          aria-label={space === "member" ? "Member space" : "Primary"}
        >
          {space === "member" && <span className="site-nav__space-label">Member space</span>}
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="site-nav__link"
              activeProps={{ className: "site-nav__link site-nav__link--active" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="site-nav__actions">
          {!loading && isSignedIn ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="utility-link">
                  Admin
                </Link>
              )}
              <Link to="/onboarding" className="utility-link">
                {isMember ? "My pass" : "Enter code"}
              </Link>
              <button type="button" onClick={handleSignOut} className="utility-link">
                Sign out
              </button>
            </>
          ) : (
            <Link to="/auth" className="utility-link">
              Member sign in
            </Link>
          )}
          <Link to="/auth" className="signal-link">
            Enter <span aria-hidden="true">↗</span>
          </Link>
          <button
            type="button"
            className="menu-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className={`mobile-menu ${menuOpen ? "mobile-menu--open" : ""}`} aria-hidden={!menuOpen}>
        <nav aria-label="Mobile navigation">
          {publicLinks.map((link, index) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="mobile-menu__link"
            >
              <span>0{index + 1}</span>
              {link.label}
            </Link>
          ))}
          <Link to="/members" onClick={() => setMenuOpen(false)} className="mobile-menu__link">
            <span>04</span>Members
          </Link>
          {isMember && (
            <Link to="/resources" onClick={() => setMenuOpen(false)} className="mobile-menu__link">
              <span>05</span>Member space
            </Link>
          )}
        </nav>
        <Link to="/auth" onClick={() => setMenuOpen(false)} className="mobile-menu__enter">
          Enter the room ↗
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <BrandMark className="h-auto w-[180px]" />
        <p>
          Private by design.
          <br />
          Builder-first by choice.
        </p>
      </div>
      <div className="site-footer__bottom">
        <span>© {new Date().getFullYear()} The Room</span>
        <div>
          <Link to="/about">About</Link>
          <Link to="/members">Members</Link>
          <Link to="/partners">Partners</Link>
          <Link to="/auth">Member sign in</Link>
        </div>
      </div>
    </footer>
  );
}
