import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AvatarUploader } from "@/components/AvatarUploader";
import { FamilyBusinessSection } from "@/components/FamilyBusinessSection";
import { MemberPortalShell } from "@/components/light/LightMemberPortal";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Your member card · The Room" },
      {
        name: "description",
        content:
          "Enter your invitation code and fill in the details that appear on your The Room member card.",
      },
      { property: "og:title", content: "Your member card · The Room" },
      {
        property: "og:description",
        content: "Invitation code and member card details for The Room.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
  const { loading, isSignedIn, isMember, profile, email, refresh } = useAuth();
  const [step, setStep] = useState<"code" | "form">("code");

  useEffect(() => {
    if (isMember) setStep("form");
  }, [isMember]);

  if (loading) {
    return (
      <MemberPortalShell className="portal-page">
        <main className="light-member-main mx-auto max-w-xl px-6 py-24 text-sm text-muted-foreground">
          Loading…
        </main>
      </MemberPortalShell>
    );
  }

  if (!isSignedIn) {
    return (
      <MemberPortalShell className="portal-page">
        <main className="light-member-main mx-auto max-w-xl px-6 py-24 text-center">
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
      </MemberPortalShell>
    );
  }

  return (
    <MemberPortalShell className="portal-page">
      <main
        className={`light-member-main mx-auto max-w-6xl px-6 py-16 ${step === "code" ? "light-access-main" : ""}`}
      >
        {step === "code" ? (
          <AccessStep
            email={email ?? ""}
            initialName={profile?.full_name ?? ""}
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
    </MemberPortalShell>
  );
}

function AccessStep({
  email,
  initialName,
  onSuccess,
  onSkip,
}: {
  email: string;
  initialName: string;
  onSuccess: () => void;
  onSkip: () => void;
}) {
  const [code, setCode] = useState("");
  const [name, setName] = useState(initialName);
  const [codeBusy, setCodeBusy] = useState(false);
  const [waitlistBusy, setWaitlistBusy] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [waitlistMessage, setWaitlistMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    data: waitlist,
    isLoading: waitlistLoading,
    error: waitlistError,
  } = useQuery({
    queryKey: ["waitlist-entry"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waitlist_entries")
        .select("id, full_name, email, status, created_at")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    retry: false,
  });

  useEffect(() => {
    if (waitlist?.full_name) setName(waitlist.full_name);
  }, [waitlist?.full_name]);

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeBusy(true);
    setCodeError(null);
    const { data, error } = await supabase.rpc("redeem_invitation_code", { _code: code });
    setCodeBusy(false);
    if (error) {
      setCodeError(error.message);
      return;
    }
    if (data === true) onSuccess();
    else setCodeError("That invitation code isn't valid.");
  };

  const submitWaitlist = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return setWaitlistMessage("Your name is required.");
    setWaitlistBusy(true);
    setWaitlistMessage(null);
    const { data, error } = await supabase.functions.invoke("submit-waitlist", {
      body: { fullName: cleanName },
    });
    setWaitlistBusy(false);
    if (error) {
      setWaitlistMessage(
        error.message.includes("non-2xx")
          ? "Waitlist email notifications are prepared locally and will open after the Edge Function is deployed."
          : error.message,
      );
      return;
    }
    setWaitlistMessage("You are on the list. We’ll write when there is a room for you.");
    queryClient.setQueryData(["waitlist-entry"], data.entry);
  };

  return (
    <div className="light-access-sheet">
      <header className="light-access-head">
        <span>Access / The Room</span>
        <strong>Boston · 2026</strong>
      </header>

      <section className="light-access-waitlist">
        <div className="light-access-copy">
          <span>01 / Become a member</span>
          <h1>Join the waitlist.</h1>
          <p>
            Tell us who you are. We review each request so the room stays useful, trusted and
            intentionally small.
          </p>
        </div>
        <div className="light-access-form-wrap">
          {waitlistLoading ? (
            <p className="light-access-status">Checking your place…</p>
          ) : waitlist ? (
            <div className="light-access-state">
              <span>Status / {waitlist.status}</span>
              <strong>{waitlist.full_name}</strong>
              <p>{waitlist.email}</p>
              <p>
                {waitlist.status === "approved"
                  ? "Your membership has been approved."
                  : waitlist.status === "rejected"
                    ? "This request is closed. You can still use an invitation code below."
                    : "Your request is with The Room team."}
              </p>
            </div>
          ) : (
            <form onSubmit={submitWaitlist} className="light-access-form">
              <label htmlFor="waitlist-name">Name</label>
              <input
                id="waitlist-name"
                value={name}
                onChange={(event) => setName(event.target.value.slice(0, 80))}
                placeholder="Your full name"
                autoComplete="name"
                required
              />
              <label htmlFor="waitlist-email">Email</label>
              <input id="waitlist-email" value={email} readOnly aria-readonly="true" />
              <button type="submit" disabled={waitlistBusy}>
                {waitlistBusy ? "Joining…" : "Join waitlist ↗"}
              </button>
            </form>
          )}
          {waitlistError ? (
            <p className="light-access-status">
              Waitlist will become available when the local database migration is applied.
            </p>
          ) : null}
          {waitlistMessage ? <p className="light-access-status">{waitlistMessage}</p> : null}
        </div>
      </section>

      <section className="light-access-invite">
        <div>
          <span>02 / Already invited</span>
          <h2>Have a code?</h2>
          <p>Invitation access remains separate from the waitlist and unlocks membership now.</p>
        </div>
        <form onSubmit={submitCode}>
          <label htmlFor="invitation-code">Invitation code</label>
          <div>
            <input
              id="invitation-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Enter your code"
              autoComplete="off"
              required
            />
            <button type="submit" disabled={codeBusy}>
              {codeBusy ? "Checking…" : "Unlock ↗"}
            </button>
          </div>
          {codeError ? <p className="light-access-status">{codeError}</p> : null}
        </form>
      </section>

      <button type="button" onClick={onSkip} className="light-access-skip">
        Continue without membership →
      </button>
    </div>
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
  const queryClient = useQueryClient();
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
    else {
      void supabase.functions
        .invoke("refresh-member-embedding", { body: { profileId: uid } })
        .catch(() => undefined);
      await queryClient.invalidateQueries({ queryKey: ["community-profiles"] });
      await queryClient.invalidateQueries({ queryKey: ["member-count"] });
      onSaved();
    }
  };

  const field =
    "mt-1 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary";
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
          <label htmlFor="name" className={label}>
            Name *
          </label>
          <input
            id="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={field}
            maxLength={80}
          />
        </div>

        <AvatarUploader value={avatarUrl} onChange={setAvatarUrl} />

        <div>
          <label htmlFor="school" className={label}>
            School
          </label>
          <input
            id="school"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            className={field}
            maxLength={120}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="startup" className={label}>
              Startup (optional)
            </label>
            <input
              id="startup"
              value={startup}
              onChange={(e) => setStartup(e.target.value)}
              className={field}
              maxLength={120}
            />
          </div>
          <div>
            <label htmlFor="position" className={label}>
              Position (optional)
            </label>
            <input
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className={field}
              maxLength={120}
            />
          </div>
        </div>

        <div>
          <label htmlFor="website" className={label}>
            Website
          </label>
          <input
            id="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className={field}
            placeholder="https://…"
            maxLength={300}
          />
        </div>

        <div>
          <label htmlFor="tags" className={label}>
            Tags (comma separated)
          </label>
          <input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className={field}
            placeholder="Design, DTC, Founder"
          />
        </div>

        <div>
          <label htmlFor="about" className={label}>
            About — two sentences
          </label>
          <textarea
            id="about"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            rows={3}
            maxLength={400}
            className={field}
          />
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
