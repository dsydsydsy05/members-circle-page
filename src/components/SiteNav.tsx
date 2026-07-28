import { Link } from "@tanstack/react-router";
import { useMember } from "@/lib/use-member";
import logo from "@/assets/the-room-logo.png.asset.json";

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
  const { isMember, join, leave, hydrated } = useMember();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link to="/" aria-label="The Room — home" className="flex items-center">
          <img
            src={logo.url}
            alt="The Room"
            width={300}
            height={40}
            className="h-7 w-auto brightness-110 contrast-125"
          />
        </Link>
        <nav className="hidden gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm text-cream/80 transition-colors hover:text-primary"
              activeProps={{ className: "text-sm text-cream/80 transition-colors hover:text-primary" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {hydrated && isMember ? (
            <>
              <span className="hidden text-xs text-muted-foreground sm:inline">Member</span>
              <button
                onClick={leave}
                className="rounded-full border border-border px-3 py-1.5 text-xs transition-colors hover:bg-primary-foreground hover:text-primary"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={join}
              className="rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-foreground hover:text-primary"
            >
              Become a member
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-10 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <img
            src={logo.url}
            alt="The Room"
            width={300}
            height={40}
            className="h-5 w-auto brightness-110 contrast-125"
          />
          <span>© {new Date().getFullYear()}</span>
        </div>
        <div>Made with care. For members, by members.</div>
      </div>
    </footer>
  );
}
