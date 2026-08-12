import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth, signOut } from "@/lib/use-auth";
import { useIsAdmin } from "@/lib/use-admin";
import logo from "@/assets/the-room-logo-transparent.png.asset.json";


const links = [
  { to: "/", label: "Home" },
  { to: "/members", label: "Members" },
  { to: "/guests", label: "Guests" },
  { to: "/events", label: "Events" },
  { to: "/resources", label: "Factory List" },
  { to: "/businesses", label: "Family Business" },
  { to: "/partners", label: "Partners" },
] as const;

export function SiteNav() {
  const { loading, isSignedIn, isMember } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mobileLinks: { to: string; label: string }[] = [
    ...links.map((l) => ({ to: l.to as string, label: l.label as string })),
    ...(isSignedIn ? [{ to: "/onboarding", label: isMember ? "Edit card" : "Enter code" }] : []),
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
  ];


  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    await signOut();
    queryClient.clear();
    navigate({ to: "/", replace: true });
  };

  return (
    <header className="sticky top-0 z-40 bg-transparent">
      <div className="mx-auto grid max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 sm:px-6">
        <div className="flex shrink-0 items-center">
          <Link to="/" aria-label="The Room — home" className="flex shrink-0 items-center">
            <img
              src={logo.url}
              alt="The Room"
              width={240}
              height={32}
              className="h-5 w-auto invert sm:h-6"
            />
          </Link>
        </div>
        <nav className="hidden justify-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="whitespace-nowrap text-sm text-cream/80 transition-colors hover:text-primary"
              activeProps={{ className: "whitespace-nowrap text-sm text-primary" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center justify-end gap-2">
          {!loading && isSignedIn ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden rounded-full border border-primary/50 px-3 py-1.5 text-xs text-primary transition-colors hover:bg-primary/10 sm:inline-block"
                >
                  Admin
                </Link>
              )}
              <Link
                to="/onboarding"
                className="hidden text-xs text-muted-foreground transition-colors hover:text-primary sm:inline"
              >
                {isMember ? "Member · Edit card" : "Enter code"}
              </Link>
              <button
                onClick={handleSignOut}
                className="whitespace-nowrap rounded-full border border-border px-3 py-1.5 text-xs transition-colors hover:bg-primary-foreground hover:text-primary"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="whitespace-nowrap rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-colors hover:border-white/40 hover:bg-white/20"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

      {/* Mobile section bar */}
      <nav
        aria-label="Sections"
        className="-mb-px flex gap-2 overflow-x-auto px-4 py-2 [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden"
      >
        {mobileLinks.map((l) => (
          <Link
            key={l.to}
            to={l.to as never}
            className="shrink-0 whitespace-nowrap rounded-full border border-border/70 px-3 py-1.5 text-xs text-cream/80 transition-colors"
            activeProps={{
              className:
                "shrink-0 whitespace-nowrap rounded-full border border-primary/60 bg-primary/15 px-3 py-1.5 text-xs text-primary",
            }}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60">
      <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <img
              src={logo.url}
              alt="The Room"
              width={300}
              height={40}
              className="h-5 w-auto invert"
            />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              A quieter community for founders. The right room, the right people, the right resources.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">Explore</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="transition-colors hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">Contact Us</h3>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <p>Have a question or want to partner with us?</p>
              <a
                href="mailto:theroomcommunityofficial@gmail.com"
                className="inline-flex items-center gap-2 text-foreground transition-colors hover:text-primary"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                theroomcommunityofficial@gmail.com
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border/40 pt-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} The Room. All rights reserved.</span>
          <span>Made with care. For members, by members.</span>
        </div>
      </div>
    </footer>
  );
}
