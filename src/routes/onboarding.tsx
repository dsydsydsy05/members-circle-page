import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { AvatarUploader } from "@/components/AvatarUploader";
import { FamilyBusinessSection } from "@/components/FamilyBusinessSection";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Your member card · The Room" },
      { name: "description", content: "Enter your invitation code and fill in the details that appear on your The Room member card." },
      { property: "og:title", content: "Your member card · The Room" },
      { property: "og:description", content: "Invitation code and member card details for The Room." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
  const { loading, isSignedIn, isMember, profile, refresh } = useAuth();
  const [step, setStep] = useState<"code" | "form">("code");

  useEffect(() => {
    if (isMember) setStep("form");
  }, [isMember]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <SiteNav />
        <main className="mx-auto max-w-xl px-6 py-24 text-sm text-muted-foreground">Loading…</main>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen">
        <SiteNav />
        <main className="mx-auto max-w-xl px-6 py-24 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Sign in first</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            You need an account before you can enter your invitation code.
          </p>
          <Link
            to="/auth"
            className="mt-6 inline-block rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Go to sign in
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-xl px-6 py-16">
        {step === "code" ? (
          <CodeStep
            onSuccess={async () => {
              await refresh();
              setStep("form");
            }}
            onSkip={() => navigate({ to: "/" })}
          />
        ) : (
          <ProfileForm
            initial={profile}
            onSaved={async () => {
              await refresh();
              navigate({ to: "/members" });
            }}
          />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function CodeStep({ onSuccess, onSkip }: { onSuccess: () => void; onSkip: () => void }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { data, error } = await supabase.rpc("redeem_invitation_code", { _code: code });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data === true) onSuccess();
    else setError("That invitation code isn't valid.");
  };

  return (
    <>
      <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Step 1 of 2</div>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">Invitation code</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Members unlock the vetted factory list and the family business directory. You can skip this —
        you'll still be signed in, but those two sections stay locked.
      </p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter your code"
          className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm tracking-widest outline-none focus:border-primary"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Checking…" : "Unlock member access"}
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="rounded-full border border-border px-5 py-2.5 text-sm text-muted-foreground hover:text-primary"
          >
            Skip for now
          </button>
        </div>
      </form>
    </>
  );
}

type ProfileLike = {
  full_name: string | null;
  avatar_url: string | null;
  school: string | null;
  startup: string | null;
  position: string | null;
  website: string | null;
  tags: string[];
  about: string | null;
} | null;

function ProfileForm({ initial, onSaved }: { initial: ProfileLike; onSaved: () => void }) {
  const [fullName, setFullName] = useState(initial?.full_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initial?.avatar_url ?? "");
  const [school, setSchool] = useState(initial?.school ?? "");
  const [startup, setStartup] = useState(initial?.startup ?? "");
  const [position, setPosition] = useState(initial?.position ?? "");
  const [website, setWebsite] = useState(initial?.website ?? "");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [about, setAbout] = useState(initial?.about ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);







  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Your name is required.");
      return;
    }
    setBusy(true);
    setError(null);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) {
      setError("Session expired, please sign in again.");
      setBusy(false);
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim().slice(0, 80),
        avatar_url: avatarUrl.trim().slice(0, 1000) || null,
        school: school.trim().slice(0, 120) || null,
        startup: startup.trim().slice(0, 120) || null,
        position: position.trim().slice(0, 120) || null,
        website: website.trim().slice(0, 300) || null,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .slice(0, 6),
        about: about.trim().slice(0, 400) || null,
        onboarded: true,
      })
      .eq("id", uid);
    setBusy(false);
    if (error) setError(error.message);
    else onSaved();
  };

  const field = "mt-1 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary";
  const label = "text-xs uppercase tracking-wider text-muted-foreground";

  return (
    <>
      <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Step 2 of 2</div>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">Your member card</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        This is what other members see when they flip your card. Startup and position are optional.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="name" className={label}>Name *</label>
          <input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className={field} maxLength={80} />
        </div>

        <AvatarUploader value={avatarUrl} onChange={setAvatarUrl} />



        <div>
          <label htmlFor="school" className={label}>School</label>
          <input id="school" value={school} onChange={(e) => setSchool(e.target.value)} className={field} maxLength={120} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="startup" className={label}>Startup (optional)</label>
            <input id="startup" value={startup} onChange={(e) => setStartup(e.target.value)} className={field} maxLength={120} />
          </div>
          <div>
            <label htmlFor="position" className={label}>Position (optional)</label>
            <input id="position" value={position} onChange={(e) => setPosition(e.target.value)} className={field} maxLength={120} />
          </div>
        </div>

        <div>
          <label htmlFor="website" className={label}>Website</label>
          <input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} className={field} placeholder="https://…" maxLength={300} />
        </div>

        <div>
          <label htmlFor="tags" className={label}>Tags (comma separated)</label>
          <input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} className={field} placeholder="Design, DTC, Founder" />
        </div>

        <div>
          <label htmlFor="about" className={label}>About — two sentences</label>
          <textarea id="about" value={about} onChange={(e) => setAbout(e.target.value)} rows={3} maxLength={400} className={field} />
        </div>

        <FamilyBusinessSection defaultOwner={fullName} />



        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save my card"}
        </button>
      </form>
    </>
  );
}
