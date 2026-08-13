import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { LightSiteFooter, LightSiteNav } from "@/components/light/LightSite";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · The Room" },
      {
        name: "description",
        content:
          "Sign in or create an account to join The Room and unlock the members-only factory list and family business directory.",
      },
      { property: "og:title", content: "Sign in · The Room" },
      { property: "og:description", content: "Email sign-in for The Room members." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/onboarding` },
        });
        if (error) throw error;
        const { data: session } = await supabase.auth.getSession();
        if (session.session) navigate({ to: "/onboarding" });
        else setNotice("Check your inbox to confirm your email, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/onboarding" });
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const signInWithGoogle = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/onboarding`,
      });
      if (result.error) {
        setError(result.error.message ?? "Google sign-in failed");
        return;
      }
      if (!result.redirected) navigate({ to: "/onboarding" });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="theme-light">
      <div className="light-auth-page">
        <LightSiteNav />
        <main className="light-auth-main">
          <section className="light-auth-file">
            <header className="light-auth-file__head">
              <div className="light-auth-file__kicker">The Room</div>
              <h1>{mode === "signin" ? "Sign in" : "Create account"}</h1>
              <p>
                Continue with Google or email. After signing in you'll be asked for your invitation
                code.
              </p>
            </header>

            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={busy}
              className="light-auth-google"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path
                  fill="#EA4335"
                  d="M12 10.2v3.9h5.5a4.7 4.7 0 0 1-2 3.1l3.2 2.5c1.9-1.7 3-4.3 3-7.3 0-.7-.1-1.4-.2-2H12z"
                />
                <path
                  fill="#34A853"
                  d="M6.6 14.3 5.9 14l-2.3 1.8A9 9 0 0 0 12 21c2.4 0 4.5-.8 6-2.2l-3.2-2.5c-.8.6-1.9.9-2.8.9-2.3 0-4.3-1.5-5-3.6z"
                />
                <path
                  fill="#FBBC05"
                  d="M3.6 8.2A9 9 0 0 0 3 12c0 1.4.3 2.7.9 3.8L6.6 13a5.4 5.4 0 0 1 0-3.4z"
                />
                <path
                  fill="#4285F4"
                  d="M12 6.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6A9 9 0 0 0 3.6 8.2L6.6 10c.7-2.1 2.7-3.4 5.4-3.4z"
                />
              </svg>
              Continue with Google
            </button>

            <div className="light-auth-divider">
              <span />
              or
              <span />
            </div>

            <form onSubmit={submit} className="light-auth-form">
              <div>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@email.com"
                />
              </div>
              <div>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                />
              </div>
              {error ? (
                <p className="light-auth-message light-auth-message--error">{error}</p>
              ) : null}
              {notice ? <p className="light-auth-message">{notice}</p> : null}
              <button type="submit" disabled={busy} className="light-auth-submit">
                {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </form>

            <div className="light-auth-file__links">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "signin" ? "signup" : "signin");
                  setError(null);
                  setNotice(null);
                }}
              >
                {mode === "signin" ? "No account yet? Create one" : "Already a member? Sign in"}
              </button>
              <Link to="/">← Back home</Link>
            </div>
          </section>
        </main>
        <LightSiteFooter />
      </div>
    </div>
  );
}
