import { LockKeyhole } from "lucide-react";
import { MemberPortalShell } from "@/components/light/LightMemberPortal";

export function LockedDirectoryPage({ title }: { title: string }) {
  return (
    <MemberPortalShell className="portal-page">
      <main className="light-member-main flex min-h-[70svh] flex-col items-center justify-center px-5 py-16 text-center">
        <LockKeyhole className="mb-7 size-9 text-primary" strokeWidth={1.4} aria-hidden="true" />
        <p className="mb-4 font-mono text-xs uppercase text-muted-foreground">Members only</p>
        <h1 className="font-display text-3xl font-medium leading-tight sm:text-5xl">{title}</h1>
        <p className="mt-6 text-lg text-foreground">Coming soon</p>
        <p className="mt-2 text-sm text-muted-foreground">Opening to members soon.</p>
      </main>
    </MemberPortalShell>
  );
}