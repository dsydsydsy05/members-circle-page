import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AvatarUploader } from "@/components/AvatarUploader";
import { FamilyBusinessSection } from "@/components/FamilyBusinessSection";
import { MemberPortalShell } from "@/components/light/LightMemberPortal";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { safeNfcReturnPath } from "@/lib/safe-return";

type OnboardingSearch = {
  next?: string;
};

export const Route = createFileRoute("/onboarding")({
  validateSearch: (search: Record<string, unknown>): OnboardingSearch => ({
    next: safeNfcReturnPath(search.next, "/members"),
  }),
  head: () => ({
    meta: [
      { title: "Your member card · The Room" },
      {
        name: "description",
        content: "Apply for membership in The Room and set up your member card.",
      },
      { property: "og:title", content: "Your member card · The Room" },
      {
        property: "og:description",
        content: "Membership application and member card for The Room.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const next = safeNfcReturnPath(search.next, "/members");
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
            Create an account first, then complete your membership application.
          </p>
          <Link
            to="/auth"
            search={{ mode: "signup", next: "/onboarding" }}
            className="mt-6 inline-block rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Create account
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
        <ChallengeCallout />
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
            accountEmail={email ?? ""}
            onSaved={async () => {
              await refresh();
              window.location.assign(next);
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
  const [form, setForm] = useState({
    name: initialName,
    school: "",
    position: "",
    startup: "",
    linkedin: "",
    reason: "",
  });
  const [codeBusy, setCodeBusy] = useState(false);
  const [appBusy, setAppBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [appMessage, setAppMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: application, isLoading: appLoading } = useQuery({
    queryKey: ["member-application"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waitlist_entries")
        .select("id, full_name, email, status, school, position, startup, linkedin_url, reason")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    retry: false,
  });

  useEffect(() => {
    if (!application) return;
    setForm((f) => ({
      name: application.full_name || f.name,
      school: application.school ?? f.school,
      position: application.position ?? f.position,
      startup: application.startup ?? f.startup,
      linkedin: application.linkedin_url ?? f.linkedin,
      reason: application.reason ?? f.reason,
    }));
  }, [application]);

  const set =
    (key: keyof typeof form, max: number) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: event.target.value.slice(0, max) }));

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

  const submitApplication = async (event: React.FormEvent) => {
    event.preventDefault();
    const linkedinUrl = normalizeLinkedIn(form.linkedin);
    if (!linkedinUrl) return setAppMessage("Enter a valid LinkedIn profile URL.");
    if (Object.values(form).some((v) => !v.trim()))
      return setAppMessage("Please fill in every field.");
    setAppBusy(true);
    setAppMessage(null);
    const { error } = await supabase.rpc("submit_member_application", {
      _full_name: form.name,
      _school: form.school,
      _position: form.position,
      _startup: form.startup,
      _linkedin_url: linkedinUrl,
      _reason: form.reason,
    });
    if (error) {
      setAppBusy(false);
      setAppMessage(error.message);
      return;
    }
    // Best-effort admin notification; the application is already saved.
    await supabase.functions
      .invoke("submit-waitlist", { body: { fullName: form.name.trim() } })
      .catch(() => null);
    setAppBusy(false);
    setEditing(false);
    setAppMessage("Application received. We’ll email you once it’s reviewed.");
    queryClient.invalidateQueries({ queryKey: ["member-application"] });
  };

  const showForm = !application || editing || application.status === "rejected";

  return (
    <div className="light-access-sheet">
      <header className="light-access-head">
        <span>Application / The Room</span>
        <strong>Boston · 2026</strong>
      </header>

      <section className="light-access-waitlist">
        <div className="light-access-copy">
          <span>01 / Become a member</span>
          <h1>Apply to join.</h1>
          <p>
            Tell us who you are. Every application is reviewed by The Room team so the room stays
            useful and trusted.
          </p>
        </div>
        <div className="light-access-form-wrap">
          {appLoading ? (
            <p className="light-access-status">Checking your application…</p>
          ) : !showForm && application ? (
            <div className="light-access-state">
              <span>
                Status / {application.status === "approved" ? "Approved" : "Under review"}
              </span>
              <strong>{application.full_name}</strong>
              <p>{application.email}</p>
              <p>
                {application.status === "approved"
                  ? "Your membership has been approved."
                  : "Your application is with The Room team."}
              </p>
              {application.status === "pending" ? (
                <button
                  type="button"
                  className="light-access-skip"
                  onClick={() => setEditing(true)}
                >
                  Edit application →
                </button>
              ) : null}
            </div>
          ) : (
            <form onSubmit={submitApplication} className="light-access-form">
              {application?.status === "rejected" ? (
                <p className="light-access-status">
                  Your previous application was not accepted. You may update and resubmit it.
                </p>
              ) : null}
              <label htmlFor="app-name">Full name</label>
              <input
                id="app-name"
                value={form.name}
                onChange={set("name", 80)}
                autoComplete="name"
                required
              />
              <label htmlFor="app-email">Email</label>
              <input id="app-email" value={email} readOnly aria-readonly="true" />
              <label htmlFor="app-school">School</label>
              <input
                id="app-school"
                value={form.school}
                onChange={set("school", 120)}
                placeholder="e.g. Harvard, MIT"
                required
              />
              <label htmlFor="app-position">Current role</label>
              <input
                id="app-position"
                value={form.position}
                onChange={set("position", 120)}
                placeholder="e.g. Founder & CEO"
                required
              />
              <label htmlFor="app-startup">Company / what you’re working on</label>
              <input
                id="app-startup"
                value={form.startup}
                onChange={set("startup", 120)}
                required
              />
              <label htmlFor="app-linkedin">LinkedIn</label>
              <input
                id="app-linkedin"
                value={form.linkedin}
                onChange={set("linkedin", 300)}
                placeholder="linkedin.com/in/yourname"
                required
              />
              <label htmlFor="app-reason">Why do you want to join The Room?</label>
              <textarea
                id="app-reason"
                value={form.reason}
                onChange={set("reason", 2000)}
                rows={5}
                required
              />
              <button type="submit" disabled={appBusy}>
                {appBusy ? "Submitting…" : "Submit application ↗"}
              </button>
            </form>
          )}
          {appMessage ? (
            <p className="light-access-status" role="status">
              {appMessage}
            </p>
          ) : null}
        </div>
      </section>

      <section className="light-access-invite">
        <div>
          <span>02 / Already invited</span>
          <h2>Have a code?</h2>
          <p>An invitation code unlocks membership right away, without review.</p>
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
  linkedin_url: string | null;
  conversation_topics?: string | null;
  tags: string[];
  about: string | null;
} | null;

function normalizeLinkedIn(value: string) {
  const clean = value.trim();
  if (!clean) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(clean) ? clean : `https://${clean}`);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (host !== "linkedin.com" && !host.endsWith(".linkedin.com")) return undefined;
    url.protocol = "https:";
    return url.toString();
  } catch {
    return undefined;
  }
}

function ProfileForm({
  initial,
  accountEmail,
  onSaved,
}: {
  initial: ProfileLike;
  accountEmail: string;
  onSaved: () => void;
}) {
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState(initial?.full_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initial?.avatar_url ?? "");
  const [school, setSchool] = useState(initial?.school ?? "");
  const [startup, setStartup] = useState(initial?.startup ?? "");
  const [position, setPosition] = useState(initial?.position ?? "");
  const [website, setWebsite] = useState(initial?.website ?? "");
  const [linkedin, setLinkedin] = useState(initial?.linkedin_url ?? "");
  const [contactEmail, setContactEmail] = useState("");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [topics, setTopics] = useState(initial?.conversation_topics ?? "");
  const [about, setAbout] = useState(initial?.about ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadPrivateContact = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return;
      const { data } = await supabase
        .from("member_private_contacts")
        .select("email")
        .eq("profile_id", uid)
        .maybeSingle();
      if (!cancelled && data?.email) setContactEmail(data.email);
    };
    void loadPrivateContact();
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Your name is required.");
      return;
    }
    const linkedinUrl = normalizeLinkedIn(linkedin);
    if (linkedinUrl === undefined) {
      setError("Enter a valid LinkedIn profile URL.");
      return;
    }
    const cleanContactEmail = contactEmail.trim().toLowerCase();
    if (
      cleanContactEmail &&
      (cleanContactEmail.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanContactEmail))
    ) {
      setError("Enter a valid contact email.");
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
        linkedin_url: linkedinUrl,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .slice(0, 6),
        conversation_topics: topics.trim().slice(0, 400) || null,
        about: about.trim().slice(0, 400) || null,
        onboarded: true,
      })
      .eq("id", uid);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }

    const contactResult = cleanContactEmail
      ? await supabase.from("member_private_contacts").upsert({
          profile_id: uid,
          email: cleanContactEmail,
        })
      : await supabase.from("member_private_contacts").delete().eq("profile_id", uid);
    setBusy(false);
    if (contactResult.error) {
      setError(contactResult.error.message);
    } else {
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

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="linkedin" className={label}>
              LinkedIn
            </label>
            <input
              id="linkedin"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className={field}
              placeholder="linkedin.com/in/your-name"
              autoComplete="url"
              maxLength={500}
            />
          </div>
          <div>
            <label htmlFor="contact-email" className={label}>
              Contact email (protected)
            </label>
            <input
              id="contact-email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className={field}
              placeholder="you@email.com"
              autoComplete="email"
              maxLength={320}
            />
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Only members you connect with can view this email. Sending or accepting a request
              authorizes mutual sharing. Your login email is not shared automatically.
            </p>
          </div>
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

        <div>
          <label htmlFor="conversation-topics" className={label}>
            I’d love to talk about
          </label>
          <textarea
            id="conversation-topics"
            className={field}
            rows={3}
            maxLength={400}
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
            placeholder="A challenge, an interest, or an idea you’d like to explore."
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
