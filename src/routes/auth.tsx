import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · The Room" },
      { name: "description", content: "Sign in or create an account to join The Room and unlock the members-only factory list and family business directory." },
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        if (session.session) {
          navigate({ to: "/onboarding" });
        } else {
          setNotice("Check your inbox to confirm your email, then sign in.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/onboarding" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto flex max-w-md flex-col px-6 py-20">
        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">The Room</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          {mode === "signin" ? "Sign in" : "Create account"}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Email only. After signing in you'll be asked for your invitation code.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {notice && <p className="text-sm text-primary">{notice}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setNotice(null);
          }}
          className="mt-6 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          {mode === "signin" ? "No account yet? Create one" : "Already a member? Sign in"}
        </button>

        <Link to="/" className="mt-2 text-sm text-muted-foreground transition-colors hover:text-primary">
          ← Back home
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
