import type { ReactNode } from "react";
import { useMember } from "@/lib/use-member";

export function MemberGate({ title, children }: { title: string; children: ReactNode }) {
  const { isMember, join, hydrated } = useMember();
  if (!hydrated) return null;
  if (isMember) return <>{children}</>;
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-10 text-center">
      <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-[color:var(--cocoa)]" />
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        This section is reserved for Insider members. Join to unlock the vetted factory list,
        member family businesses, and event RSVPs.
      </p>
      <button
        onClick={join}
        className="mt-6 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Become a member
      </button>
    </div>
  );
}
