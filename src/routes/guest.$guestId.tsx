import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGuests } from "@/lib/use-site-content";
import { LightPage } from "@/components/light/LightSite";
import type { Answer } from "@/lib/community";
export const Route = createFileRoute("/guest/$guestId")({
  head: () => ({
    meta: [
      {
        name: "description",
        content: "Explore this invited guest’s published conversations in The Room.",
      },
      { property: "og:title", content: "Guest conversation · The Room" },
      {
        property: "og:description",
        content: "Explore this invited guest’s published conversations in The Room.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Guest conversation · The Room" },
    ],
  }),
  component: GuestPage,
});
function GuestPage() {
  const { guestId } = Route.useParams();
  const guests = useGuests();
  const guest = guests.data?.find((g) => g.id === guestId);
  const answers = useQuery({
    queryKey: ["guest-answers", guestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("qa_answers")
        .select("id, body, question_id, created_at")
        .eq("guest_id", guestId)
        .eq("status", "published");
      if (error) throw error;
      return data as Pick<Answer, "id" | "body" | "question_id" | "created_at">[];
    },
  });
  return (
    <LightPage className="room-community">
      <main className="room-workspace room-reading">
        <Link to="/guests">← Guest conversations</Link>
        {guests.isLoading ? (
          <p>Loading guest…</p>
        ) : guests.error ? (
          <p>Guest profiles could not be loaded.</p>
        ) : !guest ? (
          <h1>Guest not found.</h1>
        ) : (
          <>
            <header className="room-guest-heading">
              {guest.avatar_url ? (
                <img src={guest.avatar_url} alt={guest.name} />
              ) : (
                <span className="room-avatar">{guest.name.slice(0, 1)}</span>
              )}
              <div>
                <span className="room-kicker">Invited guest / The Room</span>
                <h1>{guest.name}</h1>
                <p>{guest.title}</p>
              </div>
            </header>
            {guest.bio && <p className="room-prose">{guest.bio}</p>}
            {guest.event && (
              <p>
                In conversation at {guest.event}
                {guest.date_label ? ` · ${guest.date_label}` : ""}
              </p>
            )}
            <Link to="/events">Explore our gatherings ↗</Link>
            <section className="room-answer-archive">
              <h2>In their words.</h2>
              {answers.isLoading ? (
                <p>Loading answers…</p>
              ) : answers.error ? (
                <p>Answers could not be loaded. Please try again.</p>
              ) : !answers.data?.length ? (
                <p>No answers published yet.</p>
              ) : (
                answers.data.map((a) => (
                  <article key={a.id}>
                    <p className="room-prose">{a.body}</p>
                    <Link to="/qa" hash={`question-${a.question_id}`}>
                      Read the question ↗
                    </Link>
                  </article>
                ))
              )}
            </section>
          </>
        )}
      </main>
    </LightPage>
  );
}
