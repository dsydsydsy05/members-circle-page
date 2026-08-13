import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LiquidGlassButton } from "@/components/LiquidGlassButton";
import { useAuth, signOut } from "@/lib/use-auth";
import { useIsAdmin } from "@/lib/use-admin";

const spaceLinks = [
  { to: "/members", label: "Directory" },
  { to: "/resources", label: "Factory List" },
  { to: "/businesses", label: "Family Business" },
] as const;

/** Navigation used only inside the final light Member Space. */
export function SiteNav({
  tone: _tone = "light",
  space: _space = "member",
}: {
  tone?: "dark" | "light";
  space?: "public" | "member";
}) {
  const [scrolled, setScrolled] = useState(false);
  const { loading, isSignedIn, isMember } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 18);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    await signOut();
    queryClient.clear();
    navigate({ to: "/", replace: true });
  };

  return (
    <header
      className={`site-nav site-nav--light site-nav--space ${scrolled ? "site-nav--scrolled" : ""}`}
    >
      <div className="site-nav__inner">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="site-nav__back"
          aria-label="Back to The Room"
        >
          <span aria-hidden="true">←</span>
        </button>

        <nav className="site-nav__links site-nav__links--space" aria-label="Member space">
          {spaceLinks.map((link) => (
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
              {isAdmin ? (
                <Link to="/admin" className="utility-link">
                  Admin
                </Link>
              ) : null}
              <button type="button" onClick={handleSignOut} className="utility-link">
                Sign out
              </button>
            </>
          ) : null}
          <LiquidGlassButton to={isSignedIn ? "/onboarding" : "/auth"}>
            {isSignedIn ? (isMember ? "My pass" : "Enter code") : "Enter"}{" "}
            <span aria-hidden="true">↗</span>
          </LiquidGlassButton>
        </div>
      </div>
    </header>
  );
}
