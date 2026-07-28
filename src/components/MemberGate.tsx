import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/use-auth";

export function MemberGate({ title, children }: { title: string; children: ReactNode }) {
  const { loading, isSignedIn, isMember } = useAuth();
  if (loading) return null;
  if (isMember) return <>{children}</>;

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-10 text-center">
      <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-primary" />
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        This section is reserved for The Room members. Sign in and enter your invitation code to
        unlock the vetted factory list and member family businesses.
      </p>
      <Link
        to={isSignedIn ? "/onboarding" : "/auth"}
        className="mt-6 inline-block rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        {isSignedIn ? "Enter invitation code" : "Sign in"}
      </Link>
    </div>
  );
}
