import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/use-auth";
import { Lock, Sparkles } from "lucide-react";

export function MemberGate({ title, children }: { title: string; children: ReactNode }) {
  const { loading, isSignedIn, isMember } = useAuth();
  if (loading) return null;
  if (isMember) return <>{children}</>;

  const ctaLabel = isSignedIn ? "Enter invitation code" : "Sign in to unlock";
  const ctaTo = isSignedIn ? "/onboarding" : "/auth";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/60 p-8 sm:p-12">
      {/* soft ember glow behind the lock */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-primary/20 blur-[96px]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-ember/10 blur-[100px]" />

      <div className="relative flex flex-col items-center text-center">
        <div className="relative">
          <div className="absolute inset-0 animate-pulse rounded-full bg-primary/30 blur-xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/40 bg-primary/15 shadow-[0_0_40px_-12px_rgba(123,162,63,0.5)]">
            <Lock className="h-9 w-9 text-primary" strokeWidth={1.5} />
          </div>
        </div>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Members only
        </div>

        <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          This section is reserved for verified members of The Room. Sign in and enter your
          invitation code to unlock the full list.
        </p>

        <Link
          to={ctaTo}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-[0_0_32px_-8px_rgba(123,162,63,0.6)] transition-all hover:bg-primary/90 hover:shadow-[0_0_40px_-6px_rgba(123,162,63,0.7)]"
        >
          {ctaLabel}
        </Link>

        {!isSignedIn && (
          <p className="mt-4 text-xs text-muted-foreground">
            Already a member?{" "}
            <Link
              to="/auth"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
