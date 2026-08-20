import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { LightSiteFooter, LightSiteNav } from "@/components/light/LightSite";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/waitlist")({
  head: () => ({
    meta: [
      { title: "Join the waitlist · The Room" },
      {
        name: "description",
        content:
          "Apply to join The Room. No account is required until your application is approved.",
      },
      { property: "og:title", content: "Join the waitlist · The Room" },
      {
        property: "og:description",
        content: "Tell us who you are. The Room reviews every membership application.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PublicWaitlistPage,
});

function PublicWaitlistPage() {
  const { email: accountEmail, isSignedIn } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (accountEmail) setEmail(accountEmail);
  }, [accountEmail]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanName || !cleanEmail) return;

    setBusy(true);
    setError(null);
    const { error: submitError } = await supabase.functions.invoke("submit-waitlist", {
      body: { fullName: cleanName, email: cleanEmail, website },
    });
    setBusy(false);

    if (submitError) {
      setError("We couldn’t send your application. Please try again in a moment.");
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="theme-light">
      <div className="light-auth-page">
        <LightSiteNav />
        <main className="light-public-waitlist">
          <section className="light-public-waitlist__sheet">
            <header className="light-access-head">
              <span>Application / The Room</span>
              <strong>Boston · 2026</strong>
            </header>

            <div className="light-public-waitlist__body">
              <div className="light-access-copy">
                <span>Membership / Open</span>
                <h1>Join the waitlist.</h1>
                <p>
                  Tell us who you are. We review every request so the room stays useful, trusted and
                  intentionally small.
                </p>
              </div>

              <div className="light-access-form-wrap">
                {submitted ? (
                  <div className="light-public-waitlist__confirmation" aria-live="polite">
                    <span>Application received</span>
                    <strong>We’ll write to you.</strong>
                    <p>
                      If approved, sign in with <b>{email}</b>. That same email will activate your
                      Member access automatically.
                    </p>
                    <Link to="/">Return home →</Link>
                  </div>
                ) : (
                  <form onSubmit={submit} className="light-access-form">
                    <label htmlFor="public-waitlist-name">Name</label>
                    <input
                      id="public-waitlist-name"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value.slice(0, 80))}
                      placeholder="Your full name"
                      autoComplete="name"
                      required
                    />
                    <label htmlFor="public-waitlist-email">Email</label>
                    <input
                      id="public-waitlist-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value.slice(0, 320))}
                      placeholder="you@email.com"
                      autoComplete="email"
                      readOnly={Boolean(accountEmail)}
                      aria-readonly={Boolean(accountEmail)}
                      required
                    />
                    <div className="light-public-waitlist__honeypot" aria-hidden="true">
                      <label htmlFor="public-waitlist-website">Website</label>
                      <input
                        id="public-waitlist-website"
                        value={website}
                        onChange={(event) => setWebsite(event.target.value)}
                        tabIndex={-1}
                        autoComplete="off"
                      />
                    </div>
                    <button type="submit" disabled={busy}>
                      {busy ? "Sending…" : "Join waitlist ↗"}
                    </button>
                    {error ? (
                      <p className="light-access-status" role="alert">
                        {error}
                      </p>
                    ) : null}
                  </form>
                )}
              </div>
            </div>

            <footer className="light-public-waitlist__foot">
              <span>No account required to apply.</span>
              <Link to={isSignedIn ? "/onboarding" : "/auth"}>
                {isSignedIn ? "View access status" : "Already approved? Sign in"} ↗
              </Link>
            </footer>
          </section>
        </main>
        <LightSiteFooter />
      </div>
    </div>
  );
}
