import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LightPage } from "@/components/light/LightSite";
export const Route = createFileRoute("/guest-review")({
  head: () => ({
    meta: [
      {
        name: "description",
        content: "Review and approve your exact guest answer version for The Room.",
      },
      { property: "og:title", content: "Review your answer · The Room" },
      {
        property: "og:description",
        content: "Review and approve your exact guest answer version for The Room.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Review your answer · The Room" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "referrer", content: "no-referrer" },
    ],
  }),
  component: GuestReview,
});
type Review = {
  body: string;
  name: string;
  title: string;
  question: string;
  status: string;
  expires_at: string;
};
function GuestReview() {
  const [token, setToken] = useState(""),
    [consent, setConsent] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  useEffect(() => {
    setToken(new URLSearchParams(window.location.hash.slice(1)).get("token") || "");
  }, []);
  const query = useQuery({
    queryKey: ["guest-review", token],
    enabled: !!token,
    retry: false,
    gcTime: 0,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("room_guest_approval", { _token: token });
      if (error) throw new Error(error.message);
      return data as Review;
    },
  });
  const decide = async (decision: string) => {
    setBusy(true);
    setMessage("");
    try {
      const { error } = await supabase.rpc("room_guest_approval", {
        _token: token,
        _decision: decision,
      });
      if (error) throw new Error(error.message);
      await query.refetch();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <LightPage className="room-community">
      <main className="room-workspace room-reading">
        <span className="room-kicker">The Room / Guest review</span>
        <h1>
          Your words.
          <br />
          Your permission.
        </h1>
        <p>This private link lets you review the exact answer before The Room publishes it.</p>
        {!token ? (
          <p role="status">Open the complete private link provided by The Room.</p>
        ) : query.isLoading ? (
          <p>Opening your review…</p>
        ) : query.error ? (
          <p role="alert">{query.error.message}</p>
        ) : (
          query.data && (
            <article className="room-review">
              <span className="room-kicker">Question</span>
              <h2>{query.data.question}</h2>
              <span className="room-kicker">Your answer</span>
              <p className="room-prose">{query.data.body}</p>
              <p>
                {query.data.name} · {query.data.title}
              </p>
              {query.data.status === "pending" ? (
                <>
                  <label className="room-consent">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                    />
                    I authorize The Room to publish this exact answer with my name, title and guest
                    profile.
                  </label>
                  <div className="room-actions">
                    <button disabled={!consent || busy} onClick={() => decide("approved")}>
                      Approve this version
                    </button>
                    <button disabled={busy} onClick={() => decide("declined")}>
                      Decline publication
                    </button>
                  </div>
                  <p>
                    If you need changes, decline and ask the team for an updated version. This link
                    expires {new Date(query.data.expires_at).toLocaleDateString("en")}.
                  </p>
                </>
              ) : (
                <p role="status">
                  {query.data.status === "approved"
                    ? "Thank you. This version is approved; the team can now publish it."
                    : "Publication declined. The team will see your decision."}
                </p>
              )}
            </article>
          )
        )}
        {message && <p role="alert">{message}</p>}
      </main>
    </LightPage>
  );
}
